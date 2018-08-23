import mongoose from 'mongoose';

const EmployeeSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  username: String,
  id: Number,
});

module.exports = mongoose.model('Employee', EmployeeSchema);
