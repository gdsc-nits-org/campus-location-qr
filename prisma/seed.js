const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

const LOCATIONS = [
  {
    slug: 'main-gate',
    name: 'Main Gate',
    description: 'The primary entrance to the campus. Security check post with visitor registration.',
    category: 'Infrastructure',
    latitude: 12.9716,
    longitude: 77.5946,
    mapsUrl: 'https://maps.google.com/?q=12.9716,77.5946',
    imageUrl: '',
  },
  {
    slug: 'library',
    name: 'Central Library',
    description: 'Multi-floor library with digital resources, reading halls, and 24/7 study zones.',
    category: 'Academic',
    latitude: 12.9720,
    longitude: 77.5950,
    mapsUrl: 'https://maps.google.com/?q=12.9720,77.5950',
    imageUrl: '',
  },
  {
    slug: 'academic-block-a',
    name: 'Academic Block A',
    description: 'Houses departments of Computer Science, Electronics, and Information Technology.',
    category: 'Academic',
    latitude: 12.9725,
    longitude: 77.5955,
    mapsUrl: 'https://maps.google.com/?q=12.9725,77.5955',
    imageUrl: '',
  },
  {
    slug: 'academic-block-b',
    name: 'Academic Block B',
    description: 'Houses departments of Mechanical, Civil, and Chemical Engineering.',
    category: 'Academic',
    latitude: 12.9728,
    longitude: 77.5958,
    mapsUrl: 'https://maps.google.com/?q=12.9728,77.5958',
    imageUrl: '',
  },
  {
    slug: 'hostel-a',
    name: 'Hostel A (Boys)',
    description: 'Boys hostel with 300 rooms, Wi-Fi, gym, and common recreation areas.',
    category: 'Hostel',
    latitude: 12.9730,
    longitude: 77.5960,
    mapsUrl: 'https://maps.google.com/?q=12.9730,77.5960',
    imageUrl: '',
  },
  {
    slug: 'hostel-b',
    name: 'Hostel B (Girls)',
    description: 'Girls hostel with 250 rooms, 24/7 security, common room, and mess facility.',
    category: 'Hostel',
    latitude: 12.9732,
    longitude: 77.5962,
    mapsUrl: 'https://maps.google.com/?q=12.9732,77.5962',
    imageUrl: '',
  },
  {
    slug: 'admin-block',
    name: 'Administrative Block',
    description: 'Principal office, examination cell, accounts, admissions, and all admin offices.',
    category: 'Administration',
    latitude: 12.9718,
    longitude: 77.5948,
    mapsUrl: 'https://maps.google.com/?q=12.9718,77.5948',
    imageUrl: '',
  },
  {
    slug: 'canteen',
    name: 'Main Canteen',
    description: 'Central food court serving breakfast, lunch, snacks, and dinner. Open 7 AM to 10 PM.',
    category: 'Food',
    latitude: 12.9722,
    longitude: 77.5952,
    mapsUrl: 'https://maps.google.com/?q=12.9722,77.5952',
    imageUrl: '',
  },
  {
    slug: 'sports-complex',
    name: 'Sports Complex',
    description: 'Indoor and outdoor sports facilities including courts, tracks, pool, and gymnasium.',
    category: 'Sports',
    latitude: 12.9735,
    longitude: 77.5965,
    mapsUrl: 'https://maps.google.com/?q=12.9735,77.5965',
    imageUrl: '',
  },
  {
    slug: 'medical-centre',
    name: 'Medical Centre',
    description: 'Campus health centre with resident doctor, pharmacy, and emergency first aid. Open 24/7.',
    category: 'Healthcare',
    latitude: 12.9719,
    longitude: 77.5949,
    mapsUrl: 'https://maps.google.com/?q=12.9719,77.5949',
    imageUrl: '',
  },
  {
    slug: 'auditorium',
    name: 'Main Auditorium',
    description: 'Capacity 2000 seat auditorium for convocations, cultural fests, and major events.',
    category: 'Events',
    latitude: 12.9724,
    longitude: 77.5954,
    mapsUrl: 'https://maps.google.com/?q=12.9724,77.5954',
    imageUrl: '',
  },
  {
    slug: 'innovation-centre',
    name: 'Innovation & Startup Hub',
    description: 'State-of-the-art maker space, incubation centre, and co-working zone for student startups.',
    category: 'Innovation',
    latitude: 12.9727,
    longitude: 77.5957,
    mapsUrl: 'https://maps.google.com/?q=12.9727,77.5957',
    imageUrl: '',
  },
]

async function main() {
  console.log('Seeding database...')

  // Seed Super Admin: 84agarwalharshit@gmail.com
  const passwordHash = await bcrypt.hash('campus@2024', 12)
  await prisma.adminUser.upsert({
    where: { email: '84agarwalharshit@gmail.com' },
    update: {
      role: 'SUPER_ADMIN',
    },
    create: {
      email: '84agarwalharshit@gmail.com',
      name: 'Harshit Agarwal',
      passwordHash,
      role: 'SUPER_ADMIN',
    },
  })
  console.log('Super Admin user created (email: 84agarwalharshit@gmail.com, password: campus@2024)')

  for (const loc of LOCATIONS) {
    await prisma.location.upsert({
      where: { slug: loc.slug },
      update: {},
      create: loc,
    })
  }
  console.log(LOCATIONS.length + ' campus locations seeded')
  console.log('Database seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
