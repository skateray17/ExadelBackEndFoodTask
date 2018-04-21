import mongoose from 'mongoose';

const MenuSchema = new mongoose.Schema({
  date: String,
  menu: Object,
});

module.exports = mongoose.model('Menu', MenuSchema);
