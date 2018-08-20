import mongoose from 'mongoose';

const MenuSchema = new mongoose.Schema({
  date: String,
  menu: Object,
  vendorName: String,
});

module.exports = mongoose.model('Menu', MenuSchema);
