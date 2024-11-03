import { VendorStatus } from '../customer/dto';

export const vendorServiceByIdMappedLaundry = (vendorService) => {
  const mappedAllocatePrice = [];
  const hashMap = {};

  for (let i = 0; i < vendorService.AllocatePrice.length; i++) {
    if (
      hashMap.hasOwnProperty(vendorService.AllocatePrice[i].category.categoryId)
    ) {
      const index = mappedAllocatePrice.findIndex((item) => {
        return (
          item.categoryId === vendorService.AllocatePrice[i].category.categoryId
        );
      });

      mappedAllocatePrice[index].servicesTypePrice.push({
        allocatePriceId: vendorService.AllocatePrice[i].id,
        subcategoryId: vendorService.AllocatePrice[i].subcategory.subCategoryId,
        subcategoryName:
          vendorService.AllocatePrice[i].subcategory.subCategoryName,
        price: vendorService.AllocatePrice[i].price,
      });
    } else {
      hashMap[vendorService.AllocatePrice[i].category.categoryId] = true;
      mappedAllocatePrice.push({
        servicesTypePrice: [
          {
            allocatePriceId: vendorService.AllocatePrice[i].id,
            subcategoryId:
              vendorService.AllocatePrice[i].subcategory.subCategoryId,
            subcategoryName:
              vendorService.AllocatePrice[i].subcategory.subCategoryName,
            price: vendorService.AllocatePrice[i].price,
          },
        ],
        categoryId: vendorService.AllocatePrice[i].category.categoryId,
        categoryName: vendorService.AllocatePrice[i].category.categoryName,
      });
    }
  }
  return mappedAllocatePrice;
};

export const vendorServiceByIdMappedCarWash = (vendorService) => {
  const mappedAllocatePrice = [];

  for (let i = 0; i < vendorService.AllocatePrice.length; i++) {
    mappedAllocatePrice.push({
      allocatePriceId: vendorService.AllocatePrice[i].id,
      categoryId: vendorService.AllocatePrice[i].category.categoryId,
      categoryName: vendorService.AllocatePrice[i].category.categoryName,
      price: vendorService.AllocatePrice[i].price,
    });
  }

  return mappedAllocatePrice;
};

export const getRiderDirectoryMapper = (riders, dayObj) => {
  const mappedRiders = [];
  for (let i = 0; i < riders.length; i++) {
    const riderObj = { ...riders[i] };
    const todaySchedule = riders[i].rider.companySchedule.find((element) => {
      return element.day === dayObj.currentDay;
    });

    if (
      todaySchedule.isActive &&
      dayObj.currentTime >= todaySchedule.startTime &&
      dayObj.currentTime < todaySchedule.endTime
    ) {
      riderObj.companyStatus = VendorStatus.OPEN;
    } else {
      riderObj.companyStatus = VendorStatus.CLOSED;
    }

    mappedRiders.push(riderObj);
    delete mappedRiders[i].rider.companySchedule;
  }
  return mappedRiders;
};
