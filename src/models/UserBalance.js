import mongoose from 'mongoose';

const UserBalanceSchema = new mongoose.Schema({
  username: String,
  firstName: String,
  lastName: String,
  balance: Number,
});

module.exports = mongoose.model('UserBalance', UserBalanceSchema);
