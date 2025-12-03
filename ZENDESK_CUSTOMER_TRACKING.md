# Customer Tracking in Zendesk

Your form automatically creates customers/users in Zendesk when they submit a request.

---

## 🎯 How It Works Now

When someone submits the form:
1. ✅ Ticket is created
2. ✅ **User/Customer is automatically created** (if email doesn't exist)
3. ✅ User is set as the ticket requester
4. ✅ Name and email are stored

---

## 👥 Viewing Customers

### See All Customers:
1. **Admin** → **People** → **Customers** (or **End Users**)
2. You'll see a list of all customers who have submitted requests

### View Customer History:
1. Click on any customer name
2. See:
   - All their tickets
   - Contact information
   - Number of requests submitted
   - Organizations (if applicable)

### Search for a Customer:
1. Use the search bar at the top
2. Type their name or email
3. View their profile and ticket history

---

## 📊 Track Repeat Customers

### Create a View for Repeat Customers:

1. **Admin** → **Workspaces** → **Agent tools** → **Views**
2. Click **Add view**
3. Name: "Repeat Customers"
4. Conditions:
   - Requester → Has submitted → More than 1 ticket
5. **Save**

Now you can see which customers submit multiple requests!

---

## 🏢 Optional: Add Organizations

If you want to group customers by MSU service/club:

### Create Organizations:
1. **Admin** → **People** → **Organizations**
2. Click **Add organization**
3. Create organizations like:
   - Avtek
   - Campus Events
   - CFMU
   - Child Care Centre
   - etc.

### Assign Customers to Organizations:
- Manually: Click customer → Set organization
- Or use automation based on Service Type field

---

## 📈 Customer Insights

### See Customer Statistics:

**Zendesk Explore (Analytics):**
1. Go to **Explore** (if you have it enabled)
2. Create reports showing:
   - Most active customers
   - Customers by service type
   - Average requests per customer
   - Customer satisfaction scores

**Or use Views:**
1. Create custom views grouped by requester
2. Sort by number of tickets

---

## 🔔 Customer Notifications

Customers automatically receive:
- Email notification when ticket is created (if configured)
- Updates when ticket status changes
- Final notification when ticket is solved

**To customize:**
1. **Admin** → **Objects and rules** → **Business rules** → **Triggers**
2. Edit "Notify requester of new ticket" trigger
3. Customize the email template

---

## 💡 Pro Tips

### 1. Tag VIP Customers
- Click on frequent requesters
- Add tag: `vip-customer`
- Create a view to show VIP customer tickets

### 2. Add Notes to Customers
- Click customer profile
- Add internal notes like:
  - "Prefers morning deliveries"
  - "Rush requests common"
  - "Very detail-oriented"

### 3. Track Customer Spending
Your custom field **Total Price** already tracks each request cost.

To see total spending per customer:
- Click customer
- View all their tickets
- See Total Price for each
- (Or use Zendesk Explore for automatic calculation)

---

## 🎯 Example: Viewing a Customer

**Sarah from Campus Events** submitted 3 requests:

**In Zendesk:**
1. Go to **People** → **Customers**
2. Search: "sarah"
3. Click her profile
4. See:
   ```
   Sarah Johnson
   sjohnson@campusevents.ca

   Tickets: 3
   - #101: Spring Concert ($165) - Solved
   - #095: Club Fair ($220) - Open
   - #082: Welcome Week ($185) - Solved

   Total Requests: 3
   Organization: Campus Events
   Tags: repeat-customer
   ```

---

## ✅ Your Setup is Already Doing This!

The code I wrote automatically:
- ✅ Sets the requester name and email
- ✅ Zendesk creates the customer
- ✅ Links all their tickets together
- ✅ Tracks their request history

You don't need to do anything extra - it's working now! Just go to **Admin** → **People** → **Customers** to see them.

---

## 🔍 Quick Test

1. Submit a test form with a new email
2. Go to Zendesk → **People** → **Customers**
3. Search for the email you used
4. You should see the new customer created!
5. Click on them to see their ticket

---

## 📧 Customer Email Addresses

Your form collects:
- Name
- Email
- Position (optional)

All stored in the customer profile automatically!

---

Need help setting up customer tracking reports or organization structure? Let me know!
