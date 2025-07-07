# Setup Instructions for TikTok Scraper Desktop App

## 🚀 Quick Start Guide

### 1. Create Environment Variables

Create these two files in your `DesktopApp` folder:

**`.env`**:
```env
REACT_APP_SUPABASE_URL=https://ibiqemjtkzxlvhmcdbam.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImliaXFlbWp0a3p4bHZobWNkYmFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1ODk3MjEsImV4cCI6MjA2NzE2NTcyMX0.ZYouZW5wJ_FHcJSY-48ipz_LO1vRYAiKq1_hIHDsubo
```

**`.env.local`**:
```env
REACT_APP_SUPABASE_URL=https://ibiqemjtkzxlvhmcdbam.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImliaXFlbWp0a3p4bHZobWNkYmFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1ODk3MjEsImV4cCI6MjA2NzE2NTcyMX0.ZYouZW5wJ_FHcJSY-48ipz_LO1vRYAiKq1_hIHDsubo
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImliaXFlbWp0a3p4bHZobWNkYmFtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTU4OTcyMSwiZXhwIjoyMDY3MTY1NzIxfQ.SLe4kqtQojLfffHL7P8ol-MdLBD8wi0FC0rT2BoQHKU
```

### 2. Set up Supabase Database

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `database-setup.sql` into the SQL editor
4. Run the SQL code to create the necessary tables and policies

### 3. Configure Supabase Auth

1. In your Supabase dashboard, go to **Authentication** > **Settings**
2. Configure the following:
   - **Site URL**: `http://localhost:3000` (for development)
   - **Redirect URLs**: Add `http://localhost:3000` to allowed redirect URLs
   - **Email Auth**: Enable email authentication
   - **Confirm email**: Enable email confirmation with links (not OTP)

### 4. Install Dependencies and Run

```bash
cd DesktopApp
npm install
npm run electron-dev
```

## ✨ Features Implemented

### 🔐 Authentication
- **Email/Password Sign Up**: Users can create accounts with email and password
- **Email/Password Sign In**: Returning users can sign in with credentials
- **Session Management**: Sessions persist with 365-day expiration
- **Email Verification**: New users must click confirmation link in email to verify account

### 🎨 UI/UX
- **Draggable Window**: Click and drag the top bar to move the window
- **Glassmorphism Design**: Modern, translucent design with blur effects
- **Mac-native Styling**: Proper macOS integration with native title bar
- **Responsive Layout**: Adapts to different window sizes

### 🔧 Technical Features
- **Electron + React**: Desktop app with web technologies
- **Supabase Integration**: Full authentication and database integration
- **Real-time Auth**: Automatic session management and auth state updates
- **Secure Storage**: Credentials stored securely in localStorage

## 🗂️ Project Structure

```
DesktopApp/
├── src/
│   ├── components/
│   │   ├── Auth.js          # Authentication component
│   │   ├── Auth.css         # Auth styles
│   │   ├── Dashboard.js     # Post-login dashboard
│   │   └── Dashboard.css    # Dashboard styles
│   ├── lib/
│   │   └── supabase.js      # Supabase client config
│   ├── electron/
│   │   └── main.js          # Electron main process
│   ├── App.js               # Main app component
│   └── App.css              # App styles
├── .env                     # Environment variables
├── .env.local              # Local environment variables
├── database-setup.sql       # Supabase database setup
└── package.json            # Dependencies and scripts
```

## 🚀 Next Steps

1. **Test the Authentication Flow**:
   - Run `npm run electron-dev`
   - Try signing up with a real email and password
   - Check your email for confirmation link
   - Click the link to verify your account
   - Sign in with your email and password

2. **Customize the Dashboard**:
   - Add your TikTok scraping functionality
   - Connect to your existing `main.py` script
   - Add more features and UI components

3. **Build for Production**:
   - Run `npm run dist` to create a distributable app
   - Test the production build thoroughly

## 🛠️ Troubleshooting

- **App won't start**: Make sure you've created both `.env` files
- **Can't drag window**: The drag functionality only works on the top bar with dots
- **Authentication errors**: Check your Supabase configuration and environment variables
- **Email not sending**: Verify your Supabase email settings and SMTP configuration

## 📧 Need Help?

If you encounter any issues, check:
1. Console logs in the developer tools
2. Supabase dashboard for auth logs
3. Network tab for API request errors 