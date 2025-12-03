// Quick test script to verify Zendesk credentials
// Run with: node test-zendesk.js

const subdomain = 'undergroundmediaanddesign'
const email = 'ittech@msu.mcmaster.ca'
const apiToken = '8mvmoP5dyE3uOniu6FYiAYsxDLRZeSIWCtXVspVb'

const auth = Buffer.from(`${email}/token:${apiToken}`).toString('base64')

console.log('Testing Zendesk API connection...')
console.log('Subdomain:', subdomain)
console.log('Email:', email)
console.log('Token:', apiToken.substring(0, 5) + '...' + apiToken.substring(apiToken.length - 5))
console.log('Auth Header:', `Basic ${auth.substring(0, 20)}...`)
console.log('')

// Test with a simple API call to get the current user
fetch(`https://${subdomain}.zendesk.com/api/v2/users/me.json`, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Basic ${auth}`,
  },
})
  .then(async (response) => {
    console.log('Response Status:', response.status)
    const data = await response.json()

    if (response.ok) {
      console.log('✅ SUCCESS! Authentication works!')
      console.log('Logged in as:', data.user.name)
      console.log('Email:', data.user.email)
      console.log('Role:', data.user.role)
      console.log('')
      console.log('Your Zendesk integration should work now.')
      console.log('Try submitting the form again.')
    } else {
      console.log('❌ FAILED! Authentication error')
      console.log('Error:', JSON.stringify(data, null, 2))
      console.log('')
      console.log('Common fixes:')
      console.log('1. Double-check your email address')
      console.log('2. Regenerate your API token in Zendesk')
      console.log('3. Make sure Token Access is enabled in Zendesk settings')
      console.log('4. Verify your account has Admin or Agent permissions')
    }
  })
  .catch((error) => {
    console.log('❌ CONNECTION ERROR')
    console.log('Error:', error.message)
    console.log('')
    console.log('This usually means:')
    console.log('1. The subdomain is wrong')
    console.log('2. Network/firewall issue')
    console.log('3. Zendesk is down (unlikely)')
  })
