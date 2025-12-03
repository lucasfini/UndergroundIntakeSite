# Progress Bar & Queue System - Setup Guide

## Overview

Your Underground Intake Site now has a complete progress tracking and queue management system! Customers can track their project status in real-time, and your team can manage the queue from an admin dashboard.

## What Was Built

### 1. Database Infrastructure
- **Prisma ORM** with SQLite (for development) / PostgreSQL (for production)
- **Project Model** - Stores all project/submission data
- **StatusHistory Model** - Tracks all status changes with audit trail
- **6-Stage Status System**:
  1. SUBMITTED - Form received
  2. QUEUED - Waiting in line
  3. ASSIGNED - Staff member assigned
  4. IN_PROGRESS - Actively being worked on
  5. REVIEW - Awaiting feedback/approval
  6. COMPLETE - Ready for customer

### 2. Customer-Facing Features

#### Tracking Landing Page (`/track`)
- Clean UI for customers to enter tracking ID
- Direct link to check project status

#### Project Status Page (`/track/[ticketId]`)
- Beautiful progress bar showing current stage
- Queue position display (e.g., "You are #5 in queue")
- Project details and timeline
- Status history with timestamps
- Estimated completion date (if set by admin)
- Assigned staff member info (if assigned)

#### Updated Success Page (`/success`)
- Now displays tracking ID and queue position
- Direct "Track Your Project" button
- Saves tracking info for easy access

### 3. Admin Features

#### Queue Management Dashboard (`/admin/queue`)
- View all projects across all statuses
- Filter by status (QUEUED, IN_PROGRESS, etc.)
- Update project status with notes
- Assign staff members to projects
- Set estimated completion dates
- Real-time statistics (projects in each stage)
- Sortable/filterable project table

#### Updated Admin Page (`/admin`)
- Added "Queue Management" button to access new dashboard
- Existing pricing management still intact

### 4. API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/track/[ticketId]` | GET | Get project status by ticket ID |
| `/api/admin/queue` | GET | Get all projects (with status filter) |
| `/api/admin/queue` | POST | Reorder queue positions |
| `/api/admin/projects/[id]/status` | PUT | Update project status |
| `/api/webhooks/zendesk` | POST | Receive Zendesk status updates |
| `/api/submit-complete` | POST | Enhanced to save to database |

### 5. Zendesk Webhook Integration (Optional)
- Automatic status synchronization
- Maps Zendesk ticket statuses to your 6-stage system
- Updates queue positions automatically

---

## Setup Instructions

### Step 1: Local Development Setup (Already Done!)

The system is currently running with SQLite for local testing. You can test everything right now:

```bash
# Start the development server
npm run dev
```

Then visit:
- http://localhost:3000/track - Track a project
- http://localhost:3000/admin/queue - Manage queue (after admin login)

### Step 2: Production Setup on Ubuntu Server

#### 2.1 Install PostgreSQL

```bash
# Update package list
sudo apt update

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create a database and user
sudo -u postgres psql

# Inside PostgreSQL shell:
CREATE DATABASE underground_intake;
CREATE USER underground_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE underground_intake TO underground_user;
\q
```
postgres=# CREATE USER admin WITH ENCRYPTED PASSWORD 'MSUunderground1117!';
CREATE ROLE

#### 2.2 Update Environment Variables

Update your `.env` file on the server:

```bash
# Change from SQLite to PostgreSQL
DATABASE_URL="postgresql://underground_user:your_secure_password@localhost:5432/underground_intake"

# Add webhook secret (optional, for Zendesk webhook security)
ZENDESK_WEBHOOK_SECRET="your_random_secret_key_here"
```

#### 2.3 Update Prisma Schema for PostgreSQL

Edit `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"  // Changed from "sqlite"
  url      = env("DATABASE_URL")
}
```

#### 2.4 Run Database Migration

```bash
# Generate Prisma client
npx prisma generate

# Run migration to create tables
npx prisma migrate deploy

# (Optional) Open Prisma Studio to view data
npx prisma studio
```

#### 2.5 Build and Deploy

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Start production server
npm run start

