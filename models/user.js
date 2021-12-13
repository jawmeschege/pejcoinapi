'use strict';
const bcryptService = require('../src/services/bcrypt.service');

const hooks = {
  beforeCreate(user) {
      user.password = bcryptService().password(user); // eslint-disable-line no-param-reassign
  },
};
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  User.init({
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    wallet_address: DataTypes.STRING,
    status: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'User',
  },{ hooks  });
  return User;
};