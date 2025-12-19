/*
  Warnings:

  - A unique constraint covering the columns `[fullname,brgy_id]` on the table `Yakap` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Yakap_fullname_brgy_id_key" ON "Yakap"("fullname", "brgy_id");
