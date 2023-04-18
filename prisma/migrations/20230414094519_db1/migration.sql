-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('CUSTOMER', 'VENDOR', 'ADMIN', 'RIDER');

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('CAR_WASH', 'LAUNDRY');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('APPROVED', 'PENDING', 'REJECTED');

-- CreateEnum
CREATE TYPE "EmailTemplates" AS ENUM ('resetPassword', 'userRegistration');

-- CreateEnum
CREATE TYPE "DefaultActions" AS ENUM ('ALL', 'READ', 'CREATE', 'UPDATE', 'DELETE');

-- CreateTable
CREATE TABLE "UserMaster" (
    "userMasterId" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "password" TEXT NOT NULL,
    "profileImage" TEXT,
    "userType" "UserType" NOT NULL DEFAULT 'CUSTOMER',
    "phone" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "hashedRt" TEXT,

    CONSTRAINT "UserMaster_pkey" PRIMARY KEY ("userMasterId")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "tokenId" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "userMasterId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("tokenId")
);

-- CreateTable
CREATE TABLE "Otp" (
    "otpId" TEXT NOT NULL,
    "userMasterId" INTEGER NOT NULL,
    "otp" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expired" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Otp_pkey" PRIMARY KEY ("otpId")
);

-- CreateTable
CREATE TABLE "User" (
    "userId" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "userMasterId" INTEGER NOT NULL,
    "fullName" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Customer" (
    "customerId" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "userMasterId" INTEGER NOT NULL,
    "fullName" TEXT NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("customerId")
);

-- CreateTable
CREATE TABLE "Vendor" (
    "vendorId" SERIAL NOT NULL,
    "userMasterId" INTEGER NOT NULL,
    "fullName" TEXT NOT NULL,
    "serviceType" "ServiceType" NOT NULL,
    "companyName" TEXT NOT NULL,
    "companyEmail" TEXT NOT NULL,
    "logo" TEXT NOT NULL,
    "workspaceImages" TEXT[],
    "businessLicense" TEXT[],
    "description" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "Vendor_pkey" PRIMARY KEY ("vendorId")
);

-- CreateTable
CREATE TABLE "Rider" (
    "riderId" SERIAL NOT NULL,
    "userMasterId" INTEGER NOT NULL,
    "fullName" TEXT NOT NULL,
    "serviceType" "ServiceType" NOT NULL,
    "companyName" TEXT NOT NULL,
    "companyEmail" TEXT NOT NULL,
    "logo" TEXT NOT NULL,
    "workspaceImages" TEXT[],
    "businessLicense" TEXT[],
    "description" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "Rider_pkey" PRIMARY KEY ("riderId")
);

-- CreateTable
CREATE TABLE "UserAddress" (
    "userAddressId" SERIAL NOT NULL,
    "fullAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "vendorId" INTEGER,
    "customerId" INTEGER,
    "cityId" INTEGER,
    "longitude" TEXT,
    "latitude" TEXT,
    "riderId" INTEGER,
    "userUserId" INTEGER,

    CONSTRAINT "UserAddress_pkey" PRIMARY KEY ("userAddressId")
);

-- CreateTable
CREATE TABLE "Country" (
    "countryId" INTEGER NOT NULL,
    "countryName" TEXT NOT NULL,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("countryId")
);

-- CreateTable
CREATE TABLE "State" (
    "stateId" INTEGER NOT NULL,
    "stateName" TEXT NOT NULL,
    "countryId" INTEGER NOT NULL,

    CONSTRAINT "State_pkey" PRIMARY KEY ("stateId")
);

-- CreateTable
CREATE TABLE "City" (
    "cityId" INTEGER NOT NULL,
    "cityName" TEXT NOT NULL,
    "stateId" INTEGER,

    CONSTRAINT "City_pkey" PRIMARY KEY ("cityId")
);

-- CreateTable
CREATE TABLE "Services" (
    "serviceId" SERIAL NOT NULL,
    "serviceName" TEXT NOT NULL,
    "serviceType" "ServiceType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Services_pkey" PRIMARY KEY ("serviceId")
);

-- CreateTable
CREATE TABLE "Category" (
    "categoryId" SERIAL NOT NULL,
    "categoryName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "serviceId" INTEGER NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("categoryId")
);

-- CreateTable
CREATE TABLE "SubCategory" (
    "subCategoryId" SERIAL NOT NULL,
    "subCategoryName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "categoryId" INTEGER NOT NULL,

    CONSTRAINT "SubCategory_pkey" PRIMARY KEY ("subCategoryId")
);

-- CreateTable
CREATE TABLE "VendorService" (
    "vendorServiceId" SERIAL NOT NULL,
    "vendorId" INTEGER NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "serviceImage" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "VendorService_pkey" PRIMARY KEY ("vendorServiceId")
);

