import Vendor from '../models/Vendor';

function addVendor(vendorName) {
  return new Vendor({ vendorName }).save();
}
function getVendors() {
  return Vendor.find({})
    .then(vendors => (vendors.map(el => ({ vendorName: el.vendorName }))));
}

function removeVendor(vendorName) {
  return Vendor.remove({ vendorName });
}

export default {
  addVendor,
  removeVendor,
  getVendors,
};

