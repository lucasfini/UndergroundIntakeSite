# Underground Design - Client Customer Portal

A modern, responsive web application for submitting design project requests to Underground Design at McMaster Student Union. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Multi-step Form**: Clean, intuitive form for submitting project requests
- **Package Selection**: Choose from various design packages (Digital, Multi-Event, Custom, Self-Serve)
- **Add-Ons System**: Select additional services with dynamic pricing calculation
- **File Uploads**: Upload logos, references, and attachments
- **Form Validation**: Client-side validation for all required fields
- **Zendesk Integration**: Automatically creates tickets in your Zendesk account
- **Email Confirmations**: Sends confirmation emails to customers
- **Admin Dashboard**: Manage pricing and packages without touching code
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom reusable components
- **API Integration**: Zendesk REST API

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Zendesk account with API credentials
- (Optional) Email service API key (SendGrid, Resend, etc.)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Configure your environment variables in `.env`:
```env
# Zendesk Configuration
ZENDESK_SUBDOMAIN=your-subdomain
ZENDESK_EMAIL=your-email@example.com
ZENDESK_API_TOKEN=your-api-token

# Email Configuration (Optional)
EMAIL_API_KEY=your-email-api-key
EMAIL_FROM=noreply@undergrounddesign.ca

# Admin Password
ADMIN_PASSWORD=your-secure-password
```

### Getting Zendesk Credentials

1. Log in to your Zendesk account
2. Go to Admin > Channels > API
3. Enable Token Access
4. Generate a new API token
5. Copy your subdomain (from your Zendesk URL: `https://[subdomain].zendesk.com`)
6. Use your Zendesk email and the generated token

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
/app
  /page.tsx              # Landing page
  /form/page.tsx         # Main project request form
  /add-ons/page.tsx      # Package and add-ons selection
  /success/page.tsx      # Success confirmation page
  /admin/page.tsx        # Admin dashboard
  /api
    /submit/route.ts     # Handle initial form submission
    /submit-complete/route.ts  # Final submission with Zendesk
    /admin
      /auth/route.ts     # Admin authentication
      /pricing/route.ts  # Pricing data CRUD

/components
  /ui                    # Reusable UI components
    /Button.tsx
    /Input.tsx
    /TextArea.tsx
    /Select.tsx
    /FileUpload.tsx

/lib
  /types.ts             # TypeScript type definitions
  /zendesk.ts           # Zendesk API integration
  /email.ts             # Email service integration

/data
  /pricing.json         # Pricing data (editable via admin)

/public
  /uploads              # Uploaded files storage
```

## Usage

### For Customers

1. Visit the homepage
2. Click "New Project Request"
3. Fill out the form with project details
4. Upload any logos or reference files
5. Select a package and add-ons
6. Submit the request
7. Receive confirmation email

### For Admins

1. Visit `/admin`
2. Login with the admin password (from `.env`)
3. Edit packages and add-ons pricing
4. Save changes

## Customization

### Updating Pricing

You can update pricing in two ways:

1. **Via Admin Dashboard** (Recommended):
   - Go to `/admin`
   - Login and edit prices directly
   - Changes are saved to `data/pricing.json`

2. **Via JSON File**:
   - Edit `data/pricing.json` directly
   - Changes will be reflected immediately

### Styling

The site uses Underground Design branding:
- Primary color: `#1a5f5a` (underground-teal)
- Secondary color: `#357f5c` (underground-green)
- Font: Varela Round

Update colors in `tailwind.config.ts` to match your brand.

### Email Templates

Edit the email template in `lib/email.ts` to customize confirmation emails.

### Zendesk Ticket Format

Modify the ticket structure in `lib/zendesk.ts` to match your workflow.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- DigitalOcean App Platform
- Self-hosted with PM2

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ZENDESK_SUBDOMAIN` | Yes | Your Zendesk subdomain |
| `ZENDESK_EMAIL` | Yes | Your Zendesk admin email |
| `ZENDESK_API_TOKEN` | Yes | Your Zendesk API token |
| `EMAIL_API_KEY` | No | Email service API key |
| `EMAIL_FROM` | No | Sender email address |
| `ADMIN_PASSWORD` | Yes | Admin dashboard password |

## Troubleshooting

### Forms not submitting

- Check console for errors
- Verify Zendesk credentials are correct
- Ensure API token has proper permissions

### Files not uploading

- Check file size limits (default: 10MB)
- Verify `public/uploads` directory exists and is writable
- Check browser console for errors

### Pricing not updating

- Verify you're logged into admin
- Check `data/pricing.json` file permissions
- Look for errors in browser console

## Security Notes

- Admin authentication is basic (password-only)
- For production, consider:
  - Using a proper authentication system (NextAuth.js)
  - Rate limiting on API endpoints
  - CSRF protection
  - File upload validation and scanning

## Support

For questions or issues:
- Email: ugmanager@msu.mcmaster.ca
- Hours: Monday - Friday, 10am - 4pm

## License

© 2024 Underground Design - McMaster Student Union
