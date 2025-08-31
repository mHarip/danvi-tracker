-- CreateTable
CREATE TABLE "Belt" (
    "id" SERIAL NOT NULL,
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Belt_pkey" PRIMARY KEY ("id")
);
