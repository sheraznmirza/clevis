-- CreateTable
CREATE TABLE "RiderJob" (
    "id" SERIAL NOT NULL,
    "riderId" INTEGER NOT NULL,
    "jobId" INTEGER NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "RiderJob_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RiderJob" ADD CONSTRAINT "RiderJob_riderId_fkey" FOREIGN KEY ("riderId") REFERENCES "Rider"("riderId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiderJob" ADD CONSTRAINT "RiderJob_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
