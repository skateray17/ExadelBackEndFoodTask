import mongoose from 'mongoose';

const MenuLogSchema = new mongoose.Schema({
  logs: [{ message: String, logDate: { type: Date, default: Date.now } }],
  menuDate: String,
});

module.exports = mongoose.model('MenuLog', MenuLogSchema);
