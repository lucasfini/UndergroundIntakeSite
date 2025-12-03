# Zendesk Custom Status Field Setup Guide

## What Changed

Your system now uses **5 status stages** instead of 6:
1. ✅ Submitted
2. ✅ Queued
3. ✅ In Progress (ASSIGNED removed)
4. ✅ Review
5. ✅ Complete

## Benefits

- **Single source of truth**: Update status in Zendesk → automatically syncs to customer portal
- **Easier workflow**: Staff only need to update one place (Zendesk ticket)
- **Real-time sync**: Customers see updates immediately

---

## Step 1: Create Custom Status Field in Zendesk

### 1.1 Create the Field

1. Go to **Zendesk Admin Center** → **Objects and rules** → **Tickets** → **Fields**
2. Click **"Add field"**
3. Configure:
   - **Field type**: Drop-down list
   - **Display name**: `Status`
   - **Field key**: `status` (auto-generated)
   - **Description**: `Project status for customer portal`
   - **Visible to end users**: No (keep it internal)

### 1.2 Add Dropdown Options

Click **"Add option"** for each of these (exact spelling required):

| **Value (Display Name)** | **Tag** | **Make Default?** |
|--------------------------|---------|-------------------|
| Submitted | `submitted` | No |
| Queued | `queued` | **YES** ✅ |
| In Progress | `in_progress` | No |
| Review | `review` | No |
| Complete | `complete` | No |

**Important**:
- The **tags** must be exactly as shown (lowercase, underscores)
- Set **Queued** as the default (this is what new tickets start with)

