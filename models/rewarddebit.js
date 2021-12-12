'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class RewardDebit extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  RewardDebit.init({
    userId: DataTypes.INTEGER,
    amount: DataTypes.DOUBLE
  }, {
    sequelize,
    modelName: 'RewardDebit',
  });
  return RewardDebit;
};