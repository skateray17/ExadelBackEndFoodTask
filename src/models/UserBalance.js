import mongoose from 'mongoose';

const UserBalanceSchema = new mongoose.Schema({
  username: String,
  balance: Number,
});

module.exports = mongoose.model('UserBalance', UserBalanceSchema);
