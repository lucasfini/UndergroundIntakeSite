# Zendesk Webhook Setup Guide

This guide will help you configure Zendesk to automatically sync status updates back to your database.

## Overview

When you update the Status custom field in Zendesk, this webhook will automatically update the project status in your database, so users can see the updates on the tracking page.

## Prerequisites

1. You must have the custom "Status" field created in Zendesk
2. You need admin access to your Zendesk account
3. Your application must be deployed and accessible via HTTPS

## Step 1: Find Your Custom Field ID

1. Go to Zendesk Admin Center
2. Navigate to **Objects and rules** > **Tickets** > **Fields**
3. Click on your "Status" custom field
4. Note the field ID from the URL (e.g., `https://yoursubdomain.zendesk.com/agent/admin/ticket_fields/12345678`)
5. Save this ID - you'll need it for your environment variables

## Step 2: Set Up Environment Variables

Add these to your `.env.local` or `.env` file:

```env
# Your existing Zendesk credentials
ZENDESK_SUBDOMAIN=your-subdomain
ZENDESK_EMAIL=your-email@example.com
ZENDESK_API_TOKEN=your-api-token

# Custom field IDs
ZENDESK_FIELD_STATUS=12345678  # Replace with your Status field ID

# Optional: Webhook security token (recommended)
ZENDESK_WEBHOOK_SECRET=your-random-secret-token-here
```

## Step 3: Create the Zendesk Webhook

1. Go to Zendesk Admin Center
2. Navigate to **Apps and integrations** > **Webhooks** > **Webhooks**
3. Click **Create webhook**
4. Configure the webhook:

### Webhook Configuration

**Endpoint URL:**
```
https://your-domain.com/api/webhooks/zendesk
```

**Request method:** POST

**Request format:** JSON

**Authentication (Optional but Recommended):**
- Type: Bearer token
- Token: Use the same value as `ZENDESK_WEBHOOK_SECRET` from your environment variables

### JSON Body Template

Use this JSON body template for the webhook:

```json
{
  "ticket_id": "{{ticket.id}}",
  "current_value": "{{ticket.ticket_field_12345678}}",
  "assignee_name": "{{ticket.assignee.name}}",
  "updated_at": "{{ticket.updated_at_with_timestamp}}"
}
```

**Important:** Replace `12345678` in `ticket.ticket_field_12345678` with your actual Status field ID from Step 1.

## Step 4: Create a Trigger

1. Go to **Objects and rules** > **Business rules** > **Triggers**
2. Click **Add trigger**
3. Configure the trigger:

**Trigger Name:** "Sync Status Updates to Database"

**Conditions:**
- **Ticket** > **Is** > **Updated**
- **Ticket** > **Status custom field** > **Changed**

**Actions:**
- **Notifications** > **Notify webhook**
- Select the webhook you created in Step 3

4. Click **Create trigger**

## Step 5: Test the Webhook

### Manual Test:

1. Open any ticket in Zendesk that has a project in your database
2. Change the Status custom field value (e.g., from "Queued" to "In Progress")
3. Save the ticket
4. Check your server logs - you should see:
   ```
   Zendesk webhook payload: { ... }
   Processing webhook for ticket 12345, status: in_progress
   Updating project abc123 from QUEUED to IN_PROGRESS
   Project abc123 updated from Zendesk webhook
   ```
5. Visit the tracking page for that project - the status should be updated!

### Endpoint Health Check:

Test that your webhook endpoint is accessible:
```bash
curl https://your-domain.com/api/webhooks/zendesk
```

You should receive:
```json
{
  "message": "Zendesk webhook endpoint is active",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Status Field Mapping

The webhook maps Zendesk status field tags to your database statuses:

| Zendesk Tag | Database Status |
|-------------|-----------------|
| submitted   | SUBMITTED       |
| queued      | QUEUED          |
| in_progress | IN_PROGRESS     |
| review      | REVIEW          |
| complete    | COMPLETE        |

**Important:** The Zendesk custom field must use these exact tag values (not display names).

## Troubleshooting

### Webhook not triggering:

1. Check that the trigger is active
2. Verify the custom field ID in the JSON body template matches your actual field ID
3. Check Zendesk's webhook logs (Admin > Webhooks > Click your webhook > View activity)

### Status not updating:

1. Check your server logs for errors
2. Verify the `ZENDESK_FIELD_STATUS` environment variable is set correctly
3. Ensure your Status custom field uses the correct tag values (submitted, queued, in_progress, review, complete)
4. Verify the project exists in your database with the correct `zendeskTicketId`

### Authentication errors:

1. If using webhook security, verify `ZENDESK_WEBHOOK_SECRET` matches the Bearer token in Zendesk
2. If not using security, you can skip the Bearer token authentication in Zendesk

## Security Recommendations

1. **Always use HTTPS** for your webhook endpoint
2. **Set up Bearer token authentication** using `ZENDESK_WEBHOOK_SECRET`
3. **Monitor webhook activity** regularly in Zendesk
4. **Restrict webhook access** to only Zendesk's IP ranges if possible

## How It Works

1. Admin updates Status field in Zendesk
2. Zendesk trigger fires
3. Webhook sends POST request to your endpoint
4. Your endpoint:
   - Finds the project by Zendesk ticket ID
   - Maps Zendesk status to database status
   - Updates project status in database
   - Creates status history entry
   - Handles queue position changes
5. User sees updated status on tracking page

That's it! Your Zendesk status updates will now automatically sync to your database and be visible to users on the tracking page.
