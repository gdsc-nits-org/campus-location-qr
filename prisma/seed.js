const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

const LOCATIONS = [
  {
    slug: 'aryabhatta',
    name: 'Aryabhatta',
    category: 'Hostel',
    latitude: 24.7554,
    longitude: 92.7845,
    mapsUrl: 'https://maps.google.com/?q=24.7554,92.7845',
    description: 'Aryabhatta Hostel',
    isActive: true,
  },
  {
    slug: 'nit-silchar-main-campus',
    name: 'National Institute of Technology, Silchar (Main Campus)',
    category: 'Institute / Landmark',
    latitude: 24.758555,
    longitude: 92.7944703,
    mapsUrl: 'https://www.google.com/maps?q=24.758555,92.7944703',
    description: 'Overall institute point on Google Maps; central reference point for the campus.',
    isActive: true,
  },
  {
    slug: 'nit-silchar-main-gate',
    name: 'NIT Silchar Main Gate',
    category: 'Gate',
    latitude: 24.7584728,
    longitude: 92.796043,
    mapsUrl: 'https://www.google.com/maps?q=24.7584728,92.796043',
    description: "Primary entry/exit gate of the campus, listed as 'NIT GATE' on Google Maps.",
    isActive: true,
  },
  {
    slug: 'new-administrative-building',
    name: 'New Administrative Building',
    category: 'Administrative',
    latitude: 24.7585474,
    longitude: 92.7943734,
    mapsUrl: 'https://www.google.com/maps?q=24.7585474,92.7943734',
    description: "Main administrative block housing the Registrar's office and central administration; newly constructed high-tech building.",
    isActive: true,
  },
  {
    slug: 'apj-abdul-kalam-central-library',
    name: 'Bharat Ratna Dr. A.P.J. Abdul Kalam Learning Resource Centre (Central Library)',
    category: 'Library',
    latitude: 24.757377,
    longitude: 92.7892895,
    mapsUrl: 'https://www.google.com/maps?q=24.757377,92.7892895',
    description: 'Central Library of the institute, one of the largest in Asia; part of the LRC/LTT building.',
    isActive: true,
  },
  {
    slug: 'central-computer-center',
    name: 'Central Computer Center',
    category: 'Academic / Facility',
    latitude: 24.757041,
    longitude: 92.7901846,
    mapsUrl: 'https://www.google.com/maps?q=24.757041,92.7901846',
    description: '24-hour computer center used for computing facilities, competitive exams, and general student computing needs.',
    isActive: true,
  },
  {
    slug: 'dept-electrical-engineering',
    name: 'Department of Electrical Engineering',
    category: 'Academic Department',
    latitude: 24.7571801,
    longitude: 92.7924391,
    mapsUrl: 'https://www.google.com/maps?q=24.7571801,92.7924391',
    description: 'Houses EE classrooms, faculty offices, and labs.',
    isActive: true,
  },
  {
    slug: 'dept-eie',
    name: 'Department of Electronics and Instrumentation Engineering (EIE)',
    category: 'Academic Department',
    latitude: 24.7565124,
    longitude: 92.7895433,
    mapsUrl: 'https://www.google.com/maps?q=24.7565124,92.7895433',
    description: 'Houses EIE classrooms, faculty offices, and labs.',
    isActive: true,
  },
  {
    slug: 'dept-civil-engineering',
    name: 'Department of Civil Engineering',
    category: 'Academic Department',
    latitude: 24.756249,
    longitude: 92.792876,
    mapsUrl: 'https://www.google.com/maps?q=24.756249,92.792876',
    description: 'One of the oldest departments (est. 1977), with multiple testing/research labs.',
    isActive: true,
  },
  {
    slug: 'dept-mechanical-engineering',
    name: 'Department of Mechanical Engineering',
    category: 'Academic Department',
    latitude: 24.7585303,
    longitude: 92.7919962,
    mapsUrl: 'https://www.google.com/maps?q=24.7585303,92.7919962',
    description: 'One of the oldest departments; houses workshops and material science labs.',
    isActive: true,
  },
  {
    slug: 'dept-chemistry',
    name: 'Department of Chemistry',
    category: 'Academic Department',
    latitude: 24.7574105,
    longitude: 92.7924937,
    mapsUrl: 'https://www.google.com/maps?q=24.7574105,92.7924937',
    description: 'Chemistry classrooms and research labs.',
    isActive: true,
  },
  {
    slug: 'dept-management-studies',
    name: 'Department of Management Studies',
    category: 'Academic Department',
    latitude: 24.7573974,
    longitude: 92.7914095,
    mapsUrl: 'https://www.google.com/maps?q=24.7573974,92.7914095',
    description: 'Houses the MBA program and related classrooms/offices.',
    isActive: true,
  },
  {
    slug: 'nit-canteen',
    name: 'NIT Canteen',
    category: 'Food / Canteen',
    latitude: 24.7587331,
    longitude: 92.7944172,
    mapsUrl: 'https://www.google.com/maps?q=24.7587331,92.7944172',
    description: 'Main student canteen inside campus.',
    isActive: true,
  },
  {
    slug: 'nits-cafe',
    name: "NIT's Cafe",
    category: 'Food / Cafe',
    latitude: 24.7583921,
    longitude: 92.792625,
    mapsUrl: 'https://www.google.com/maps?q=24.7583921,92.792625',
    description: 'Popular on-campus cafe for snacks, quick bites, and small celebrations; only dedicated cafe on campus.',
    isActive: true,
  },
  {
    slug: 'nit-silchar-guest-house',
    name: 'NIT Silchar Guest House',
    category: 'Guest House',
    latitude: 24.7568799,
    longitude: 92.7945081,
    mapsUrl: 'https://www.google.com/maps?q=24.7568799,92.7945081',
    description: 'Institute guest house for visiting faculty, parents, and official guests.',
    isActive: true,
  },
  {
    slug: 'sports-complex-main-auditorium',
    name: 'Sports Complex (Main Auditorium/Hall)',
    category: 'Auditorium / Sports',
    latitude: 24.7559242,
    longitude: 92.7833424,
    mapsUrl: 'https://www.google.com/maps?q=24.7559242,92.7833424',
    description: "Largest indoor hall in campus (~2000 capacity); used for concerts, fests, ramp walks, freshers' and farewell parties.",
    isActive: true,
  },
  {
    slug: 'indoor-stadium',
    name: 'Indoor Stadium',
    category: 'Sports Facility',
    latitude: 24.7567253,
    longitude: 92.7887438,
    mapsUrl: 'https://www.google.com/maps?q=24.7567253,92.7887438',
    description: 'Indoor sports facility used for kho-kho, chess, and other indoor tournaments.',
    isActive: true,
  },
  {
    slug: 'football-ground-nit-silchar',
    name: 'Football Ground, NIT Silchar',
    category: 'Sports Facility',
    latitude: 24.7574748,
    longitude: 92.7831399,
    mapsUrl: 'https://www.google.com/maps?q=24.7574748,92.7831399',
    description: 'Main football/athletic ground; also used for Independence/Republic Day events and exhibitions during fests.',
    isActive: true,
  },
  {
    slug: 'student-activity-centre-sac',
    name: 'Student Activity Centre (SAC)',
    category: 'Student Activity Centre',
    latitude: 24.756611,
    longitude: 92.7888751,
    mapsUrl: 'https://www.google.com/maps?q=24.756611,92.7888751',
    description: 'Recreation hub for students — badminton, table tennis, carrom, chess; also used for blood donation camps and events.',
    isActive: true,
  },
  {
    slug: 'nit-silchar-post-office',
    name: 'NIT Silchar Post Office',
    category: 'Administrative / Postal',
    latitude: 24.7565751,
    longitude: 92.7944394,
    mapsUrl: 'https://www.google.com/maps?q=24.7565751,92.7944394',
    description: 'On-campus post office serving students, faculty and staff (part of India Post).',
    isActive: true,
  },
  {
    slug: 'silchar-medical-college-hospital',
    name: 'Silchar Medical College and Hospital (SMCH)',
    category: 'Health / Hospital',
    latitude: 24.7758006,
    longitude: 92.794962,
    mapsUrl: 'https://www.google.com/maps?q=24.7758006,92.794962',
    description: 'Nearest major government hospital used for serious medical emergencies; located just outside campus on Masimpur-Silchar road.',
    isActive: true,
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
      update: loc,
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
