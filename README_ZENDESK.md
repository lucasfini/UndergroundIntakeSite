# Underground Design Intake Form - Zendesk Integration

## 🎉 Your Form is Ready for Zendesk!

Your intake form has been set up with full Zendesk integration. Here's everything you need to know.

---

## ✅ What's Already Built

Your form includes:

1. **Complete Zendesk API Integration**
   - Automatically creates tickets when forms are submitted
   - Includes all form data in ticket description
   - Sets requester information correctly
   - Adds tags for easy filtering

2. **Support for Custom Fields**
   - Ready to use Zendesk custom fields
   - Automatically maps form data to ticket fields
   - Optional - works great without them too!

3. **Smart Features**
   - File upload handling
   - Package and add-on selection
   - Price calculation
   - Multi-step form with review page
   - Error handling and validation

4. **Email Notifications (Template Ready)**
   - Send confirmation emails to requesters
   - Include ticket reference numbers
   - Customizable templates

---

## 🚀 Getting Started (Choose Your Path)

### Option 1: Quick Start (5 minutes)
Just want to get tickets into Zendesk? Follow this:

1. 📖 Read **[QUICKSTART.md](./QUICKSTART.md)**
2. Get your Zendesk API credentials
3. Update your `.env` file
4. Test it!

**Perfect for:** Getting up and running quickly, testing the integration

---

### Option 2: Full Setup with Custom Fields (20 minutes)
Want to organize requests, create reports, and automate workflows?

1. 📖 Read **[ZENDESK_SETUP.md](./ZENDESK_SETUP.md)**
2. Create custom fields in Zendesk
3. Configure field IDs in `.env`
4. Set up views and automations

**Perfect for:** Production use, high-volume requests, team workflows

---

## 📋 What You Need from Zendesk

### Required (for basic integration):
- ✅ Zendesk subdomain (e.g., "mcmaster-msu")
- ✅ Admin email address
- ✅ API token (created in Zendesk settings)

### Optional (for custom fields):
- 📊 Custom field IDs (see setup guide)

---

## 📁 Documentation Files

| File | What It's For | Read Time |
|------|---------------|-----------|
| **QUICKSTART.md** | Get running in 5 minutes | 2 min |
| **ZENDESK_SETUP.md** | Complete setup with custom fields | 10 min |
| **ZENDESK_TICKET_EXAMPLE.md** | See what tickets will look like | 5 min |
| **.env.example** | Environment variable template | 1 min |

---

## 🔧 Configuration Files

### .env (Environment Variables)
Location: `/UndergroundIntakeSite/.env`

This file stores your Zendesk credentials. It's already set up - you just need to fill in your actual values.

**Required:**
```env
ZENDESK_SUBDOMAIN=your-subdomain
ZENDESK_EMAIL=your-email@mcmaster.ca
ZENDESK_API_TOKEN=your-token
```

**Optional (Custom Fields):**
```env
ZENDESK_FIELD_SERVICE_TYPE=123456789
ZENDESK_FIELD_EVENT_NAME=123456790
# ... etc
```

---

## 📊 How It Works

### The User Journey:

1. **User fills out form** (`/form`)
   - Contact info
   - Event details
   - Content requirements

2. **Selects package & add-ons** (`/add-ons`)
   - Chooses a package
   - Adds optional extras
   - Sees live price calculation

3. **Reviews order** (`/review`)
   - Confirms all information
   - Sees total price
   - Can go back to edit

4. **Submits request** ✨
   - Form data sent to your API
   - **Ticket created in Zendesk**
   - Confirmation shown to user
   - Optional: Email sent

---

## 🎫 What Gets Created in Zendesk

### Every submission creates:

**Ticket with:**
- Subject: "Project Request: [Event Name] - [Requester Name]"
- Description: All form data formatted nicely
- Requester: Person who filled out form
- Tags: `intake-portal`, `project-request`, [service-type]
- Priority: Normal
- Custom Fields: If configured

**Example:**
- Subject: "Project Request: Spring Concert 2024 - Sarah Johnson"
- Requester: sjohnson@mcmaster.ca
- Tags: intake-portal, project-request, graphic-design

👉 See [ZENDESK_TICKET_EXAMPLE.md](./ZENDESK_TICKET_EXAMPLE.md) for full example

---

## 🎯 Next Steps

### 1. Choose Your Setup Path
- Quick (5 min): Just get it working → [QUICKSTART.md](./QUICKSTART.md)
- Full (20 min): Set up everything → [ZENDESK_SETUP.md](./ZENDESK_SETUP.md)

### 2. Get Your Credentials
- Log into Zendesk
- Create API token
- Note your subdomain

### 3. Configure & Test
- Update `.env` file
- Start development server: `npm run dev`
- Submit a test form
- Check Zendesk for the ticket

### 4. Customize (Optional)
- Set up custom fields
- Create Zendesk views
- Configure automations
- Set up email notifications

### 5. Deploy
- Push to your hosting platform (Vercel, Netlify, etc.)
- Add environment variables
- Test in production
- Go live! 🎉

---

## 🛠️ Technical Details

### API Endpoints

**Form Submission:**
- `POST /api/submit` - Handles initial form data and file uploads
- `POST /api/submit-complete` - Creates Zendesk ticket and sends confirmation

### File Handling
- Files are uploaded to `/public/uploads/[submissionId]/`
- Supports logos and attachments
- File paths included in ticket description

### Error Handling
- If Zendesk fails, user still sees success (graceful degradation)
- Errors logged to console
- User-friendly error messages

---

## 🔒 Security Notes

1. **Never commit .env to git** - It's already in `.gitignore`
2. **Keep your API token secret** - Don't share it
3. **Use environment variables in production** - Configure in your hosting platform
4. **Token has full API access** - Only use for server-side calls

---

## 📞 Support & Resources

### Documentation
- [Zendesk API Reference](https://developer.zendesk.com/api-reference/)
- [Custom Fields Guide](https://support.zendesk.com/hc/en-us/articles/4408822095642)
- [Zendesk Views](https://support.zendesk.com/hc/en-us/articles/4408832065690)

### Your Files
- 📘 Quick Start: [QUICKSTART.md](./QUICKSTART.md)
- 📖 Full Setup: [ZENDESK_SETUP.md](./ZENDESK_SETUP.md)
- 🎫 Ticket Example: [ZENDESK_TICKET_EXAMPLE.md](./ZENDESK_TICKET_EXAMPLE.md)

### Questions?
Contact: ugmanager@msu.mcmaster.ca

---

## 🚦 Quick Status Check

Before you start, make sure you have:

- [ ] Access to Zendesk admin panel
- [ ] Ability to create API tokens
- [ ] Node.js and npm installed
- [ ] Project files downloaded
- [ ] Code editor open

Ready? → [QUICKSTART.md](./QUICKSTART.md)

---

## 💡 Pro Tips

1. **Test with custom fields disabled first** - Get the basic integration working, then add custom fields
2. **Create a test Zendesk account** - Practice with a sandbox before using production
3. **Set up views before going live** - Know where tickets will show up
4. **Train your team** - Make sure everyone knows the new workflow
5. **Keep the old form for 1 week** - Have a backup during transition

---

Made with ❤️ for Underground Design at McMaster Student Union
