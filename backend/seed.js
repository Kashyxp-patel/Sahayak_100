require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  try {
    await prisma.senior.upsert({
      where: { id: 'test-senior-123' },
      update: {},
      create: {
        id: 'test-senior-123',
        phone_number: '1234567890',
        full_name: 'Test Senior',
        physical_address: '123 Test St'
      }
    });

    await prisma.volunteer.upsert({
      where: { id: 'test-volunteer-456' },
      update: {},
      create: {
        id: 'test-volunteer-456',
        phone_number: '0987654321',
        full_name: 'Test Volunteer',
        is_verified: true
      }
    });

    console.log('Dummy senior and volunteer ensured in DB');
  } catch(e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
seed();
