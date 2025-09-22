import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import connectDB from "./config/database.js";

// Import routes
import authRoutes from "./routes/routes.js";

// Load environment variables
dotenv.config();

const app = express();

// Connect to the database
connectDB();

// --- CORE MIDDLEWARE ---
// 1. CORS: Must be one of the first to handle cross-origin requests
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? "https://your-frontend-domain.com"
        : // The origin must match the URL of your frontend application
          "http://localhost:5173",
    credentials: true,
  })
);

// 2. Body Parsers: To parse incoming JSON and URL-encoded payloads
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// --- LOGGING MIDDLEWARE (Optional) ---
// 3. Request Logger: Useful for debugging in development
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(
      `${req.method} ${req.originalUrl} - ${new Date().toISOString()}`
    );
    next();
  });
}

// --- API ROUTES ---
// 4. Your application's routes
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);

// --- ERROR HANDLING MIDDLEWARE ---
// 5. 404 Not Found Handler: Catches requests that don't match any route above
// The path '*' is invalid. A catch-all should handle all paths that were not matched before.
// We can do this by creating a middleware without a path, which will only run if no other route has sent a response.
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found for ${req.method} ${req.originalUrl}`,
  });
});

// 6. Global Error Handler: The final stop for any errors passed via next(err)
app.use((err, req, res, next) => {
  console.error("Global error handler:", err);

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors,
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      message: `${field} already exists`,
    });
  }

  // Default server error
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
