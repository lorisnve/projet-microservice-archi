import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database.js';
import type { Role } from '../types/index.js';

interface UserAttributes {
  id: string;
  email: string;
  password: string;
  role: Role;
  createdAt?: Date;
  updatedAt?: Date;
}

type UserCreationAttributes = Optional<UserAttributes, 'id' | 'role'>;

class User extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes {
  declare id: string;
  declare email: string;
  declare password: string;
  declare role: Role;
  declare createdAt: Date;
  declare updatedAt: Date;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('USER', 'ADMIN'),
      defaultValue: 'USER',
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
  }
);

export default User;
