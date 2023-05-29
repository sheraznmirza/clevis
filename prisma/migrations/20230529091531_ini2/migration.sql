-- CreateTable
CREATE TABLE "BookingMaster" (
    "bookingMasterId" SERIAL NOT NULL,
    "vendorId" INTEGER NOT NULL,
    "customerId" INTEGER NOT NULL,
    "pickupLocationId" INTEGER,
    "dropffLocationId" INTEGER,
    "pickupTimeFrom" TIMESTAMP(3),
    "pickupTimeTo" TIMESTAMP(3),
    "dropoffTimeFrom" TIMESTAMP(3),
    "dropoffTimeTo" TIMESTAMP(3),
    "instructions" TEXT,
    "total" DOUBLE PRECISION NOT NULL,
    "bookingDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "BookingStatus" NOT NULL DEFAULT 'Pending',

    CONSTRAINT "BookingMaster_pkey" PRIMARY KEY ("bookingMasterId")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" SERIAL NOT NULL,
    "bookingMasterId" INTEGER NOT NULL,
    "riderId" INTEGER,
    "jobType" "JobType" NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Job_bookingMasterId_key" ON "Job"("bookingMasterId");

-- AddForeignKey
ALTER TABLE "BookingMaster" ADD CONSTRAINT "BookingMaster_pickupLocationId_fkey" FOREIGN KEY ("pickupLocationId") REFERENCES "UserAddress"("userAddressId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingMaster" ADD CONSTRAINT "BookingMaster_dropffLocationId_fkey" FOREIGN KEY ("dropffLocationId") REFERENCES "UserAddress"("userAddressId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_riderId_fkey" FOREIGN KEY ("riderId") REFERENCES "Rider"("riderId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_bookingMasterId_fkey" FOREIGN KEY ("bookingMasterId") REFERENCES "BookingMaster"("bookingMasterId") ON DELETE RESTRICT ON UPDATE CASCADE;
