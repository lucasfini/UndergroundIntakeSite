/**
 * Test Email to Service Mapping
 * Run with: node test-email-mapping.js
 */

// Service mapping from email prefix to service name
const SERVICE_MAP = {
  // A
  'eventstech': 'Avtek',

  // C
  'campusevents': 'Campus Events',
  'campus': 'Campus Events',
  'eventspromo': 'Campus Events',
  'cfmupromotions': 'CFMU',
  'cfmu': 'CFMU',
  'clubsadmin': 'Clubs',
  'clubs': 'Clubs',

  // D
  'diversitypromotions': 'Diversity + Equity Network',
  'diversity': 'Diversity + Equity Network',

  // E
  'efrt': 'EFRT',
  'elections': 'Elections',

  // F
  'fccpromo': 'Food Collective Centre',
  'fcc': 'Food Collective Centre',
  'foodcollective': 'Food Collective Centre',
  'fyc': 'First Year Council',

  // H
  'ittech': 'HotSpot',
  'hotspot': 'HotSpot',
  'hub': 'Hub',

  // M
  'macademicspromo': 'Macademics',
  'macademics': 'Macademics',
  'maccesspromo': 'Maccess',
  'maccess': 'Maccess',
  'maroonspromo': 'Maroons',
  'maroons': 'Maroons',

  // O
  'ombuds': 'Ombuds',

  // P
  'pridepromo': 'Pride',
  'pride': 'Pride',

  // S
  'shecpromotions': 'SHEC',
  'shec': 'SHEC',
  'sparkpromopub': 'Spark',
  'sparkpromo': 'Spark',
  'spark': 'Spark',
  'sra': 'SRA',
  'vpacademic': 'SRA',
  'vpexternal': 'SRA',
  'vpfinance': 'SRA',
  'speaker': 'SRA',
  'sm1280': 'TwelveEighty',
  'swhat': 'SWHAT',

  // T
  'twelveeighty': 'TwelveEighty',
  '1280': 'TwelveEighty',
  'grind': 'TwelveEighty',
  'union': 'TwelveEighty',

  // W
  'wgenpromo': 'WGEN',
  'wgen': 'WGEN',
}

function normalizePrefix(prefix) {
  return prefix
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '') // Remove special characters
    .trim()
}

function getServiceFromEmail(email) {
  if (!email || typeof email !== 'string') {
    return { success: false, error: 'Invalid email address provided' }
  }

  const normalizedEmail = email.toLowerCase().trim()

  if (!normalizedEmail.includes('@')) {
    return { success: false, error: 'Invalid email format: missing @ symbol' }
  }

  const [prefix, domain] = normalizedEmail.split('@')

  if (!domain || !domain.includes('msu.mcmaster.ca')) {
    return { success: false, error: 'Not an MSU email address (@msu.mcmaster.ca required)' }
  }

  const normalizedPrefix = normalizePrefix(prefix)

  // Check direct match first
  if (SERVICE_MAP[normalizedPrefix]) {
    return { success: true, service: SERVICE_MAP[normalizedPrefix], method: 'direct match' }
  }

  // Check for partial matches
  for (const [key, value] of Object.entries(SERVICE_MAP)) {
    if (normalizedPrefix.startsWith(key) || normalizedPrefix.includes(key)) {
      return { success: true, service: value, method: `partial match (${key})` }
    }
  }

  return { success: false, error: `No service found for email prefix: ${prefix}` }
}

// Test emails
const testEmails = [
  // Known emails from CSV
  'eventstech@msu.mcmaster.ca',
  'eventspromo@msu.mcmaster.ca',
  'cfmupromotions@msu.mcmaster.ca',
  'diversitypromotions@msu.mcmaster.ca',
  'efrt@msu.mcmaster.ca',
  'fyc@msu.mcmaster.ca',
  'fccpromo@msu.mcmaster.ca',
  'ittech@msu.mcmaster.ca',
  'macademicspromo@msu.mcmaster.ca',
  'maccesspromo@msu.mcmaster.ca',
  'maroons_promo@msu.mcmaster.ca',
  'ombuds@msu.mcmaster.ca',
  'pridepromo@msu.mcmaster.ca',
  'shecpromotions@msu.mcmaster.ca',
  'sparkpromo_pub@msu.mcmaster.ca',
  'swhat@msu.mcmaster.ca',
  'wgenpromo@msu.mcmaster.ca',
  'elections@msu.mcmaster.ca',
  'clubsadmin@msu.mcmaster.ca',
  'sm1280@msu.mcmaster.ca',
  'hub@msu.mcmaster.ca',

  // SRA test cases - these need to be added!
  'sra@msu.mcmaster.ca',
  'vpacademic@msu.mcmaster.ca',
  'vpexternal@msu.mcmaster.ca',
  'vpfinance@msu.mcmaster.ca',
  'speaker@msu.mcmaster.ca',
  'sraeng@msu.mcmaster.ca',

  // Variations to test partial matching
  'cfmu-events@msu.mcmaster.ca',
  'maroons-social@msu.mcmaster.ca',
  'clubs-coordinator@msu.mcmaster.ca',

  // Invalid tests
  'test@gmail.com',
  'notanemail',
]

console.log('='.repeat(80))
console.log('EMAIL TO SERVICE MAPPING TEST')
console.log('='.repeat(80))
console.log()

let successCount = 0
let failCount = 0

testEmails.forEach(email => {
  const result = getServiceFromEmail(email)

  if (result.success) {
    console.log(`✅ ${email}`)
    console.log(`   → Service: ${result.service}`)
    console.log(`   → Match: ${result.method}`)
    successCount++
  } else {
    console.log(`❌ ${email}`)
    console.log(`   → Error: ${result.error}`)
    failCount++
  }
  console.log()
})

console.log('='.repeat(80))
console.log(`RESULTS: ${successCount} successful, ${failCount} failed`)
console.log('='.repeat(80))
console.log()

// Show what email patterns are missing
console.log('MISSING MAPPINGS (add these to serviceMapping.ts):')
console.log('─'.repeat(80))
testEmails.forEach(email => {
  const result = getServiceFromEmail(email)
  if (!result.success && email.includes('@msu.mcmaster.ca')) {
    const prefix = email.split('@')[0]
    const normalizedPrefix = normalizePrefix(prefix)
    console.log(`  '${normalizedPrefix}': 'ServiceName',  // ${email}`)
  }
})
console.log()
