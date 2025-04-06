import { User, UserRole } from "./User"
import { Property, PropertyType } from "./Property"
import { Token } from "./Token"
import { Payment, PaymentStatus, PaymentMethod } from "./Payment"
import { MeterReading } from "./MeterReading"
import { Rate } from "./Rate"
import { Notification, NotificationType } from "./Notification"

// Export all models as default export for Sequelize TypeScript
const models = [User, Property, Token, Payment, MeterReading, Rate, Notification]

export default models

// Also export individual models and types
export {
  User,
  UserRole,
  Property,
  PropertyType,
  Token,
  Payment,
  PaymentStatus,
  PaymentMethod,
  MeterReading,
  Rate,
  Notification,
  NotificationType,
}

