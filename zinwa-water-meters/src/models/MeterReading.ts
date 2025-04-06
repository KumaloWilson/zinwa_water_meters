import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from "sequelize-typescript"
import { Property } from "./Property"

@Table({
  tableName: "meter_readings",
  timestamps: true,
})
export class MeterReading extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id!: string

  @ForeignKey(() => Property)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  propertyId!: string

  @BelongsTo(() => Property)
  property!: Property

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  reading!: number

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
    defaultValue: 0,
  })
  consumption!: number

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  readingDate!: Date

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  isEstimated!: boolean

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  notes!: string
}

export default MeterReading

