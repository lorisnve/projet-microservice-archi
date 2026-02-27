import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database.js';

interface BookAttributes {
  id: string;
  title: string;
  author: string;
  isbn: string;
  available: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

type BookCreationAttributes = Optional<BookAttributes, 'id' | 'available'>;

class Book extends Model<BookAttributes, BookCreationAttributes>
  implements BookAttributes {
  declare id: string;
  declare title: string;
  declare author: string;
  declare isbn: string;
  declare available: boolean;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Book.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    author: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isbn: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    available: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'books',
    timestamps: true,
  }
);

export default Book;
