const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const ApiError = require("./utils/ApiError");

// Load env vars
dotenv.config();

// Fail-fast Environment Validation
const requiredEnv = ["MONGO_URI", "JWT_SECRET", "NODE_ENV"];
requiredEnv.forEach((env) => {
  if (!process.env[env]) {
    console.error(`Error: ${env} is not defined in environment variables`);
    process.exit(1);
  }
});

const allowedEnvs = ["development", "production", "test"];
if (!allowedEnvs.includes(process.env.NODE_ENV)) {
  console.error(`Error: NODE_ENV must be one of ${allowedEnvs.join(", ")}`);
  process.exit(1);
}

const app = express();

// Trust proxy for rate limiting behind Nginx/Render/etc.
app.set("trust proxy", 1);

// Security Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "10kb" }));

// Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { success: false, message: "Too many requests, please try again later." },
});
app.use("/api", globalLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // stricter limit for auth
  message: { success: false, message: "Too many login attempts, please try again later." },
});
app.use("/api/auth/login", authLimiter);

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/expenses", require("./routes/expenseRoutes"));

// API 404 Handler - Express 5.x requires (.*) for wildcards or just a prefix for app.use
app.use("/api", (req, res, next) => {
  if (req.originalUrl.startsWith("/api/")) {
    return next(new ApiError(404, `Endpoint ${req.originalUrl} not found`));
  }
  next();
});

// Production Static Serving & SPA Fallback
if (process.env.NODE_ENV === "production") {
  const buildPath = path.join(__dirname, "../dist");
  app.use(express.static(buildPath));

  app.get("(.*)", (req, res) => {
    res.sendFile(path.resolve(buildPath, "index.html"));
  });
}

// Centralized Error Middleware
app.use((err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Something went wrong";

  // MongoDB Duplicate Key Error (11000)
  if (err.code === 11000) {
    statusCode = 400;
    message = "Duplicate value entered. Please use another value.";
  }

  // Distinguish Operational vs System errors
  if ((err instanceof ApiError && err.isOperational) || err.code === 11000) {
    return res.status(statusCode).json({
      success: false,
      message,
    });
  }

  // System/Unexpected error: Log it, hide stack in prod
  console.error("ERROR 💥", err);
  
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === "production" ? "Internal Server Error" : err.message,
  });
});

// Database & Server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });
