# Zendesk Integration Setup Guide

This guide will walk you through setting up your Underground Design Intake Form with Zendesk.

## Step 1: Create a Zendesk API Token

1. Log in to your Zendesk account
2. Go to **Admin** (gear icon) → **Apps and integrations** → **APIs** → **Zendesk API**
3. Click on **Settings** tab
4. Enable **Token Access**
5. Click **Add API Token**
6. Give it a name like "Underground Design Intake Form"
7. Copy the token (you won't be able to see it again!)

## Step 2: Configure Environment Variables

1. Open the `.env` file in your project root
2. Update the following values:

```env
# Zendesk Configuration
ZENDESK_SUBDOMAIN=your-subdomain  # e.g., if your URL is https://mcmaster.zendesk.com, use "mcmaster"
ZENDESK_EMAIL=your-email@mcmaster.ca  # Your Zendesk admin email
ZENDESK_API_TOKEN=your-api-token-here  # The token from Step 1
```

## Step 3: Create Custom Ticket Fields in Zendesk

To properly organize your intake requests, you should create custom fields in Zendesk:

### Creating Custom Fields:

1. In Zendesk, go to **Admin** → **Manage** → **Ticket Fields**
2. Click **Add Field** for each of the following:

#### Recommended Custom Fields:

| Field Name | Field Type | Key (for API) | Options/Settings |
|------------|------------|---------------|------------------|
| Service Type | Drop-down | service_type | Options: Graphic Design, Social Media Content, Print Services, Branding, Other |
| Event Name | Text | event_name | Required field |
| Event Date | Date | event_date | Required field |
| Event Location | Text | event_location | Optional |
| Event Time | Text | event_time | Optional |
| Call to Action | Text | call_to_action | Optional |
| Selected Package | Drop-down | selected_package | Options: Digital Package, Multi-Event Package, Custom Instagram Package, Self-Serve 48hr Request, None |
| Package Price | Number | package_price | Optional |
| Selected Add-Ons | Multi-line text | selected_addons | Optional |
| Total Price | Number | total_price | Optional |
| Additional Info | Multi-line text | additional_info | Optional |

3. After creating each field, note down the **Field ID** (visible in the URL or field settings)

### Finding Field IDs:

1. Go to **Admin** → **Manage** → **Ticket Fields**
2. Click on a custom field
3. Look at the URL - it will be something like: `https://your-subdomain.zendesk.com/agent/admin/ticket_fields/123456789`
4. The number at the end (123456789) is your Field ID
5. Note these IDs - you'll need them for the next step

## Step 4: Configure Custom Field IDs

Once you have your custom field IDs, update the `.env` file:

```env
# Zendesk Custom Field IDs (get these from your Zendesk admin panel)
ZENDESK_FIELD_SERVICE_TYPE=123456789
ZENDESK_FIELD_EVENT_NAME=123456790
ZENDESK_FIELD_EVENT_DATE=123456791
ZENDESK_FIELD_EVENT_LOCATION=123456792
ZENDESK_FIELD_EVENT_TIME=123456793
ZENDESK_FIELD_CALL_TO_ACTION=123456794
ZENDESK_FIELD_SELECTED_PACKAGE=123456795
ZENDESK_FIELD_PACKAGE_PRICE=123456796
ZENDESK_FIELD_SELECTED_ADDONS=123456797
ZENDESK_FIELD_TOTAL_PRICE=123456798
ZENDESK_FIELD_ADDITIONAL_INFO=123456799
```

## Step 5: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Fill out the form at `http://localhost:3000/form`

3. Submit the form and check your Zendesk to see if a ticket was created

4. Verify that:
   - The ticket was created with the correct information
   - Custom fields are populated
   - The requester email matches the form submission

## Step 6: Set Up Ticket Views in Zendesk (Optional)

Create custom views to organize your intake requests:

1. Go to **Admin** → **Workspaces** → **Agent tools** → **Views**
2. Click **Add View**
3. Create views like:
   - "New Design Requests" - Filter by tag: `intake-portal`
   - "By Service Type" - Group by custom field: Service Type
   - "By Package" - Group by custom field: Selected Package

## Troubleshooting

### Error: "Zendesk credentials not configured"
- Make sure your `.env` file has all three Zendesk variables set
- Restart your development server after changing `.env`

### Error: "Failed to create Zendesk ticket: 401"
- Your API token might be incorrect
- Check that your email is correct
- Make sure token access is enabled in Zendesk

### Error: "Failed to create Zendesk ticket: 422"
- This usually means a custom field ID is wrong
- Verify your custom field IDs in Zendesk
- Make sure required fields are being sent

### Tickets are created but custom fields are empty
- Double-check your custom field IDs in the `.env` file
- Make sure the field IDs are numbers, not the field names

## Alternative: Using Zendesk Web Widget

If you prefer to use Zendesk's built-in web widget instead:

1. Go to **Admin** → **Channels** → **Messaging and social** → **Messaging**
2. Set up the Web Widget
3. Add the widget code to your `app/layout.tsx`

## Email Notifications (Optional)

To send confirmation emails to users:

1. Set up a service like SendGrid or Resend
2. Get your API key
3. Update `.env`:
   ```env
   EMAIL_API_KEY=your-email-api-key
   EMAIL_FROM=noreply@undergrounddesign.ca
   ```
4. Update `lib/email.ts` with your email provider's API endpoint

## Support

For issues with Zendesk integration, check:
- [Zendesk API Documentation](https://developer.zendesk.com/api-reference/)
- [Zendesk Custom Fields Guide](https://support.zendesk.com/hc/en-us/articles/4408822095642)

For form-specific issues, check the console logs in your browser's developer tools and the terminal where your Next.js server is running.
