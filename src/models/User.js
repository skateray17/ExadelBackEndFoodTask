import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: String,
  passwordHash: String,
  email: String,
  passwordSalt: String,
  type: Number,
});

module.exports = mongoose.model('User', UserSchema);
