import { Table, Column, Model, DataType, HasMany, BeforeCreate, BeforeUpdate } from "sequelize-typescript"
import bcrypt from "bcrypt"
import { Property } from "./Property"
import { Token } from "./Token"
import { Payment } from "./Payment"

export enum UserRole {
  CUSTOMER = "customer",
  ADMIN = "admin",
  SUPER_ADMIN = "super_admin",
}

@Table({
  tableName: "users",
  timestamps: true,
  paranoid: true, // Soft deletes
})
export class User extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id!: string

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  firstName!: string

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  lastName!: string

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  })
  email!: string

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password!: string

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      is: /^(\+263|0)7[7-8][0-9]{7}$/,
    },
  })
  phoneNumber!: string

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  address!: string

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  nationalId!: string

  @Column({
    type: DataType.ENUM(...Object.values(UserRole)),
    defaultValue: UserRole.CUSTOMER,
  })
  role!: UserRole

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  isVerified!: boolean

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  lastLogin!: Date

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  resetPasswordToken?: string

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  resetPasswordExpires?: Date

  @HasMany(() => Property)
  properties!: Property[]

  @HasMany(() => Token)
  tokens!: Token[]

  @HasMany(() => Payment)
  payments!: Payment[]

  // Virtual field for full name
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`
  }

  // Method to validate password
  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password)
  }

  // Hash password before create or update
  @BeforeCreate
  @BeforeUpdate
  static async hashPassword(instance: User) {
    if (instance.changed("password")) {
      const salt = await bcrypt.genSalt(10)
      instance.password = await bcrypt.hash(instance.password, salt)
    }
  }
}

export default User

