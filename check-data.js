const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function check() {
  try {
    const cars = await prisma.rentalCar.count();
    const hosts = await prisma.rentalHost.count();
    const bookings = await prisma.rentalBooking.count();
    
    console.log("Database Status:");
    console.log("Rental Cars:", cars);
    console.log("Rental Hosts:", hosts);
    console.log("Rental Bookings:", bookings);
    
    const car = await prisma.rentalCar.findFirst({
      where: { status: "available" },
      include: { host: true }
    });
    
    if (car) {
      console.log("\nFirst Available Car:");
      console.log("ID:", car.id);
      console.log("Car:", car.year, car.make, car.model);
      console.log("Daily Rate:", car.dailyRate);
      console.log("Host:", car.host.name);
    } else {
      console.log("\nNo available cars found!");
    }
    
    // Check for any bookings
    const recentBooking = await prisma.rentalBooking.findFirst({
      orderBy: { createdAt: "desc" },
      take: 1
    });
    
    if (recentBooking) {
      console.log("\nMost Recent Booking:");
      console.log("ID:", recentBooking.id);
      console.log("Status:", recentBooking.status);
      console.log("Trip Status:", recentBooking.tripStatus);
    }
    
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

check();
