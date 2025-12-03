# Quick Start Guide - Zendesk Integration

## 5-Minute Setup (Basic Integration)

Follow these steps to get your form connected to Zendesk quickly:

### 1. Get Your Zendesk API Credentials (2 minutes)

1. Log in to Zendesk at `https://YOUR-SUBDOMAIN.zendesk.com`
2. Click the **Admin** gear icon (bottom-left)
3. Navigate to: **Apps and integrations** → **APIs** → **Zendesk API**
4. Under the **Settings** tab:
   - Enable **Token Access** (toggle it on)
   - Click **+ Add API Token**
   - Give it a description: "Underground Design Form"
   - Click **Copy** to copy the token
   - **Save it somewhere safe!** (You won't see it again)

### 2. Configure Your .env File (1 minute)

1. Open the `.env` file in your project root
2. Replace these three lines with your actual values:

```env
ZENDESK_SUBDOMAIN=mcmaster
ZENDESK_EMAIL=your-email@mcmaster.ca
ZENDESK_API_TOKEN=paste-your-token-here
```

**Example:**
```env
ZENDESK_SUBDOMAIN=mcmaster-msu
ZENDESK_EMAIL=ugmanager@msu.mcmaster.ca
ZENDESK_API_TOKEN=yJ8x3KqT9mNpLs2VbCdRfGhW4kZt
```

### 3. Test It! (1 minute)

1. Start your server:
   ```bash
   npm run dev
   ```

2. Open your browser to `http://localhost:3000`

3. Fill out and submit the form

4. Check your Zendesk - you should see a new ticket!

---

## That's It!

Your basic integration is working! The form will now:
- ✅ Create tickets in Zendesk
- ✅ Include all form data in the ticket description
- ✅ Set the requester as the person who filled out the form
- ✅ Tag tickets with `intake-portal`, `project-request`, and the service type

---

## Next Steps (Optional)

### Add Custom Fields for Better Organization

Custom fields let you filter, sort, and create reports on your design requests.

👉 **See [ZENDESK_SETUP.md](./ZENDESK_SETUP.md) for the full custom fields setup guide**

### What You'll Get with Custom Fields:

- Sort requests by service type
- Filter by event date
- Track package selections and pricing
- Create automated workflows based on field values
- Generate reports on your most requested services

**Time to set up:** 15-20 minutes
**Worth it?** Yes, if you process more than 5 requests per week!

---

## Troubleshooting

### "Zendesk credentials not configured"
- Check that your `.env` file has all three values filled in
- Make sure there are no extra spaces
- Restart your development server: `Ctrl+C` then `npm run dev`

### "Failed to create ticket: 401 Unauthorized"
- Your API token is incorrect
- Make sure you're using the token, not your password
- Check that your email is correct
- Verify that Token Access is enabled in Zendesk

### "Tickets are created but I don't see them"
- Check your **Views** in Zendesk
- Look under **All Tickets** or create a view for tag: `intake-portal`
- Make sure you're logged in as the same user configured in `.env`

### Need More Help?

- 📖 [Full Setup Guide](./ZENDESK_SETUP.md)
- 🔗 [Zendesk API Docs](https://developer.zendesk.com/api-reference/)
- 💬 Contact: ugmanager@msu.mcmaster.ca

---

## Testing Checklist

Before going live, test these scenarios:

- [ ] Submit a basic form - does it create a ticket?
- [ ] Check the ticket content - is all data included?
- [ ] Try selecting different packages - does pricing show up?
- [ ] Add multiple add-ons - are they listed correctly?
- [ ] Upload files - are they mentioned in the ticket?
- [ ] Check the requester email - does it match the form?
- [ ] Look for tags - are they applied correctly?

---

## Going Live

When you're ready to deploy:

1. Add the same environment variables to your hosting platform (Vercel, Netlify, etc.)
2. Make sure file uploads are configured correctly
3. Test the form in production
4. Set up Zendesk notifications/automations
5. Train your team on the new workflow

**Production Checklist:**
- [ ] Environment variables configured in hosting platform
- [ ] Tested form submission in production
- [ ] Zendesk notifications set up
- [ ] Team trained on new intake process
- [ ] Old intake form redirected or removed
