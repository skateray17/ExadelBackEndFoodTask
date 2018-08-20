import mongoose from 'mongoose';

const VendorSchema = new mongoose.Schema({
  vendorName: String,
});

module.exports = mongoose.model('Vendor', VendorSchema);
