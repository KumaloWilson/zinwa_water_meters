import { type QueryInterface, DataTypes } from "sequelize"
import { UserRole } from "../models/User"
import { PropertyType } from "../models/Property"
import { PaymentStatus, PaymentMethod } from "../models/Payment"
import { NotificationType } from "../models/Notification"
import bcrypt from "bcrypt"

export async function up(queryInterface: QueryInterface, Sequelize: any) {
  // Create users table
  await queryInterface.createTable("users", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nationalId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM(...Object.values(UserRole)),
      defaultValue: UserRole.CUSTOMER,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    resetPasswordToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resetPasswordExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  })

  // Create properties table
  await queryInterface.createTable("properties", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    propertyName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    meterNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    propertyType: {
      type: DataTypes.ENUM(...Object.values(PropertyType)),
      allowNull: false,
    },
    currentBalance: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    totalConsumption: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    province: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    postalCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    latitude: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    longitude: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    lastTokenPurchase: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  })

  // Create payments table
  await queryInterface.createTable("payments", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    propertyId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "properties",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    referenceNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(PaymentStatus)),
      defaultValue: PaymentStatus.PENDING,
    },
    paymentMethod: {
      type: DataTypes.ENUM(...Object.values(PaymentMethod)),
      defaultValue: PaymentMethod.PAYNOW,
    },
    transactionId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    pollUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    paymentDetails: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    paidAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  })

  // Create tokens table
  await queryInterface.createTable("tokens", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    propertyId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "properties",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    paymentId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "payments",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    tokenValue: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    units: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    isUsed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    usedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  })

  // Create meter_readings table
  await queryInterface.createTable("meter_readings", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    propertyId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "properties",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    reading: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    consumption: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    readingDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    isEstimated: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    notes: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  })

  // Create rates table
  await queryInterface.createTable("rates", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    propertyType: {
      type: DataTypes.ENUM(...Object.values(PropertyType)),
      allowNull: false,
    },
    ratePerUnit: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    fixedCharge: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    minimumCharge: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    effectiveDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  })

  // Create notifications table
  await queryInterface.createTable("notifications", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM(...Object.values(NotificationType)),
      allowNull: false,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    link: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  })

  // Create initial admin user
  await queryInterface.bulkInsert("users", [
    {
      id: DataTypes.UUIDV4,
      firstName: "Admin",
      lastName: "User",
      email: "admin@zinwa.co.zw",
      password: await bcrypt.hash("Admin@123", 10),
      phoneNumber: "+263771234567",
      role: UserRole.SUPER_ADMIN,
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ])

  // Create initial rates for different property types
  await queryInterface.bulkInsert("rates", [
    {
      id: DataTypes.UUIDV4,
      propertyType: PropertyType.RESIDENTIAL_LOW_DENSITY,
      ratePerUnit: 1.5,
      fixedCharge: 10,
      minimumCharge: 15,
      isActive: true,
      effectiveDate: new Date(),
      description: "Standard rate for low density residential properties",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: DataTypes.UUIDV4,
      propertyType: PropertyType.RESIDENTIAL_HIGH_DENSITY,
      ratePerUnit: 1.2,
      fixedCharge: 5,
      minimumCharge: 10,
      isActive: true,
      effectiveDate: new Date(),
      description: "Standard rate for high density residential properties",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: DataTypes.UUIDV4,
      propertyType: PropertyType.COMMERCIAL,
      ratePerUnit: 2.5,
      fixedCharge: 20,
      minimumCharge: 30,
      isActive: true,
      effectiveDate: new Date(),
      description: "Standard rate for commercial properties",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: DataTypes.UUIDV4,
      propertyType: PropertyType.INDUSTRIAL,
      ratePerUnit: 3.0,
      fixedCharge: 30,
      minimumCharge: 50,
      isActive: true,
      effectiveDate: new Date(),
      description: "Standard rate for industrial properties",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: DataTypes.UUIDV4,
      propertyType: PropertyType.AGRICULTURAL,
      ratePerUnit: 1.0,
      fixedCharge: 15,
      minimumCharge: 20,
      isActive: true,
      effectiveDate: new Date(),
      description: "Standard rate for agricultural properties",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ])
}

export async function down(queryInterface: QueryInterface, Sequelize: any) {
  // Drop tables in reverse order
  await queryInterface.dropTable("notifications")
  await queryInterface.dropTable("meter_readings")
  await queryInterface.dropTable("tokens")
  await queryInterface.dropTable("payments")
  await queryInterface.dropTable("rates")
  await queryInterface.dropTable("properties")
  await queryInterface.dropTable("users")
}

