import { Table, Column, Model, DataType } from "sequelize-typescript"
import { PropertyType } from "./Property"

@Table({
  tableName: "rates",
  timestamps: true,
})
export class Rate extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id!: string

  @Column({
    type: DataType.ENUM(...Object.values(PropertyType)),
    allowNull: false,
    unique: true,
  })
  propertyType!: PropertyType

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  ratePerUnit!: number

  @Column({
    type: DataType.FLOAT,
    allowNull: true,
  })
  fixedCharge!: number

  @Column({
    type: DataType.FLOAT,
    allowNull: true,
  })
  minimumCharge!: number

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  isActive!: boolean

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  effectiveDate!: Date

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  endDate!: Date

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  description!: string
}

export default Rate