# Or use PM2 for process management
npm install -g pm2
pm2 start npm --name "underground-intake" -- start
pm2 save
pm2 startup
```

---

## Database Migration from Existing Data (Optional)

If you have existing submissions in Zendesk that you want to import:

1. Export Zendesk tickets to CSV
2. Create a migration script to import them into the database
3. Run the script to populate the `Project` table

Example migration script structure:

```typescript
// scripts/import-zendesk-data.ts
import prisma from '@/lib/prisma'

async function importZendeskData() {
  // Read CSV data
  // Parse each row
  // Create projects in database
  await prisma.project.create({
    data: {
      // ... map CSV fields to database fields
    }
  })
}

importZendeskData()
```

---

## Configuring Zendesk Webhook (Optional)

To enable automatic status updates from Zendesk:

### 1. Set Up Webhook in Zendesk

1. Go to **Admin Center** > **Apps and integrations** > **Webhooks**
2. Click **Create webhook**
3. Configure:
   - **Name**: Underground Status Sync
   - **Endpoint URL**: `https://your-domain.com/api/webhooks/zendesk`
   - **Request method**: POST
   - **Request format**: JSON
   - **Authentication**: Add header `Authorization: Bearer your_webhook_secret`

### 2. Create Trigger in Zendesk

1. Go to **Admin Center** > **Business rules** > **Triggers**
2. Click **Add trigger**
3. Configure:
   - **Name**: Sync status to Underground portal
   - **Conditions**: Ticket is updated AND Status is changed
   - **Actions**: Notify webhook with JSON body:

```json
{
  "ticket_id": "{{ticket.id}}",
  "status": "{{ticket.status}}",
  "assignee_name": "{{ticket.assignee.name}}",
  "updated_at": "{{ticket.updated_at}}"
}
```

### 3. Test the Webhook

```bash
# Test webhook endpoint
curl -X POST https://your-domain.com/api/webhooks/zendesk \
  -H "Authorization: Bearer your_webhook_secret" \
  -H "Content-Type: application/json" \
  -d '{
    "ticket_id": "123",
    "status": "open",
    "assignee_name": "John Doe",
    "updated_at": "2024-01-01T00:00:00Z"
  }'
```

---

## How It Works: Customer Journey

