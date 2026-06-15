import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('Initiating production database seed and Superadmin verification...');

  // 1. Check if ANY superadmin exists
  const superAdminExists = await prisma.user.findFirst({
    where: { role: 'SUPERADMIN' }
  });

  if (superAdminExists) {
    console.log('A Superadmin user already exists. Seed process bypassing admin creation for security.');
  } else {
    // 2. Fetch from environment variables or generate securely
    const rawPassword = process.env.DEFAULT_SUPERADMIN_PASSWORD || crypto.randomBytes(16).toString('hex');
    const adminEmail = process.env.DEFAULT_SUPERADMIN_EMAIL || 'admin@matchengine.com';

    // 3. Hash the password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(rawPassword, saltRounds);

    // 4. Create the Superadmin
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: 'System Administrator',
        role: 'SUPERADMIN'
      }
    });

    console.log('\n======================================================');
    console.log('SUCCESS: Master Superadmin Created!');
    console.log(`Email: ${adminEmail}`);
    if (!process.env.DEFAULT_SUPERADMIN_PASSWORD) {
      console.log(`Auto-generated Password: ${rawPassword}`);
      console.log('IMPORTANT: Please store this password securely and change it immediately upon login.');
    }
    console.log('======================================================\n');
  }

  // You can place other lookup tables/seeds here

  console.log('Seed sequence complete.');
}

main()
  .catch((e) => {
    console.error('Fatal Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
