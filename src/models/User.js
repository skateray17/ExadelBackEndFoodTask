import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: String, // TODO
});

module.exports = mongoose.model('User', UserSchema);