-- CreateTable
CREATE TABLE "VendorServiceCategory" (
    "vendorServiceCategoryId" SERIAL NOT NULL,
    "vendorServiceId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "price" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "VendorServiceCategory_pkey" PRIMARY KEY ("vendorServiceCategoryId")
);

-- CreateTable
CREATE TABLE "VendorServiceSubcategory" (
    "vendorServiceSubcategoryId" SERIAL NOT NULL,
    "vendorServiceCategoryId" INTEGER NOT NULL,
    "subCategoryId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "VendorServiceSubcategory_pkey" PRIMARY KEY ("vendorServiceSubcategoryId")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMPTZ,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" SERIAL NOT NULL,
    "action" "DefaultActions" NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMPTZ,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Routes" (
    "id" SERIAL NOT NULL,
    "Route" TEXT NOT NULL,
    "roleId" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "linkTo" TEXT NOT NULL,
    "selectedOptionKey" TEXT NOT NULL,
    "icon" TEXT NOT NULL,

    CONSTRAINT "Routes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermissionMapping" (
    "id" SERIAL NOT NULL,
    "permissionId" INTEGER NOT NULL,
    "routeId" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMPTZ,
    "roleId" INTEGER,

    CONSTRAINT "RolePermissionMapping_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_refreshToken_key" ON "RefreshToken"("refreshToken");

-- CreateIndex
CREATE UNIQUE INDEX "Otp_otp_key" ON "Otp"("otp");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_userMasterId_key" ON "User"("userMasterId");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_userMasterId_key" ON "Customer"("userMasterId");

-- CreateIndex
CREATE UNIQUE INDEX "Vendor_userMasterId_key" ON "Vendor"("userMasterId");

-- CreateIndex
CREATE UNIQUE INDEX "Rider_userMasterId_key" ON "Rider"("userMasterId");

-- CreateIndex
CREATE UNIQUE INDEX "State_countryId_key" ON "State"("countryId");

-- CreateIndex
CREATE UNIQUE INDEX "City_stateId_key" ON "City"("stateId");

-- CreateIndex
CREATE UNIQUE INDEX "Services_serviceName_key" ON "Services"("serviceName");

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userMasterId_fkey" FOREIGN KEY ("userMasterId") REFERENCES "UserMaster"("userMasterId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Otp" ADD CONSTRAINT "Otp_userMasterId_fkey" FOREIGN KEY ("userMasterId") REFERENCES "UserMaster"("userMasterId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_userMasterId_fkey" FOREIGN KEY ("userMasterId") REFERENCES "UserMaster"("userMasterId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_userMasterId_fkey" FOREIGN KEY ("userMasterId") REFERENCES "UserMaster"("userMasterId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_userMasterId_fkey" FOREIGN KEY ("userMasterId") REFERENCES "UserMaster"("userMasterId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rider" ADD CONSTRAINT "Rider_userMasterId_fkey" FOREIGN KEY ("userMasterId") REFERENCES "UserMaster"("userMasterId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAddress" ADD CONSTRAINT "UserAddress_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("cityId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAddress" ADD CONSTRAINT "UserAddress_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("vendorId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAddress" ADD CONSTRAINT "UserAddress_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("customerId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAddress" ADD CONSTRAINT "UserAddress_riderId_fkey" FOREIGN KEY ("riderId") REFERENCES "Rider"("riderId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAddress" ADD CONSTRAINT "UserAddress_userUserId_fkey" FOREIGN KEY ("userUserId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "State" ADD CONSTRAINT "State_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("countryId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "City" ADD CONSTRAINT "City_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State"("stateId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Services"("serviceId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubCategory" ADD CONSTRAINT "SubCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("categoryId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorService" ADD CONSTRAINT "VendorService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Services"("serviceId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorService" ADD CONSTRAINT "VendorService_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("vendorId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorServiceCategory" ADD CONSTRAINT "VendorServiceCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("categoryId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorServiceCategory" ADD CONSTRAINT "VendorServiceCategory_vendorServiceId_fkey" FOREIGN KEY ("vendorServiceId") REFERENCES "VendorService"("vendorServiceId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorServiceSubcategory" ADD CONSTRAINT "VendorServiceSubcategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("categoryId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorServiceSubcategory" ADD CONSTRAINT "VendorServiceSubcategory_subCategoryId_fkey" FOREIGN KEY ("subCategoryId") REFERENCES "SubCategory"("subCategoryId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorServiceSubcategory" ADD CONSTRAINT "VendorServiceSubcategory_vendorServiceCategoryId_fkey" FOREIGN KEY ("vendorServiceCategoryId") REFERENCES "VendorServiceCategory"("vendorServiceCategoryId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Routes" ADD CONSTRAINT "Routes_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermissionMapping" ADD CONSTRAINT "RolePermissionMapping_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermissionMapping" ADD CONSTRAINT "RolePermissionMapping_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Routes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermissionMapping" ADD CONSTRAINT "RolePermissionMapping_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;
