import bcrypt from "bcrypt"
import { v4 as uuidv4 } from "uuid"
import {
  User,
  UserRole,
  Property,
  PropertyType,
  Rate,
  MeterReading,
  Payment,
  PaymentStatus,
  PaymentMethod,
  Token,
  Notification,
  NotificationType,
} from "../models"
import { logger } from "./logger"
import { sequelize } from "../config/database"

// Helper function to generate random date within a range
const randomDate = (start: Date, end: Date): Date => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

// Helper function to generate random number within a range
const randomNumber = (min: number, max: number): number => {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100
}

// Helper function to generate random boolean
const randomBoolean = (): boolean => {
  return Math.random() > 0.5
}

// Helper function to pick a random item from an array
const randomItem = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)]
}

// Helperunction to generate a random phone number
const generatePhoneNumber = (): string => {
  const prefix = randomItem(["+263", "0"])
  const network = randomItem(["77", "78"])
  const number = Math.floor(Math.random() * 10000000)
    .toString()
    .padStart(7, "0")
  return `${prefix}${network}${number}`
}

// Helper function to generate a random meter number
const generateMeterNumber = (): string => {
  return `ZW-${Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, "0")}`
}

// Helper function to generate a random token value
const generateTokenValue = (): string => {
  return (
    Math.random().toString(36).substring(2, 8).toUpperCase() + Math.random().toString(36).substring(2, 8).toUpperCase()
  )
}

