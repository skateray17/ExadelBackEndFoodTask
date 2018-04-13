import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: String,
  passwordHash: String,
  email: String,
  passwordSalt: String,
});

module.exports = mongoose.model('User', UserSchema);
