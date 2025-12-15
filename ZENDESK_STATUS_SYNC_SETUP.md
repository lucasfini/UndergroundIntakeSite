# Zendesk Status Sync - Complete Setup Guide

## Current Configuration

Your webhook is already created at:
- **Endpoint**: `https://unmuscular-boomless-karol.ngrok-free.dev/api/webhooks/zendesk`
- **Method**: POST
- **Format**: JSON
- **Authentication**: Bearer token `oBGpkPEdTJLaJmt94tU_JjSdkQP4nvuZuVZpjyrErxE=`

## Status Field Configuration

Your Status custom field ID: **46610179319187**

### Required Status Field Options

Your Zendesk Status field MUST have these exact tag values:

| Option Name | Tag Value (IMPORTANT) |
|-------------|----------------------|
| Submitted   | `submitted`          |
| Queued      | `queued`             |
| In Progress | `in_progress`        |
| Review      | `review`             |
| Complete    | `complete`           |

**To verify/update tags:**
1. Go to Admin Center → Objects and rules → Tickets → Fields
2. Click on your Status field (ID: 46610179319187)
3. For each option, ensure the **Tag** (not Display name) matches above
4. Save changes

## Step-by-Step Trigger Setup

### 1. Create the Trigger

1. Go to **Admin Center** → **Objects and rules** → **Business rules** → **Triggers**
2. Click **Add trigger**
3. Name it: "Sync Status to Underground Design Site"

### 2. Configure Conditions

**Meet ALL of the following conditions:**

- Ticket > Is > Updated
- Ticket > Status (custom field 46610179319187) > Changed
- Ticket > Status (custom field 46610179319187) > Is not > (empty)

### 3. Configure Actions

**Action:**
- Notifications: Notify webhook
- Select: Your existing webhook "Underground Design Status Sync"

**JSON Body:**

```json
{
  "ticket_id": "{{ticket.id}}",
  "current_value": "{{ticket.ticket_field_46610179319187}}",
  "assignee_name": "{{ticket.assignee.name}}",
  "updated_at": "{{ticket.updated_at_with_timestamp}}"
}
```

**CRITICAL:** Make sure to use `46610179319187` (your actual field ID) in the placeholder.

### 4. Save and Activate

- Category: Notifications
- Save the trigger as Active

## Testing the Setup

### Test 1: Webhook Health Check

Open terminal and run:
```bash
curl https://unmuscular-boomless-karol.ngrok-free.dev/api/webhooks/zendesk
```

Expected response:
```json
{
  "message": "Zendesk webhook endpoint is active",
  "timestamp": "2024-12-12T..."
}
```

### Test 2: Status Update

1. Find a ticket that has a project in your database
2. Change the Status field from one value to another (e.g., Queued → In Progress)
3. Save the ticket
4. Check your application logs (terminal where `npm run dev` is running)

**Expected logs:**
```
Zendesk webhook payload: {
  "ticket_id": "123",
  "current_value": "in_progress",
  "assignee_name": "John Doe",
  "updated_at": "..."
}
Processing webhook for ticket 123, status: in_progress
Updating project abc-123 from QUEUED to IN_PROGRESS
Project abc-123 updated from Zendesk webhook
```

5. Visit the tracking page: `https://your-site.com/track/[ticketId]`
6. Status should now show "In Progress"

### Test 3: Check Zendesk Webhook Activity

1. Go to Admin Center → Apps and integrations → Webhooks
2. Click on your webhook
3. Click **View activity** tab
4. Check recent webhook calls - should show successful 200 responses

## Troubleshooting

### Issue: Webhook not firing

**Check:**
1. Trigger is Active (not Draft)
2. You're changing the Status custom field (ID 46610179319187)
3. Trigger conditions are met
4. Check Zendesk's trigger activity log

**Fix:**
- Go to Admin → Business rules → Triggers
- Find your trigger and check "Last fired" timestamp
- If never fired, review conditions

### Issue: Webhook returning 401 Unauthorized

**Cause:** Bearer token mismatch

**Fix:**
1. Verify environment variable matches:
   ```bash
   grep ZENDESK_WEBHOOK_SECRET .env.local
   ```
   Should show: `ZENDESK_WEBHOOK_SECRET=oBGpkPEdTJLaJmt94tU_JjSdkQP4nvuZuVZpjyrErxE=`

2. Restart your application:
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```

### Issue: Status not updating in database

**Check logs for:**

1. **"Project not found"**
   - Ticket ID doesn't match any project's `zendeskTicketId`
   - Verify ticket was created through your form submission

2. **"Status not mapped"**
   - Zendesk status field tag doesn't match expected values
   - Check Status field tags match: `submitted`, `queued`, `in_progress`, `review`, `complete`

3. **"No changes detected"**
   - Status is already set to that value
   - This is normal - webhook working correctly

### Issue: Getting errors in logs

**Common errors:**

1. `TypeError: Cannot read property 'toString' of undefined`
   - Webhook payload missing `ticket_id`
   - Check JSON body template in webhook configuration

2. `Unauthorized`
   - Bearer token mismatch
   - Check environment variable and Zendesk webhook authentication

## Status Flow Example

Here's how a complete status update works:

1. **Admin in Zendesk:**
   - Opens ticket #12345
   - Changes Status field: "Queued" → "In Progress"
   - Saves ticket

2. **Zendesk:**
   - Trigger detects Status field changed
   - Sends POST to your webhook endpoint
   - Payload: `{ ticket_id: "12345", current_value: "in_progress", ... }`

3. **Your Application:**
   - Webhook receives request
   - Verifies Bearer token
   - Finds project with `zendeskTicketId: "12345"`
   - Maps `in_progress` → `IN_PROGRESS`
   - Updates database
   - Creates status history entry
   - Manages queue position (if applicable)

4. **User:**
   - Visits tracking page
   - Sees status: "In Progress"
   - Status history shows the update

## Quick Verification Checklist

- [ ] Environment variable `ZENDESK_WEBHOOK_SECRET` is set
- [ ] Environment variable `ZENDESK_FIELD_STATUS=46610179319187` is set
- [ ] Application restarted after adding env variables
- [ ] Webhook endpoint is accessible (ngrok running)
- [ ] Webhook in Zendesk has correct Bearer token
- [ ] Status field has correct tag values (not just display names)
- [ ] Trigger is created and Active
- [ ] Trigger uses correct field ID in JSON body template
- [ ] Test ticket has a project in database with matching `zendeskTicketId`

## Need Help?

If still not working after following all steps:

1. Check application logs when updating ticket
2. Check Zendesk webhook activity log
3. Check Zendesk trigger activity log
4. Share error messages from logs

The webhook endpoint logs everything, so you should see detailed information about what's happening (or not happening).
