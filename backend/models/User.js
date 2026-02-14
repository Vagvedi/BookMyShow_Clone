const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Please provide a name' },
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      lowercase: true,
      validate: {
        isEmail: { msg: 'Please provide a valid email' },
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: { args: [6, undefined], msg: 'Password must be at least 6 characters' },
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM('USER', 'ADMIN'),
      defaultValue: 'USER',
    },
    city: {
      type: DataTypes.STRING,
      defaultValue: 'Mumbai',
    },
  }, {
    timestamps: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  });

  User.prototype.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  };

  User.prototype.generateToken = function () {
    return jwt.sign(
      { id: this.id, role: this.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
  };

  return User;
};
