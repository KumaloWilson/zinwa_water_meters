import { Sequelize } from "sequelize-typescript"
import { Umzug, SequelizeStorage } from "umzug"
import { logger } from "../utils/logger"

// Import models
import User from "../models/User"
import Property from "../models/Property"
import Token from "../models/Token"
import Payment from "../models/Payment"
import MeterReading from "../models/MeterReading"
import Rate from "../models/Rate"
import Notification from "../models/Notification"

// Load environment variables
import dotenv from "dotenv"
dotenv.config()

// Database configuration
const sequelize = new Sequelize({
  dialect: "postgres",
  host: process.env.DB_HOST,
  port: Number.parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  logging: (msg) => logger.debug(msg),
  models: [User, Property, Token, Payment, MeterReading, Rate, Notification],
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
})

// Migrations configuration
const umzug = new Umzug({
  migrations: {
    glob: "src/migrations/*.ts",
    resolve: ({ name, path, context }) => {
      const migration = require(path as string)
      return {
        name,
        up: async () => migration.up(context, Sequelize),
        down: async () => migration.down(context, Sequelize),
      }
    },
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
})

// Run migrations
const runMigrations = async () => {
  try {
    await umzug.up()
    logger.info("Migrations executed successfully")
  } catch (error) {
    logger.error("Error executing migrations:", error)
    throw error
  }
}

// If this file is run directly, run migrations
if (require.main === module) {
  ;(async () => {
    try {
      await sequelize.authenticate()
      logger.info("Database connection established successfully")
      await runMigrations()
      logger.info("All migrations completed successfully")
      process.exit(0)
    } catch (error) {
      logger.error("Migration failed:", error)
      process.exit(1)
    }
  })()
}

export { sequelize, runMigrations }

