import mongoose from 'mongoose';

// const UserOrdersSchema = new mongoose.Schema({
//   orders: [{
//     username: String,
//     dishList: [{ dishTitle: String, amount: Number }],
//     totalPrice: Number,
//   }],
//   date: { type: Date, default: Date.now },
// });

const UserOrdersSchema = new mongoose.Schema({
  username: String,
  days: [{
    dishList: [{ dishTitle: String, amount: Number }],
    totalPrice: Number,
    date: { type: Date, default: Date.now },
  }],
});
module.exports = mongoose.model('UserOrders', UserOrdersSchema);