1. **Customer submits form** → Project created with status "QUEUED"
2. **Auto-assigned queue position** (e.g., #7)
3. **Email sent** with tracking link: `/track/{ticketId}`
4. **Customer visits tracking page** → Sees progress bar + queue position
5. **Admin updates status** via `/admin/queue` dashboard
6. **Customer refreshes tracking page** → Sees updated status in real-time
7. **Status reaches "COMPLETE"** → Customer notified, completion timestamp saved

---

## Admin Workflow

### Updating a Project Status

1. Go to `/admin/queue`
2. Click **Manage** on any project
3. Select new status from dropdown
4. (Optional) Assign staff member
5. (Optional) Set estimated completion date
6. (Optional) Add notes about the change
7. Click **Update Status**
8. Project automatically moves in queue (if applicable)

### Managing the Queue

- **Automatic queue** - New projects automatically added to end of queue
- **Manual priority** - Admins can change status to bump projects ahead
- **Queue positions auto-adjust** - When projects move out of QUEUED status

---

## Customization Options

### Change Status Labels

Edit `components/ProgressBar.tsx`:

```typescript
const stages = [
  { key: 'SUBMITTED', label: 'Received', icon: '✓' },
  { key: 'QUEUED', label: 'Waiting', icon: '⏱' },
  // ... customize labels and icons
]
```

### Modify Status Colors

Edit `app/admin/queue/page.tsx` - `getStatusColor()` function:

```typescript
const getStatusColor = (status: string) => {
  switch (status) {
    case 'QUEUED':
      return 'bg-yellow-100 text-yellow-800' // Change colors here
    // ...
  }
}
```

### Add Email Notifications on Status Change

Update `app/api/admin/projects/[id]/status/route.ts`:

```typescript
// After updating status
if (updatedProject) {
  await sendStatusUpdateEmail(
    updatedProject.customerEmail,
    updatedProject.customerName,
    newStatus
  )
}
```

---

## Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check database exists
sudo -u postgres psql -l

# Test connection string
npx prisma db push
```

### Prisma Client Not Found

```bash
# Regenerate Prisma client
npx prisma generate
```

### Migration Issues

```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Create new migration
npx prisma migrate dev --name your_migration_name
```

### Webhook Not Working

1. Check `ZENDESK_WEBHOOK_SECRET` is set in `.env`
2. Verify webhook URL is accessible from internet
3. Check Zendesk webhook logs for errors
4. Test endpoint with curl command above

---

## Database Schema Reference

### Project Table

| Field | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Internal ID |
| submissionId | String | Original timestamp-based ID |
| zendeskTicketId | String | Zendesk ticket ID (nullable) |
| customerName | String | Customer name |
| customerEmail | String | Customer email |
| eventName | String | Event name |
| eventDate | DateTime | Event date |
| status | Enum | Current status (6 stages) |
| priority | Enum | LOW, NORMAL, HIGH, URGENT |
| queuePosition | Int | Position in queue (nullable) |
| assignedTo | String | Staff member name (nullable) |
| createdAt | DateTime | Submission date |
| updatedAt | DateTime | Last update |
| estimatedCompletionDate | DateTime | Estimated completion (nullable) |
| completedAt | DateTime | Actual completion (nullable) |

### StatusHistory Table

| Field | Type | Description |
|-------|------|-------------|
| id | String | History entry ID |
| projectId | String | Foreign key to Project |
| oldStatus | Enum | Previous status (nullable) |
| newStatus | Enum | New status |
| changedBy | String | Who made the change (nullable) |
| notes | String | Notes about change (nullable) |
| createdAt | DateTime | When change occurred |

---

## Performance Tips

### For Large Databases (1000+ projects)

1. **Add database indexes** (already included in schema):
   - `customerEmail` - Fast lookup by email
   - `status` - Fast filtering by status
   - `queuePosition` - Fast queue sorting
   - `createdAt` - Fast sorting by date

2. **Archive old projects**:

```typescript
// Move completed projects older than 6 months to archive table
await prisma.project.updateMany({
  where: {
    status: 'COMPLETE',
    completedAt: {
      lt: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000)
    }
  },
  data: {
    // Move to archive or soft delete
  }
})
```

3. **Use pagination** in admin queue view:

```typescript
// Add limit and skip for pagination
const projects = await prisma.project.findMany({
  take: 50, // Limit
  skip: page * 50, // Offset
  // ... rest of query
})
```

---

## Security Considerations

1. **Admin authentication** - Currently uses simple password
   - Consider implementing JWT or session-based auth
   - Add role-based access control (RBAC)

2. **Webhook security** - Use `ZENDESK_WEBHOOK_SECRET` env variable
   - Verify webhook signatures
   - Rate limit webhook endpoint

3. **Customer data** - Projects contain PII
   - Ensure HTTPS in production
   - Consider data retention policies
   - Add GDPR compliance features if needed

4. **Database backups**:

```bash
# Backup PostgreSQL database
pg_dump -U underground_user underground_intake > backup.sql

# Restore from backup
psql -U underground_user underground_intake < backup.sql
```

---

## Support & Next Steps

### Immediate Next Steps:

1. ✅ Test locally with SQLite (already working!)
2. ⏳ Set up PostgreSQL on Ubuntu server
3. ⏳ Update environment variables for production
4. ⏳ Run database migrations
5. ⏳ Deploy to production
6. ⏳ (Optional) Set up Zendesk webhook

### Future Enhancements:

- Email notifications when status changes
- SMS notifications via Twilio
- Customer portal for viewing all their projects
- Analytics dashboard for admins
- Export queue data to CSV
- Mobile app for customers

---

## Questions?

If you have any questions about setup or customization:
- Check the code comments in each file
- Review the Prisma documentation: https://www.prisma.io/docs
- Review the Next.js documentation: https://nextjs.org/docs

---

**Implementation Date**: November 2024
**Status**: ✅ Complete and Ready for Deployment
