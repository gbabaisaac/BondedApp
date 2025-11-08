# CampusBond - Test Account Information

## Quick Start

### Option 1: Create Test Data (Recommended for first-time setup)

1. Click the "Need to create test data? Click here" link on the login page
2. Or navigate directly to: `?setup=test`
3. Click "Create Test Accounts" button
4. Wait for the accounts to be created
5. Click "Go to Login" and sign in with any of the test accounts below

### Option 2: Quick Login (If test data already exists)

1. On the login page, click "Show test accounts"
2. Click any account to auto-fill credentials
3. Click "Sign In"

## Test Accounts

All test accounts use the password: **test123**

### 1. John Doe - Computer Science Major
- **Email:** john.doe@stanford.edu
- **Password:** test123
- **Profile:** Night owl, organized, looking for roommate and friends
- **Interests:** Coding, Gaming, Hiking, Music, Movies
- **Personality:** Introverted, Night Owl, Organized, Studious
- **Living:** Very clean, quiet, guests sometimes

### 2. Sarah Johnson - Biology Major
- **Email:** sarah.johnson@stanford.edu
- **Password:** test123
- **Profile:** Early bird, social, pre-med student
- **Interests:** Fitness, Reading, Cooking, Volunteering, Sports
- **Personality:** Extroverted, Early Bird, Organized, Social
- **Living:** Very clean, moderate noise, guests often

### 3. Mike Chen - Business Major
- **Email:** mike.chen@stanford.edu
- **Password:** test123
- **Profile:** Social, entrepreneur, night owl
- **Interests:** Sports, Music, Travel, Gaming, Fitness
- **Personality:** Extroverted, Night Owl, Spontaneous, Social
- **Living:** Moderate cleanliness, lively, guests often

### 4. Emily Davis - Psychology Major
- **Email:** emily.davis@stanford.edu
- **Password:** test123
- **Profile:** Quiet, studious, introspective
- **Interests:** Reading, Art, Meditation, Writing, Movies
- **Personality:** Introverted, Early Bird, Organized, Studious, Creative
- **Living:** Very clean, quiet, guests rarely

### 5. Alex Rodriguez - Engineering Major
- **Email:** alex.rodriguez@stanford.edu
- **Password:** test123
- **Profile:** Creative, senior, outdoorsy
- **Interests:** Coding, Music, Outdoors, Photography, Fitness
- **Personality:** Extroverted, Night Owl, Creative, Spontaneous
- **Living:** Clean, moderate noise, guests sometimes

## Features to Test

### 1. Discovery Feed
- Browse all students at Stanford
- Search by name, major, or interests
- Filter by what they're looking for (Roommate, Friends, etc.)

### 2. AI Matching
- View personalized matches based on compatibility
- See match scores and reasons
- Higher scores indicate better compatibility

### 3. Profile Details
- Click any profile card to view full details
- See interests, personality traits, living habits
- View social media links

### 4. Messaging
- Start a chat from any profile
- Send real-time messages
- View conversation history

### 5. Your Profile
- View your complete profile
- See all your information as others see it

## Match Compatibility Examples

**Good Matches:**
- John & Emily: Both introverted, organized, studious, very clean
- Sarah & Mike: Both extroverted, social, active lifestyles
- John & Alex: Both love coding, music, creative pursuits

**Lower Compatibility:**
- Sarah & Emily: Different sleep schedules (early bird vs varies)
- Mike & Emily: Different social preferences (lively vs quiet)

## Troubleshooting

### "No profiles found"
- Make sure test data has been created via the setup page
- Check that you're signed in with a @stanford.edu account

### "Unauthorized" errors
- Try logging out and back in
- Clear browser cache and cookies

### Chat not working
- Ensure both users have profiles created
- Check the Messages tab after starting a chat

## Development Notes

- All test accounts are at Stanford University
- Password for all accounts: test123
- Data is stored in Supabase backend
- Real-time features poll every 3-5 seconds
