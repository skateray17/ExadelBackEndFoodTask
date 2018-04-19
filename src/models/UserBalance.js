import mongoose from 'mongoose';

const UserBalanceSchema = new mongoose.Schema({
  email: String,
  balance: Number,
});

module.exports = mongoose.model('UserBalance', UserBalanceSchema);
