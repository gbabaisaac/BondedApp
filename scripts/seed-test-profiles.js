/**
 * Script to seed test profiles into the KV store
 * 
 * EASIEST WAY: Use the browser console code below instead!
 * 
 * Usage: node scripts/seed-test-profiles.js [school] [count]
 * Example: node scripts/seed-test-profiles.js "University of Illinois" 50
 * 
 * OR use this in your browser console (after logging in):
 * 
 * ```javascript
 * const school = 'YOUR_SCHOOL_NAME';
 * const count = 50;
 * const accessToken = localStorage.getItem('sb-wmlklvlnxftedtylgxsc-auth-token') || '';
 * 
 * fetch('https://wmlklvlnxftedtylgxsc.supabase.co/functions/v1/make-server-2516be19/seed-test-profiles', {
 *   method: 'POST',
 *   headers: {
 *     'Content-Type': 'application/json',
 *     'Authorization': `Bearer ${accessToken}`,
 *   },
 *   body: JSON.stringify({ school, count }),
 * })
 * .then(res => res.json())
 * .then(data => {
 *   console.log('✅ Success!', data);
 *   window.location.reload();
 * })
 * .catch(err => console.error('❌ Error:', err));
 * ```
 */

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://wmlklvlnxftedtylgxsc.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';

// Get school and count from command line args or use defaults
const school = process.argv[2] || 'University of Illinois';
const count = parseInt(process.argv[3]) || 50;

async function seedTestProfiles() {
  try {
    console.log(`🌱 Seeding ${count} test profiles for ${school}...`);
    console.log(`📡 Using Supabase URL: ${SUPABASE_URL}`);

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/make-server-2516be19/seed-test-profiles`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          school,
          count,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Error:', data.error || 'Failed to seed profiles');
      console.error('Response status:', response.status);
      process.exit(1);
    }

    console.log('✅ Success!', data.message);
    console.log(`📊 Created ${data.count} profiles`);
    console.log('\n📝 Sample profiles:');
    data.profiles?.forEach((profile, index) => {
      console.log(`  ${index + 1}. ${profile.name} - ${profile.major} (${profile.year})`);
    });
  } catch (error) {
    console.error('❌ Error seeding profiles:', error.message);
    process.exit(1);
  }
}

seedTestProfiles();

