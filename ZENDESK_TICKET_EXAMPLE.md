# Example Zendesk Ticket

This is what a ticket will look like in Zendesk when someone submits the form:

---

## Ticket Preview

**Subject:** Project Request: Spring Concert 2024 - Sarah Johnson

**Requester:** Sarah Johnson (sjohnson@mcmaster.ca)

**Tags:** `intake-portal`, `project-request`, `graphic-design`

**Priority:** Normal

---

## Ticket Description

```
New Project Request from Sarah Johnson

=== CONTACT INFORMATION ===
Service: graphic-design
Name: Sarah Johnson
Position: Events Coordinator
Email: sjohnson@mcmaster.ca

=== EVENT DETAILS ===
Event Name: Spring Concert 2024
Date: 2024-04-15
Time: 7:00 PM
Location: MUSC Great Hall
Link: https://events.mcmaster.ca/spring-concert

=== PROJECT DETAILS ===
Call to Action: Get Your Tickets Now

Content:
We're hosting our annual Spring Concert featuring local bands and student performers.
Need eye-catching social media graphics to promote the event across Instagram, Facebook,
and our digital screens on campus. The vibe should be energetic, fun, and spring-themed.

Additional Information:
Previous concert posters can be found at: [link]
Our brand colors are: Maroon and Grey
Please include MSU and sponsor logos

=== PACKAGE & PRICING ===
Selected Package: Digital Package
Package Price: $100

Selected Add-Ons:
Silhouette Website Ad, Additional Slides

TOTAL ESTIMATED COST: $165

---
Submitted via Underground Design Intake Portal
```

---

## Custom Fields (If Configured)

When you set up custom fields, they'll appear in a separate section:

| Field | Value |
|-------|-------|
| Service Type | Graphic Design |
| Event Name | Spring Concert 2024 |
| Event Date | 2024-04-15 |
| Event Location | MUSC Great Hall |
| Event Time | 7:00 PM |
| Call to Action | Get Your Tickets Now |
| Selected Package | Digital Package |
| Package Price | $100 |
| Selected Add-Ons | Silhouette Website Ad, Additional Slides |
| Total Price | $165 |

---

## Benefits of Custom Fields

### Without Custom Fields:
- All data is in the ticket description (still works!)
- Can search ticket content
- Manual organization

### With Custom Fields:
- **Filter requests:** "Show me all Graphic Design requests"
- **Sort by date:** "What events are coming up this week?"
- **Track pricing:** "What's our total revenue this month?"
- **Automate workflows:** "Auto-assign Digital Package requests to Designer A"
- **Create reports:** "Which services are most requested?"
- **Set up triggers:** "Send reminder when event is in 3 days"

---

## Zendesk Views You Can Create

Once tickets start coming in, create these views:

### 1. New Intake Requests
- **Filter:** Tag contains `intake-portal` AND Status is New
- **Sort:** Created date (newest first)

### 2. By Service Type
- **Filter:** Tag contains `intake-portal`
- **Group:** By Service Type custom field
- **Sort:** Event Date

### 3. Upcoming Events
- **Filter:** Event Date is between `today` and `+30 days`
- **Sort:** Event Date (soonest first)

### 4. High-Value Projects
- **Filter:** Total Price is greater than $200
- **Sort:** Total Price (highest first)

### 5. Rush Requests (48-hour)
- **Filter:** Selected Package is "Self-Serve 48hr Request"
- **Sort:** Created date (newest first)
- **Color:** Red (for urgency)

---

## Setting Up Automations

Example automations you can create:

### 1. Send Confirmation Email
- **Trigger:** Ticket is created with tag `intake-portal`
- **Action:** Send email to requester
- **Template:** "Thanks for your request! We'll review it within 1-2 business days."

### 2. Assign by Service Type
- **Trigger:** Service Type is "Graphic Design"
- **Action:** Assign to Designer Group

### 3. Event Reminder
- **Trigger:** Event Date is 3 days away
- **Action:** Notify assignee
- **Message:** "Event is in 3 days - check project status"

### 4. Follow-up for High Value
- **Trigger:** Total Price > $200
- **Action:** Add tag `high-value` and notify manager

---

## Analytics You Can Track

With custom fields, you can generate reports on:

1. **Request Volume**
   - Requests per week/month
   - Trending service types
   - Peak request times

2. **Revenue Tracking**
   - Total estimated revenue
   - Average project value
   - Revenue by service type

3. **Package Popularity**
   - Most selected packages
   - Average add-ons per request
   - Package upgrade rate

4. **Response Times**
   - Time to first response
   - Time to resolution
   - SLA compliance

5. **Event Calendar**
   - Upcoming events requiring designs
   - Event distribution over time
   - Lead time analysis

---

## Need Help?

- 📘 Setup Guide: [QUICKSTART.md](./QUICKSTART.md)
- 📖 Full Documentation: [ZENDESK_SETUP.md](./ZENDESK_SETUP.md)
- 🔗 Zendesk Support: https://support.zendesk.com/
