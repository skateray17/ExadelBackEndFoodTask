import mongoose from 'mongoose';

const BalanceLogSchema = new mongoose.Schema({
  username: String,
  logs: [{ message: String, logDate: { type: Date, default: Date.now } }],
});

module.exports = mongoose.model('BalanceLog', BalanceLogSchema);
