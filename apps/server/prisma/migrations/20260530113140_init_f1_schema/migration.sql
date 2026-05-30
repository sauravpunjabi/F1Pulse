-- CreateTable
CREATE TABLE "Season" (
    "year" INTEGER NOT NULL,
    "wikipediaUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Season_pkey" PRIMARY KEY ("year")
);

-- CreateTable
CREATE TABLE "Circuit" (
    "circuitId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "locality" TEXT,
    "country" TEXT,
    "lat" DOUBLE PRECISION,
    "long" DOUBLE PRECISION,
    "wikipediaUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Circuit_pkey" PRIMARY KEY ("circuitId")
);

-- CreateTable
CREATE TABLE "Driver" (
    "driverId" TEXT NOT NULL,
    "givenName" TEXT NOT NULL,
    "familyName" TEXT NOT NULL,
    "code" TEXT,
    "permanentNumber" INTEGER,
    "nationality" TEXT,
    "dateOfBirth" DATE,
    "wikipediaUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Driver_pkey" PRIMARY KEY ("driverId")
);

-- CreateTable
CREATE TABLE "Constructor" (
    "constructorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nationality" TEXT,
    "wikipediaUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Constructor_pkey" PRIMARY KEY ("constructorId")
);

-- CreateTable
CREATE TABLE "Race" (
    "id" TEXT NOT NULL,
    "seasonYear" INTEGER NOT NULL,
    "round" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "wikipediaUrl" TEXT,
    "fp1At" TIMESTAMP(3),
    "fp2At" TIMESTAMP(3),
    "fp3At" TIMESTAMP(3),
    "qualifyingAt" TIMESTAMP(3),
    "sprintQualifyingAt" TIMESTAMP(3),
    "sprintAt" TIMESTAMP(3),
    "isSprintWeekend" BOOLEAN NOT NULL DEFAULT false,
    "circuitId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Race_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RaceResult" (
    "id" TEXT NOT NULL,
    "raceId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "constructorId" TEXT NOT NULL,
    "number" INTEGER,
    "position" INTEGER NOT NULL,
    "positionText" TEXT NOT NULL,
    "points" DOUBLE PRECISION NOT NULL,
    "grid" INTEGER NOT NULL,
    "laps" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "timeMillis" INTEGER,
    "timeText" TEXT,
    "fastestLapRank" INTEGER,
    "fastestLapNumber" INTEGER,
    "fastestLapTime" TEXT,
    "fastestLapSpeedKph" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RaceResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QualifyingResult" (
    "id" TEXT NOT NULL,
    "raceId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "constructorId" TEXT NOT NULL,
    "number" INTEGER,
    "position" INTEGER NOT NULL,
    "q1" TEXT,
    "q2" TEXT,
    "q3" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QualifyingResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DriverStanding" (
    "id" TEXT NOT NULL,
    "seasonYear" INTEGER NOT NULL,
    "round" INTEGER NOT NULL,
    "driverId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "positionText" TEXT NOT NULL,
    "points" DOUBLE PRECISION NOT NULL,
    "wins" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DriverStanding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConstructorStanding" (
    "id" TEXT NOT NULL,
    "seasonYear" INTEGER NOT NULL,
    "round" INTEGER NOT NULL,
    "constructorId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "positionText" TEXT NOT NULL,
    "points" DOUBLE PRECISION NOT NULL,
    "wins" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConstructorStanding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IngestRun" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "recordCount" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "IngestRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ConstructorToDriverStanding" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "Race_seasonYear_idx" ON "Race"("seasonYear");

-- CreateIndex
CREATE INDEX "Race_circuitId_idx" ON "Race"("circuitId");

-- CreateIndex
CREATE INDEX "Race_date_idx" ON "Race"("date");

-- CreateIndex
CREATE UNIQUE INDEX "Race_seasonYear_round_key" ON "Race"("seasonYear", "round");

-- CreateIndex
CREATE INDEX "RaceResult_driverId_idx" ON "RaceResult"("driverId");

-- CreateIndex
CREATE INDEX "RaceResult_constructorId_idx" ON "RaceResult"("constructorId");

-- CreateIndex
CREATE INDEX "RaceResult_raceId_idx" ON "RaceResult"("raceId");

-- CreateIndex
CREATE UNIQUE INDEX "RaceResult_raceId_driverId_key" ON "RaceResult"("raceId", "driverId");

-- CreateIndex
CREATE INDEX "QualifyingResult_driverId_idx" ON "QualifyingResult"("driverId");

-- CreateIndex
CREATE INDEX "QualifyingResult_raceId_idx" ON "QualifyingResult"("raceId");

-- CreateIndex
CREATE UNIQUE INDEX "QualifyingResult_raceId_driverId_key" ON "QualifyingResult"("raceId", "driverId");

-- CreateIndex
CREATE INDEX "DriverStanding_seasonYear_round_idx" ON "DriverStanding"("seasonYear", "round");

-- CreateIndex
CREATE INDEX "DriverStanding_driverId_idx" ON "DriverStanding"("driverId");

-- CreateIndex
CREATE UNIQUE INDEX "DriverStanding_seasonYear_round_driverId_key" ON "DriverStanding"("seasonYear", "round", "driverId");

-- CreateIndex
CREATE INDEX "ConstructorStanding_seasonYear_round_idx" ON "ConstructorStanding"("seasonYear", "round");

-- CreateIndex
CREATE INDEX "ConstructorStanding_constructorId_idx" ON "ConstructorStanding"("constructorId");

-- CreateIndex
CREATE UNIQUE INDEX "ConstructorStanding_seasonYear_round_constructorId_key" ON "ConstructorStanding"("seasonYear", "round", "constructorId");

-- CreateIndex
CREATE INDEX "IngestRun_source_scope_idx" ON "IngestRun"("source", "scope");

-- CreateIndex
CREATE UNIQUE INDEX "_ConstructorToDriverStanding_AB_unique" ON "_ConstructorToDriverStanding"("A", "B");

-- CreateIndex
CREATE INDEX "_ConstructorToDriverStanding_B_index" ON "_ConstructorToDriverStanding"("B");

-- AddForeignKey
ALTER TABLE "Race" ADD CONSTRAINT "Race_circuitId_fkey" FOREIGN KEY ("circuitId") REFERENCES "Circuit"("circuitId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Race" ADD CONSTRAINT "Race_seasonYear_fkey" FOREIGN KEY ("seasonYear") REFERENCES "Season"("year") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RaceResult" ADD CONSTRAINT "RaceResult_raceId_fkey" FOREIGN KEY ("raceId") REFERENCES "Race"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RaceResult" ADD CONSTRAINT "RaceResult_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("driverId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RaceResult" ADD CONSTRAINT "RaceResult_constructorId_fkey" FOREIGN KEY ("constructorId") REFERENCES "Constructor"("constructorId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QualifyingResult" ADD CONSTRAINT "QualifyingResult_raceId_fkey" FOREIGN KEY ("raceId") REFERENCES "Race"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QualifyingResult" ADD CONSTRAINT "QualifyingResult_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("driverId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QualifyingResult" ADD CONSTRAINT "QualifyingResult_constructorId_fkey" FOREIGN KEY ("constructorId") REFERENCES "Constructor"("constructorId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverStanding" ADD CONSTRAINT "DriverStanding_seasonYear_fkey" FOREIGN KEY ("seasonYear") REFERENCES "Season"("year") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverStanding" ADD CONSTRAINT "DriverStanding_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("driverId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConstructorStanding" ADD CONSTRAINT "ConstructorStanding_seasonYear_fkey" FOREIGN KEY ("seasonYear") REFERENCES "Season"("year") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConstructorStanding" ADD CONSTRAINT "ConstructorStanding_constructorId_fkey" FOREIGN KEY ("constructorId") REFERENCES "Constructor"("constructorId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ConstructorToDriverStanding" ADD CONSTRAINT "_ConstructorToDriverStanding_A_fkey" FOREIGN KEY ("A") REFERENCES "Constructor"("constructorId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ConstructorToDriverStanding" ADD CONSTRAINT "_ConstructorToDriverStanding_B_fkey" FOREIGN KEY ("B") REFERENCES "DriverStanding"("id") ON DELETE CASCADE ON UPDATE CASCADE;