// Helper function to generate a random reference number
const generateReferenceNumber = (prefix: string): string => {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`
}

// Seed users
const seedUsers = async (): Promise<User[]> => {
  logger.info("Seeding users...")

  // Create super admin if it doesn't exist
  let superAdmin = await User.findOne({ where: { email: "admin@zinwa.co.zw" } })
  if (!superAdmin) {
    superAdmin = await User.create({
      id: uuidv4(),
      firstName: "Super",
      lastName: "Admin",
      email: "admin@zinwa.co.zw",
      password: await bcrypt.hash("Admin@123", 10),
      phoneNumber: "+263771234567",
      role: UserRole.SUPER_ADMIN,
      isVerified: true,
      lastLogin: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  }

  // Create regular admin
  const admin = await User.create({
    firstName: "Regular",
    lastName: "Admin",
    email: "regularadmin@zinwa.co.zw",
    password: await bcrypt.hash("Admin@123", 10),
    phoneNumber: generatePhoneNumber(),
    role: UserRole.ADMIN,
    isVerified: true,
    lastLogin: randomDate(new Date(2023, 0, 1), new Date()),
  })

  // Create customers
  const customers: User[] = []
  const customerCount = 10

  for (let i = 0; i < customerCount; i++) {
    const firstName = `Customer${i + 1}`
    const lastName = `User${i + 1}`
    const customer = await User.create({
      firstName,
      lastName,
      email: `customer${i + 1}@example.com`,
      password: await bcrypt.hash("Password@123", 10),
      phoneNumber: generatePhoneNumber(),
      address: `${i + 1} Sample Street, Harare`,
      nationalId: `ID${Math.floor(Math.random() * 10000000)
        .toString()
        .padStart(7, "0")}`,
      role: UserRole.CUSTOMER,
      isVerified: randomBoolean(),
      lastLogin: randomBoolean() ? randomDate(new Date(2023, 0, 1), new Date()) : null,
    })
    customers.push(customer)
  }

  return [superAdmin, admin, ...customers]
}

// Seed rates
const seedRates = async (): Promise<Rate[]> => {
  logger.info("Seeding rates...")

  // Check if rates already exist
  const existingRates = await Rate.findAll()
  if (existingRates.length > 0) {
    return existingRates
  }

  const rates: Rate[] = []

  // Create rates for each property type
  const rateData = [
    {
      propertyType: PropertyType.RESIDENTIAL_LOW_DENSITY,
      ratePerUnit: 1.5,
      fixedCharge: 10,
      minimumCharge: 15,
      description: "Standard rate for low density residential properties",
    },
    {
      propertyType: PropertyType.RESIDENTIAL_HIGH_DENSITY,
      ratePerUnit: 1.2,
      fixedCharge: 5,
      minimumCharge: 10,
      description: "Standard rate for high density residential properties",
    },
    {
      propertyType: PropertyType.COMMERCIAL,
      ratePerUnit: 2.5,
      fixedCharge: 20,
      minimumCharge: 30,
      description: "Standard rate for commercial properties",
    },
    {
      propertyType: PropertyType.INDUSTRIAL,
      ratePerUnit: 3.0,
      fixedCharge: 30,
      minimumCharge: 50,
      description: "Standard rate for industrial properties",
    },
    {
      propertyType: PropertyType.AGRICULTURAL,
      ratePerUnit: 1.0,
      fixedCharge: 15,
      minimumCharge: 20,
      description: "Standard rate for agricultural properties",
    },
  ]

  for (const data of rateData) {
    const rate = await Rate.create({
      ...data,
      isActive: true,
      effectiveDate: new Date(2023, 0, 1),
    })
    rates.push(rate)
  }

  return rates
}

// Seed properties
const seedProperties = async (users: User[]): Promise<Property[]> => {
  logger.info("Seeding properties...")

  const properties: Property[] = []
  const customers = users.filter((user) => user.role === UserRole.CUSTOMER)

  // Create 2-3 properties for each customer
  for (const customer of customers) {
    const propertyCount = Math.floor(Math.random() * 2) + 1 // 1-2 properties per customer

    for (let i = 0; i < propertyCount; i++) {
      const propertyType = randomItem(Object.values(PropertyType))
      const property = await Property.create({
        userId: customer.id,
        propertyName: `${customer.lastName} Property ${i + 1}`,
        address: `${Math.floor(Math.random() * 100) + 1} ${randomItem(["Main", "First", "Second", "Third", "Fourth"])} ${randomItem(["Street", "Avenue", "Road", "Lane"])}`,
        meterNumber: generateMeterNumber(),
        propertyType,
        currentBalance: randomNumber(0, 100),
        totalConsumption: randomNumber(100, 1000),
        isActive: true,
        city: randomItem(["Harare", "Bulawayo", "Mutare", "Gweru", "Kwekwe"]),
        province: randomItem(["Harare", "Bulawayo", "Manicaland", "Midlands", "Mashonaland East"]),
        postalCode: `${Math.floor(Math.random() * 10000)}`,
        latitude: randomNumber(-18, -17),
        longitude: randomNumber(30, 31),
        lastTokenPurchase: randomBoolean() ? randomDate(new Date(2023, 0, 1), new Date()) : null,
      })

      properties.push(property)
    }
  }

  return properties
}

// Seed meter readings
const seedMeterReadings = async (properties: Property[]): Promise<MeterReading[]> => {
  logger.info("Seeding meter readings...")

  const meterReadings: MeterReading[] = []

  // Create initial meter reading (0) for each property
  for (const property of properties) {
    // Create initial reading
    const initialReading = await MeterReading.create({
      propertyId: property.id,
      reading: 0,
      consumption: 0,
      readingDate: new Date(2023, 0, 1),
      isEstimated: false,
      notes: "Initial meter reading",
    })

    meterReadings.push(initialReading)

    // Create 5-10 additional readings with increasing values
    const readingCount = Math.floor(Math.random() * 6) + 5 // 5-10 readings
    let lastReading = 0

    for (let i = 0; i < readingCount; i++) {
      const consumption = randomNumber(10, 50)
      const reading = lastReading + consumption
      lastReading = reading

      const meterReading = await MeterReading.create({
        propertyId: property.id,
        reading,
        consumption,
        readingDate: randomDate(new Date(2023, 0, 1), new Date()),
        isEstimated: randomBoolean(),
        notes: randomBoolean() ? "Regular reading" : null,
      })

      meterReadings.push(meterReading)
    }
  }

  return meterReadings
}

// Seed payments and tokens
const seedPaymentsAndTokens = async (properties: Property[]): Promise<{ payments: Payment[]; tokens: Token[] }> => {
  logger.info("Seeding payments and tokens...")

  const payments: Payment[] = []
  const tokens: Token[] = []

  for (const property of properties) {
    // Create 3-7 payments for each property
    const paymentCount = Math.floor(Math.random() * 5) + 3 // 3-7 payments

    for (let i = 0; i < paymentCount; i++) {
      const amount = randomNumber(20, 100)
      const status = randomItem([
        PaymentStatus.COMPLETED,
        PaymentStatus.COMPLETED,
        PaymentStatus.COMPLETED,
        PaymentStatus.PENDING,
        PaymentStatus.FAILED,
      ])
      const paymentMethod = randomItem([PaymentMethod.PAYNOW, PaymentMethod.BANK_TRANSFER, PaymentMethod.CASH])
      const createdAt = randomDate(new Date(2023, 0, 1), new Date())

      const payment = await Payment.create({
        userId: property.userId,
        propertyId: property.id,
        referenceNumber: generateReferenceNumber("PAY"),
        amount,
        status,
        paymentMethod,
        transactionId: `TXN${Math.floor(Math.random() * 1000000)}`,
        pollUrl:
          paymentMethod === PaymentMethod.PAYNOW
            ? `https://www.paynow.co.zw/poll/${Math.random().toString(36).substring(2, 15)}`
            : null,
        paymentDetails: { notes: "Sample payment" },
        paidAt: status === PaymentStatus.COMPLETED ? randomDate(createdAt, new Date()) : null,
        createdAt,
        updatedAt: new Date(),
      })

      payments.push(payment)

      // Create token for completed payments
      if (status === PaymentStatus.COMPLETED) {
        const units =
          amount /
          (property.propertyType === PropertyType.RESIDENTIAL_HIGH_DENSITY
            ? 1.2
            : property.propertyType === PropertyType.RESIDENTIAL_LOW_DENSITY
              ? 1.5
              : property.propertyType === PropertyType.COMMERCIAL
                ? 2.5
                : property.propertyType === PropertyType.INDUSTRIAL
                  ? 3.0
                  : 1.0)

        const isUsed = randomBoolean()
        const createdAtToken = payment.paidAt || createdAt

        const token = await Token.create({
          userId: property.userId,
          propertyId: property.id,
          paymentId: payment.id,
          tokenValue: generateTokenValue(),
          units,
          amount,
          isUsed,
          usedAt: isUsed ? randomDate(createdAtToken, new Date()) : null,
          expiresAt: new Date(createdAtToken.getTime() + 365 * 24 * 60 * 60 * 1000), // 1 year expiry
          createdAt: createdAtToken,
          updatedAt: new Date(),
        })

        tokens.push(token)
      }
    }
  }

  return { payments, tokens }
}

