const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: String, // TODO
});

module.exports = mongoose.model('User', UserSchema);