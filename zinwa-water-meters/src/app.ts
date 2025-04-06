import express, { type Application, type Request, type Response } from "express"
import compression from "compression"
import cookieParser from "cookie-parser"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import { rateLimit } from "express-rate-limit"
// import { createClient } from "ioredis"
// import { RedisStore } from "rate-limit-redis"
import swaggerUi from "swagger-ui-express"
import YAML from "yamljs"
import path from "path"

import { errorHandler } from "./middleware/errorHandler"
import { sequelize } from "./config/database"
import authRoutes from "./routes/authRoutes"
import userRoutes from "./routes/userRoutes"
import propertyRoutes from "./routes/propertyRoutes"
import tokenRoutes from "./routes/tokenRoutes"
import paymentRoutes from "./routes/paymentRoutes"
import dashboardRoutes from "./routes/dashboardRoutes"
import adminRoutes from "./routes/adminRoutes"
import notificationRoutes from "./routes/notificationRoutes"
import { logger } from "./utils/logger"

// Load environment variables
import dotenv from "dotenv"
dotenv.config()

const app: Application = express()
const PORT = process.env.PORT || 5000

// // Redis client for rate limiting
// const redisClient = createClient({
//   url: process.env.REDIS_URL || "redis://localhost:6379",
// })

// // Connect to Redis
// redisClient.on("error", (err) => logger.error("Redis error:", err))
// redisClient.connect().catch(console.error)

// Middleware
app.use(helmet()) // Security headers
app.use(compression()) // Compress responses
app.use(express.json()) // Parse JSON bodies
app.use(express.urlencoded({ extended: true })) // Parse URL-encoded bodies
app.use(cookieParser()) // Parse cookies
app.use(morgan("combined")) // Logging

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
)

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  // store: new RedisStore({
  //   sendCommand: (...args: string[]) => redisClient.call(...args),
  // }),
  message: "Too many requests from this IP, please try again after 15 minutes",
})
app.use(limiter)

// Swagger documentation
const swaggerDocument = YAML.load(path.join(__dirname, "../swagger.yaml"))
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/properties", propertyRoutes)
app.use("/api/tokens", tokenRoutes)
app.use("/api/payments", paymentRoutes)
app.use("/api/dashboard", dashboardRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/notifications", notificationRoutes)

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok", timestamp: new Date() })
})

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: "Resource not found" })
})

// Global error handler
app.use(errorHandler)

// Import the seeder
import { seedDatabase } from "./utils/seeder"

// Database connection and server start
const startServer = async () => {
  try {
    await sequelize.authenticate()
    logger.info("Database connection established successfully")

    // Sync database models (in development)
    if (process.env.NODE_ENV === "development") {
      await sequelize.sync({ alter: true })
      logger.info("Database models synchronized")

      // Seed the database if SEED_DB environment variable is set
      if (process.env.SEED_DB === "true") {
        await seedDatabase()
      }
    }

    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`)
    })
  } catch (error) {
    logger.error("Unable to connect to the database:", error)
    process.exit(1)
  }
}

startServer()

export default app

