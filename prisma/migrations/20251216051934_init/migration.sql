-- CreateTable
CREATE TABLE "Yakap" (
    "yakap_id" TEXT NOT NULL,
    "fullname" TEXT NOT NULL,
    "address" TEXT,
    "brgy_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Yakap_pkey" PRIMARY KEY ("yakap_id")
);

-- CreateTable
CREATE TABLE "Brgy" (
    "brgy_id" TEXT NOT NULL,
    "city_id" TEXT NOT NULL,
    "brgy_name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Brgy_pkey" PRIMARY KEY ("brgy_id")
);

-- CreateTable
CREATE TABLE "City" (
    "city_id" TEXT NOT NULL,
    "prov_id" TEXT NOT NULL,
    "city_name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "City_pkey" PRIMARY KEY ("city_id")
);

-- CreateTable
CREATE TABLE "Province" (
    "prov_id" TEXT NOT NULL,
    "prov_name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Province_pkey" PRIMARY KEY ("prov_id")
);

-- CreateTable
CREATE TABLE "User" (
    "user_id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'ENCODER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateIndex
CREATE INDEX "Yakap_fullname_idx" ON "Yakap"("fullname");

-- CreateIndex
CREATE INDEX "Yakap_brgy_id_idx" ON "Yakap"("brgy_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AddForeignKey
ALTER TABLE "Yakap" ADD CONSTRAINT "Yakap_brgy_id_fkey" FOREIGN KEY ("brgy_id") REFERENCES "Brgy"("brgy_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Yakap" ADD CONSTRAINT "Yakap_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Brgy" ADD CONSTRAINT "Brgy_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "City"("city_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "City" ADD CONSTRAINT "City_prov_id_fkey" FOREIGN KEY ("prov_id") REFERENCES "Province"("prov_id") ON DELETE RESTRICT ON UPDATE CASCADE;
