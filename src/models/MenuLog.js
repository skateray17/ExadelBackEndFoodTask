import mongoose from 'mongoose';

const MenuLogSchema = new mongoose.Schema({
  menuDate: String,
  message: String,
  logDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model('MenuLog', MenuLogSchema);
