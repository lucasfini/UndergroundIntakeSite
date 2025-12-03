import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const INITIAL_SERVICES = [
  'Avtek',
  'Campus Events',
  'CFMU',
  'Diversity + Equity Network',
  'EFRT',
  'First Year Council',
  'Food Collective Centre',
  'HotSpot',
  'Macademics',
  'Maccess',
  'Maroons',
  'Ombuds',
  'Pride',
  'SHEC',
  'Spark',
  'SWHAT',
  'WGEN',
  'Clubs',
  'Elections',
  'Hub',
  'SRA',
  'TwelveEighty',
]

async function main() {
  console.log('Seeding allowed departments...')

  for (const serviceName of INITIAL_SERVICES) {
    await prisma.allowedDepartment.upsert({
      where: { name: serviceName },
      update: {},
      create: {
        name: serviceName,
        displayName: serviceName,
        isActive: true,
        createdBy: 'system',
      },
    })
    console.log(`✓ ${serviceName}`)
  }

  console.log('Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
