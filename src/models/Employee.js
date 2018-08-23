import mongoose from 'mongoose';

const EmployeeSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  id: Number,
});

module.exports = mongoose.model('Employee', EmployeeSchema);