4. Click **"Save"**
5. Copy the **Field ID** from the URL (you'll need it later)
   - Example: If URL is `.../tickets/fields/123456789`, the ID is `123456789`

---

## Step 2: Update Zendesk Webhook

### 2.1 Find Your Webhook

1. Go to **Admin Center** → **Apps and integrations** → **Webhooks**
2. Find the webhook named `Underground Status Sync`
3. Click to edit it

### 2.2 No changes needed to webhook configuration

The webhook URL and authentication stay the same:
- **URL**: `https://unmuscular-boomless-karol.ngrok-free.dev/api/webhooks/zendesk`
- **Authorization**: `Bearer 7feb62fc092ecf676ad9722eb820d23136ee954fe54c346a559744f653324777`

---

## Step 3: Update Zendesk Trigger

### 3.1 Find Your Trigger

1. Go to **Admin Center** → **Objects and rules** → **Business rules** → **Triggers**
2. Find the trigger named `Sync status to Underground portal`
3. Click to edit it

### 3.2 Update the Conditions

**Old conditions:**
- Ticket: `Is` → `Updated`
- Status: `Changed`

**New conditions:**
- Ticket: `Is` → `Updated`
- Ticket: Custom field `Status` → `Changed`

### 3.3 Update the JSON Body

**Replace the old JSON body with this:**

```json
{
  "ticket_id": "{{ticket.id}}",
  "custom_status": "{{ticket.ticket_field_option_title_YOUR_FIELD_ID}}",
  "assignee_name": "{{ticket.assignee.name}}",
  "updated_at": "{{ticket.updated_at_with_timestamp}}"
}
```

**IMPORTANT**: Replace `YOUR_FIELD_ID` with the actual field ID from Step 1.1

Example: If your field ID is `123456789`, use:
```json
{
  "ticket_id": "{{ticket.id}}",
  "custom_status": "{{ticket.ticket_field_option_title_123456789}}",
  "assignee_name": "{{ticket.assignee.name}}",
  "updated_at": "{{ticket.updated_at_with_timestamp}}"
}
```

4. Click **"Save"**

---

## Step 4: Update Database Schema on Server

Since we removed the ASSIGNED status, you need to update the database:

```bash
# SSH into your server
cd /var/www/UndergroundIntakeSite

# Run the migration
npx prisma migrate dev --name remove_assigned_status

# If that doesn't work, use db push:
npx prisma db push

# Restart the app
pm2 restart underground-intake
```

---

## Step 5: Deploy Updated Code to Server

Upload the new files to your server:
- `/app/page.tsx` (home page with Track Request button)
- `/components/Header.tsx` (nav with Admin + Track links)
- `/components/ProgressBar.tsx` (5 stages)
- `/app/admin/queue/page.tsx` (5 status options)
- `/app/track/[ticketId]/page.tsx` (5 stage descriptions)
- `/app/api/webhooks/zendesk/route.ts` (reads custom_status)
- `/prisma/schema.prisma` (5 status enum)

Then restart:
```bash
pm2 restart underground-intake
```

---

## Step 6: Test the Integration

### 6.1 Test Webhook

```bash
curl -X POST https://unmuscular-boomless-karol.ngrok-free.dev/api/webhooks/zendesk \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 7feb62fc092ecf676ad9722eb820d23136ee954fe54c346a559744f653324777" \
  -d '{"ticket_id":"123","custom_status":"in_progress","assignee_name":"TestUser","updated_at":"2024-01-01T00:00:00Z"}'
```

Expected response:
```json
{"message":"Project not found, skipping update"}
```

### 6.2 Test with Real Ticket

1. Create a test ticket in Zendesk (or use existing one)
2. Change the **Status** custom field to "In Progress"
3. Check `/admin/queue` on your site
4. The ticket should appear with status "IN_PROGRESS"

### 6.3 Test Customer View

1. Get a ticket ID that exists in your database
2. Visit: `/track/{ticketId}`
3. You should see the 5-stage progress bar
4. Change status in Zendesk
5. Refresh tracking page - it should update!

---

## How It Works Now

### For Your Team (Zendesk):

1. Customer submits form → Creates ticket in Zendesk (Status: "Queued")
2. Staff opens ticket in Zendesk
3. Staff updates **Status** custom field:
   - Queued → In Progress
   - In Progress → Review
   - Review → Complete
4. Status automatically syncs to customer portal ✨

### For Customers:

1. Submit project request
2. Get tracking ID in email
3. Visit `/track/{ticketId}`
4. See real-time progress bar with 5 stages
5. See queue position (if in "Queued" status)

---

## Navigation Updates

### New Navigation Links:
- **Track Request** - Added to header nav (visible to everyone)
- **Admin** - Added to header nav (click to manage queue)

### Home Page:
Now has 3 cards:
1. **New Project Request** (green border)
2. **Track Request** (blue border) - NEW! 🔍
3. **Questions?** (gray border)

---

## Troubleshooting

### Webhook Not Syncing

1. Check ngrok is still running: `pm2 list`
2. Check webhook logs: `pm2 logs underground-intake`
3. Verify field ID in trigger JSON matches your custom field
4. Test webhook with curl command above

### Status Not Updating

1. Make sure trigger condition uses **Custom field Status: Changed**
2. Verify JSON body has correct field ID placeholder
3. Check that tag values match exactly: `queued`, `in_progress`, etc.

### Database Errors

If you see errors about ASSIGNED status:

```bash
# On server
cd /var/www/UndergroundIntakeSite

# Check current schema
cat prisma/schema.prisma | grep -A 10 "enum ProjectStatus"

# Should show only 5 statuses (no ASSIGNED)
# If it still shows 6, update the schema file and run:
npx prisma db push
pm2 restart underground-intake
```

---

## Field ID Reference

Save this for your records:

- **Service Type Field ID**: `46477062161683`
- **Selected Package Field ID**: `46478565970195`
- **Selected Addons Field ID**: `46479161523347`
- **Total Price Field ID**: `46478619908115`
- **Status Field ID**: `_______________` ← Add yours here!

---

## Quick Reference: Status Mapping

| Zendesk Tag | Portal Status | Display | Icon |
|-------------|---------------|---------|------|
| `submitted` | SUBMITTED | Submitted | ✓ |
| `queued` | QUEUED | In Queue | ⏱ |
| `in_progress` | IN_PROGRESS | In Progress | ⚙ |
| `review` | REVIEW | Review | 👁 |
| `complete` | COMPLETE | Complete | 🎉 |

---

## Need Help?

If something isn't working:
1. Check PM2 logs: `pm2 logs underground-intake --lines 50`
2. Check ngrok is running: `curl http://localhost:4040/api/tunnels`
3. Test webhook endpoint directly (curl command above)
4. Verify Zendesk trigger is active (not paused)

---

**Updated**: November 2024
**Status**: ✅ Ready for deployment
