import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database.js';

interface BorrowAttributes {
  id: string;
  bookId: string;
  userId: string;
  borrowedAt: Date;
  returnedAt: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

type BorrowCreationAttributes = Optional<BorrowAttributes, 'id' | 'returnedAt'>;

class Borrow extends Model<BorrowAttributes, BorrowCreationAttributes>
  implements BorrowAttributes {
  declare id: string;
  declare bookId: string;
  declare userId: string;
  declare borrowedAt: Date;
  declare returnedAt: Date | null;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Borrow.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    bookId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'books', key: 'id' },
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    borrowedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    returnedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    sequelize,
    tableName: 'borrows',
    timestamps: true,
  }
);

export default Borrow;
