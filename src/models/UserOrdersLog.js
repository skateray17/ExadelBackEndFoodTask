import mongoose from 'mongoose';

const UserOrdersLogSchema = new mongoose.Schema({
  message: String,
  logDate: { type: Date, default: Date.now },
  username: String,
  orderDate: { type: Date, default: Date.now },

});

module.exports = mongoose.model('UserOrdersLog', UserOrdersLogSchema);
