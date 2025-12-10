const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_CONFIG, FRONTEND_CONFIG } = require('../constants');

class SocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map();
  }

  initialize(server) {
    const { Server } = require('socket.io');
    const { createAdapter } = require('@socket.io/redis-adapter');
    const { getRedisClient } = require('../config/redis');
    
    this.io = new Server(server, {
      cors: {
        origin: FRONTEND_CONFIG.URL ,
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    // Use Redis adapter for Socket.IO scaling (optional)
    try {
      const { isRedisAvailable } = require('../config/redis');
      if (isRedisAvailable()) {
        const pubClient = getRedisClient();
        const subClient = pubClient.duplicate();
        // @socket.io/redis-adapter works with ioredis
        const { createAdapter } = require('@socket.io/redis-adapter');
        this.io.adapter(createAdapter(pubClient, subClient));
        console.log('Socket.IO Redis adapter initialized');
      } else {
        console.log('Socket.IO running without Redis adapter (Redis not available)');
      }
    } catch (error) {
      console.error('Failed to initialize Socket.IO Redis adapter:', error);
      console.log('Socket.IO will run without Redis adapter');
    }

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
        socket.user && (socket.user.role === 'admin' || socket.user.role === 'super_admin')
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