// Seed notifications
const seedNotifications = async (users: User[]): Promise<Notification[]> => {
  logger.info("Seeding notifications...")

  const notifications: Notification[] = []
  const customers = users.filter((user) => user.role === UserRole.CUSTOMER)

  for (const customer of customers) {
    // Create 5-10 notifications for each customer
    const notificationCount = Math.floor(Math.random() * 6) + 5 // 5-10 notifications

    for (let i = 0; i < notificationCount; i++) {
      const type = randomItem(Object.values(NotificationType))
      let title, message

      switch (type) {
        case NotificationType.PAYMENT:
          title = "Payment Confirmation"
          message = `Your payment of $${randomNumber(20, 100).toFixed(2)} has been processed successfully.`
          break
        case NotificationType.TOKEN:
          title = "Token Generated"
          message = `Your token has been generated. Token value: ${generateTokenValue()}`
          break
        case NotificationType.BALANCE:
          title = "Low Balance Alert"
          message = `Your water meter balance is running low. Current balance: ${randomNumber(1, 10).toFixed(2)} units.`
          break
        case NotificationType.SYSTEM:
          title = "System Maintenance"
          message = "The system will be undergoing maintenance on Sunday from 2 AM to 5 AM."
          break
      }

      const notification = await Notification.create({
        userId: customer.id,
        title,
        message,
        type,
        isRead: randomBoolean(),
        link: randomBoolean() ? "/dashboard" : null,
        metadata: { sampleData: "Sample metadata" },
        createdAt: randomDate(new Date(2023, 0, 1), new Date()),
        updatedAt: new Date(),
      })

      notifications.push(notification)
    }
  }

  return notifications
}

// Main seeder function
export const seedDatabase = async (): Promise<void> => {
  try {
    logger.info("Starting database seeding...")

    // Use a transaction to ensure all-or-nothing seeding
    await sequelize.transaction(async (t) => {
      const users = await seedUsers()
      const rates = await seedRates()
      const properties = await seedProperties(users)
      const meterReadings = await seedMeterReadings(properties)
      const { payments, tokens } = await seedPaymentsAndTokens(properties)
      const notifications = await seedNotifications(users)

      logger.info(`Seeded ${users.length} users`)
      logger.info(`Seeded ${rates.length} rates`)
      logger.info(`Seeded ${properties.length} properties`)
      logger.info(`Seeded ${meterReadings.length} meter readings`)
      logger.info(`Seeded ${payments.length} payments`)
      logger.info(`Seeded ${tokens.length} tokens`)
      logger.info(`Seeded ${notifications.length} notifications`)
    })

    logger.info("Database seeding completed successfully")
  } catch (error) {
    logger.error("Error seeding database:", error)
    throw error
  }
}

