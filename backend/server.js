const express = require("express");
const path = require("path");
const cors = require("cors");
const http = require("http");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/database");
const { SERVER_CONFIG, FRONTEND_CONFIG, RATE_LIMIT_CONFIG } = require("./constants");
const socketService = require("./services/socketService");
const performanceLogger = require("./middleware/performance");
const healthCheck = require("./middleware/healthCheck");

// Load environment variables
require("dotenv").config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = SERVER_CONFIG.PORT;

// Security middleware - Helmet
app.use(helmet({
  contentSecurityPolicy: SERVER_CONFIG.NODE_ENV === "production" ? {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      imgSrc: ["'self'", "data:", "blob:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:", "http:", "https:"],
      mediaSrc: ["'self'", "data:", "blob:"],
      objectSrc: ["'none'"],
      frameSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: [],
    },
  } : false,
}));

// Rate limiting - configurable via environment variables
// Defaults: 1000 requests per 15 minutes (general), 20 requests per 15 minutes (auth)
const limiter = rateLimit({
  windowMs: RATE_LIMIT_CONFIG.WINDOW_MS,
  max: RATE_LIMIT_CONFIG.MAX_REQUESTS,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks and root endpoint
    return req.path === '/health' || req.path === '/';
  },
});

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: RATE_LIMIT_CONFIG.AUTH_WINDOW_MS,
  max: RATE_LIMIT_CONFIG.AUTH_MAX_REQUESTS,
  message: "Too many authentication attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(
  cors({
    origin: FRONTEND_CONFIG.URL, // Frontend URLs
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));
app.use(performanceLogger);
app.use("/api/", limiter);
app.use("/api/auth/", authLimiter);

// Serve static files from uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.get("/", (req, res) => {
  res.json({ message: "V-Accel Backend Server is running!" });
});

// Health check endpoint
app.get("/health", healthCheck);

// API Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/settings", require("./routes/settings"));
app.use("/api/projects", require("./routes/projects"));
app.use("/api/bids", require("./routes/bids"));
app.use("/api/bidding", require("./routes/bidding"));
app.use("/api/notifications", require("./routes/notifications"));
app.use("/api/activity-logs", require("./routes/activityLogs"));
app.use("/api/consultations", require("./routes/consultations"));
app.use("/api/freelancer-project-details", require("./routes/freelancerProjectDetails"));

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
socketService.initialize(server);

// Start server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${SERVER_CONFIG.NODE_ENV}`);
});
