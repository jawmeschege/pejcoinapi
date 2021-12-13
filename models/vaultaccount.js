'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class VaultAccount extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  VaultAccount.init({
    userId: DataTypes.INTEGER,
    amount: DataTypes.DOUBLE,
    status: DataTypes.INTEGER,
    lock_duration: DataTypes.INTEGER,
    wallet: DataTypes.STRING,
    txn_id: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'VaultAccount',
  });
  return VaultAccount;
};