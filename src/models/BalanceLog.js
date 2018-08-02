import mongoose from 'mongoose';

const BalanceLogSchema = new mongoose.Schema({
  logs: [{ message: String, logDate: { type: Date, default: Date.now } }],
  username: String,
});

module.exports = mongoose.model('BalanceLog', BalanceLogSchema);
