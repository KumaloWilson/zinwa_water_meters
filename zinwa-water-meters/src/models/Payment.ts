import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasOne } from "sequelize-typescript"
import { User } from "./User"
import { Property } from "./Property"
import { Token } from "./Token"

export enum PaymentStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
  REFUNDED = "refunded",
}

export enum PaymentMethod {
  PAYNOW = "paynow",
  BANK_TRANSFER = "bank_transfer",
  CASH = "cash",
  OTHER = "other",
}

@Table({
  tableName: "payments",
  timestamps: true,
})
export class Payment extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id!: string

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  userId!: string

  @BelongsTo(() => User)
  user!: User

  @ForeignKey(() => Property)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  propertyId!: string

  @BelongsTo(() => Property)
  property!: Property

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  referenceNumber!: string

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  amount!: number

  @Column({
    type: DataType.ENUM(...Object.values(PaymentStatus)),
    defaultValue: PaymentStatus.PENDING,
  })
  status!: PaymentStatus

  @Column({
    type: DataType.ENUM(...Object.values(PaymentMethod)),
    defaultValue: PaymentMethod.PAYNOW,
  })
  paymentMethod!: PaymentMethod

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  transactionId!: string

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  pollUrl!: string

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  paymentDetails!: any

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  paidAt!: Date

  @HasOne(() => Token)
  token!: Token
}

export default Payment

