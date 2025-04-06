import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from "sequelize-typescript"
import { User } from "./User"
import { Property } from "./Property"
import { Payment } from "./Payment"

@Table({
  tableName: "tokens",
  timestamps: true,
})
export class Token extends Model {
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

  @ForeignKey(() => Payment)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  paymentId!: string

  @BelongsTo(() => Payment)
  payment!: Payment

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  tokenValue!: string

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  units!: number

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  amount!: number

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  isUsed!: boolean

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  usedAt!: Date

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  expiresAt!: Date
}

export default Token

