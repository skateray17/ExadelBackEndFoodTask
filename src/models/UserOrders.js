import mongoose from 'mongoose';

const UserOrdersSchema = new mongoose.Schema({
  orders: [{
    username: String,
    dishList: [{ dishTitle: String, amount: Number }],
    totalPrice: Number,
  }],
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('UserOrders', UserOrdersSchema);