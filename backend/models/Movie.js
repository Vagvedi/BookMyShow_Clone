const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Movie = sequelize.define('Movie', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Movie title is required' },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Movie description is required' },
      },
    },
    poster: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Movie poster URL is required' },
      },
    },
    trailer: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    genre: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    language: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Movie duration is required' },
      },
    },
    releaseDate: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Release date is required' },
      },
    },
    rating: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 10,
      },
    },
    cast: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    director: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    timestamps: true,
    indexes: [
      { fields: ['title'] },
      { fields: ['releaseDate'] },
    ],
  });

  return Movie;
};
