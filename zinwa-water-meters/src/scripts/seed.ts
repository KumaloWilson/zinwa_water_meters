import { seedDatabase } from "../utils/seeder"
import { sequelize } from "../config/database"
import { logger } from "../utils/logger"

// Load environment variables
import dotenv from "dotenv"
dotenv.config()

const runSeeder = async () => {
  try {
    // Connect to the database
    await sequelize.authenticate()
    logger.info("Database connection established successfully")

    // Run the seeder
    await seedDatabase()

    // Close the connection
    await sequelize.close()
    logger.info("Database connection closed")

    process.exit(0)
  } catch (error) {
    logger.error("Seeder error:", error)
    process.exit(1)
  }
}

// Run the seeder
runSeeder()

