import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function run() {
  const jobCount = await db.job.count();
  if (jobCount === 0) {
    console.log('Seeding jobs...');
    await db.job.createMany({
      data: [
        {
          title: 'Senior Frontend Engineer',
          company: 'TechFlow Africa',
          location: 'Remote (South Africa)',
          description: 'Looking for a React/Next.js expert with 5+ years of experience to build modern SaaS interfaces. Strong typescript skills and UI/UX appreciation required.'
        },
        {
          title: 'Product Manager',
          company: 'FinTap Solutions',
          location: 'Lagos, Nigeria',
          description: 'Seeking an experienced PM to lead our payment gateway product. Must have agile experience, understand African fintech landscapes, and have strong stakeholder management.'
        },
        {
          title: 'Full-Stack Developer',
          company: 'AgriScale',
          location: 'Nairobi, Kenya',
          description: 'Join our startup digitizing agricultural supply chains. React frontend, Node.js + PostgreSQL backend. Must understand REST APIs and real-time data.'
        }
      ]
    });
    console.log('Jobs seeded!');
  } else {
    console.log('Jobs already seeded.');
  }
}

run().catch(console.error).finally(() => db.$disconnect());
