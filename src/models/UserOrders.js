import mongoose from 'mongoose';

const UserOrdersSchema = new mongoose.Schema({
  username: String,
  dishList: [{ dishTitle: String, amount: Number }],
  totalPrice: Number,
  date: { type: Date, default: Date.now },
  vendorName: String,
});

module.exports = mongoose.model('UserOrders', UserOrdersSchema);
