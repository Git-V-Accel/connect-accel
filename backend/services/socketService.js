const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_CONFIG, FRONTEND_CONFIG } = require('../constants');

class SocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map();
  }

  emitDashboardRefresh(data = {}) {
    this.emitToAll('dashboard:refresh', data);
  }

  initialize(server) {
    const { Server } = require('socket.io');
    
    this.io = new Server(server, {
      cors: {
        origin: FRONTEND_CONFIG.URL ,
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        
        if (!token) {
          return next(new Error('Authentication error: No token provided'));
        }

        const decoded = jwt.verify(token, JWT_CONFIG.SECRET_KEY);
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
          return next(new Error('Authentication error: User not found'));
        }

        // Block inactive accounts
        if (user.status === 'inactive') {
          return next(new Error('Authentication error: Account inactive'));
        }

        socket.userId = user._id.toString();
        socket.user = user;
        next();
      } catch (error) {
        console.error('Socket authentication error:', error);
        next(new Error('Authentication error: Invalid token'));
      }
    });

    this.io.on('connection', (socket) => {
      console.log(`User ${socket.userId} connected to socket`);
      
      // Store user connection
      this.connectedUsers.set(socket.userId, socket);

      // Handle joining project rooms
      socket.on('join-project', (data) => {
        const { projectId } = data;
        if (projectId) {
          socket.join(`project-${projectId}`);
          console.log(`User ${socket.userId} joined project room: project-${projectId}`);
        }
      });

      // Handle leaving project rooms
      socket.on('leave-project', (data) => {
        const { projectId } = data;
        if (projectId) {
          socket.leave(`project-${projectId}`);
          console.log(`User ${socket.userId} left project room: project-${projectId}`);
        }
      });

      // Handle joining user room (for user-specific events)
      socket.on('join:user', (data) => {
        const { userId } = data;
        if (userId && userId === socket.userId) {
          socket.join(`user-${userId}`);
          console.log(`User ${socket.userId} joined user room: user-${userId}`);
        }
      });

      // Handle leaving user room
      socket.on('leave:user', (data) => {
        const { userId } = data;
        if (userId && userId === socket.userId) {
          socket.leave(`user-${userId}`);
          console.log(`User ${socket.userId} left user room: user-${userId}`);
        }
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`User ${socket.userId} disconnected from socket`);
        this.connectedUsers.delete(socket.userId);
      });
    });

    console.log('Socket.IO server initialized');
  }

  // Emit to all users in a project room
  emitToProject(projectId, event, data) {
    if (this.io) {
      this.io.to(`project-${projectId}`).emit(event, {
        ...data,
        timestamp: new Date(),
        projectId
      });
      console.log(`Emitted ${event} to project ${projectId}:`, data);
    }
  }

  // Emit to a specific user
  emitToUser(userId, event, data) {
    const userSocket = this.connectedUsers.get(userId);
    if (userSocket) {
      userSocket.emit(event, {
        ...data,
        timestamp: new Date()
      });
      console.log(`Emitted ${event} to user ${userId}:`, data);
    }
  }

  // Emit to all connected users
  emitToAll(event, data) {
    if (this.io) {
      this.io.emit(event, {
        ...data,
        timestamp: new Date()
      });
      console.log(`Emitted ${event} to all users:`, data);
    }
  }

  // Emit project status update to specific users
  emitProjectStatusUpdated(projectId, newStatus, timelineEntry, recipientUserIds) {
    if (!this.io) return;

    const payload = {
      projectId: projectId.toString(),
      newStatus,
      timelineEntry,
      timestamp: new Date()
    };

    // Emit to specific user sockets
    recipientUserIds.forEach(userId => {
      const userSocket = this.connectedUsers.get(userId.toString());
      if (userSocket) {
        userSocket.emit('project_status_updated', payload);
      }
    });

    // Also emit to project room for users already in it
    this.io.to(`project-${projectId}`).emit('project_status_updated', payload);

    console.log(`Emitted project_status_updated for project ${projectId} to ${recipientUserIds.length} users`);
  }

  // Project-specific events
  emitProjectUpdate(projectId, updateType, data) {
    this.emitToProject(projectId, 'project-update', {
      type: updateType,
      data
    });
  }

  emitDescriptionAdded(projectId, description, userId) {
    this.emitToProject(projectId, 'description-added', {
      description,
      addedBy: userId,
      projectId
    });
  }

  emitStatusUpdated(projectId, oldStatus, newStatus, userId) {
    this.emitToProject(projectId, 'status-updated', {
      oldStatus,
      newStatus,
      updatedBy: userId,
      projectId
    });
  }

  emitNotesUpdated(projectId, notes, userId) {
    this.emitToProject(projectId, 'notes-updated', {
      notes,
      updatedBy: userId,
      projectId
    });
  }

  emitMilestoneUpdated(projectId, milestone, userId) {
    this.emitToProject(projectId, 'milestone-updated', {
      milestone,
      updatedBy: userId,
      projectId
    });
  }

  emitPaymentUpdated(projectId, payment, userId) {
    this.emitToProject(projectId, 'payment-updated', {
      payment,
      updatedBy: userId,
      projectId
    });
  }

  // Global events
  emitNotification(userId, notification) {
    this.emitToUser(userId, 'notification', notification);
  }

  emitGlobalUpdate(event, data) {
    this.emitToAll('global-update', {
      type: event,
      data
    });
  }

  // Emit notification to all admin users
  emitToAdminUsers(event, data) {
    if (this.io) {
      // Get all connected admin users
      const allConnectedUsers = Array.from(this.connectedUsers.values());
      console.log('All connected users:', allConnectedUsers.map(u => ({ id: u.userId, role: u.user?.role })));
      
      const adminUsers = allConnectedUsers.filter(socket => 
        socket.user && (socket.user.role === 'admin' || socket.user.role === 'superadmin')
      );
      
      console.log('Admin users found:', adminUsers.map(u => ({ id: u.userId, role: u.user?.role })));
      
      adminUsers.forEach(adminUser => {
        adminUser.emit(event, data);
      });
      
      console.log(`Emitted '${event}' to ${adminUsers.length} admin users with data:`, data);
    } else {
      console.warn('Socket.IO not initialized. Cannot emit to admin users.');
    }
  }

  // Get connected users count
  getConnectedUsersCount() {
    return this.connectedUsers.size;
  }

  // Check if user is connected
  isUserConnected(userId) {
    return this.connectedUsers.has(userId);
  }
}

// Create singleton instance
const socketService = new SocketService();

module.exports = socketService;
