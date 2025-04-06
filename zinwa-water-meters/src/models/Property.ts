import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from "sequelize-typescript"
import { User } from "./User"
import { Token } from "./Token"
import { MeterReading } from "./MeterReading"

export enum PropertyType {
  RESIDENTIAL_LOW_DENSITY = "residential_low_density",
  RESIDENTIAL_HIGH_DENSITY = "residential_high_density",
  COMMERCIAL = "commercial",
  INDUSTRIAL = "industrial",
  AGRICULTURAL = "agricultural",
}

@Table({
  tableName: "properties",
  timestamps: true,
  paranoid: true, // Soft deletes
})
export class Property extends Model {
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
  owner!: User

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  propertyName!: string

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  address!: string

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  meterNumber!: string

  @Column({
    type: DataType.ENUM(...Object.values(PropertyType)),
    allowNull: false,
  })
  propertyType!: PropertyType

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
    defaultValue: 0,
  })
  currentBalance!: number

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
    defaultValue: 0,
  })
  totalConsumption!: number

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  isActive!: boolean

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  city!: string

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  province!: string

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  postalCode!: string

  @Column({
    type: DataType.FLOAT,
    allowNull: true,
  })
  latitude!: number

  @Column({
    type: DataType.FLOAT,
    allowNull: true,
  })
  longitude!: number

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  lastTokenPurchase!: Date

  @HasMany(() => Token)
  tokens!: Token[]

  @HasMany(() => MeterReading)
  meterReadings!: MeterReading[]
}

export default Property

