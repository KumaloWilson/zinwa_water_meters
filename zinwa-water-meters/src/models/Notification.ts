import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from "sequelize-typescript"
import { User } from "./User"

export enum NotificationType {
  PAYMENT = "payment",
  TOKEN = "token",
  BALANCE = "balance",
  SYSTEM = "system",
}

@Table({
  tableName: "notifications",
  timestamps: true,
})
export class Notification extends Model {
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

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  title!: string

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  message!: string

  @Column({
    type: DataType.ENUM(...Object.values(NotificationType)),
    allowNull: false,
  })
  type!: NotificationType

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  isRead!: boolean

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  link!: string

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  metadata!: any
}

export default Notification

