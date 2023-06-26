import { VendorStatus } from './dto';

export const getVendorListingMapper = (vendors, dayObj) => {
  const mappedVendors = [];
  for (let i = 0; i < vendors.length; i++) {
    const vendorObj = { ...vendors[i] };
    const todaySchedule = vendors[i].vendor.companySchedule.find((element) => {
      return element.day === dayObj.currentDay;
    });

    if (
      todaySchedule.isActive &&
      dayObj.currentTime >= todaySchedule.startTime &&
      dayObj.currentTime < todaySchedule.endTime
    ) {
      vendorObj.companyStatus = VendorStatus.OPEN;
    } else {
      vendorObj.companyStatus = VendorStatus.CLOSED;
    }

    mappedVendors.push(vendorObj);
    delete mappedVendors[i].vendor.companySchedule;
  }
  //   console.log('vendors: ', vendors[0]);
  //   return vendors[0];
  return mappedVendors;
};
