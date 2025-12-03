# Zendesk Custom Field Setup Guide

## Issue: Service Type Field Not Populating

The service type custom field needs to have dropdown values that **exactly match** what the form is sending.

## Quick Fix

I've updated the code to send display names like "Campus Events", "Avtek", etc. instead of the slugified values.

## Verify Your Zendesk Dropdown Configuration

### Step 1: Check Your Dropdown Values

1. Go to **Zendesk Admin Center** → **Objects and rules** → **Tickets** → **Fields**
2. Find the custom field with ID: `46477062161683` (your Service Type field)
3. Click to edit it
4. Check the **Dropdown options** section

### Step 2: Ensure These Exact Values Exist

Your dropdown should have these **exact** values (case-sensitive):

```
Avtek
Campus Events
CFMU
Child Care Centre
Diversity + Equity Network
EFRT
Food Collective Centre
The Grind
HotSpot
Macademics
Maccess
Maroons
Ombuds
Pride Community Centre
SHEC
Spark
SWAT
The Silhouette
Twelve Eighty
Union Market
WGEN
```

### Step 3: Add Missing Options

If any are missing or spelled differently:

1. Click **Add option**
2. Enter the **exact** name from the list above
3. Click **Save**

### Step 4: Test the Integration

1. Submit a test form from your site
2. Check the Zendesk ticket
3. Verify the "Service Type" field now shows the correct value

---

## Alternative: Multi-Select Dropdown

If your Zendesk field is configured as a **multi-select** dropdown instead of a single-select, you'll need to modify the code slightly.

Let me know if you need help with that!

---

## Debugging: Check What Value Is Being Sent

If it's still not working, you can check what value is actually being sent to Zendesk:

1. Check your server logs after submitting a form
2. Look for the console.log output from the Zendesk ticket creation
3. Verify the custom field value matches your Zendesk dropdown options exactly

---

## Common Issues

### Issue 1: Tag Values Instead of Display Names

**Problem**: Zendesk dropdown might be configured with tag values like `avtek` instead of `Avtek`

**Solution**: Update the Zendesk dropdown options to use the display names (with proper capitalization), or update the mapping in `lib/zendesk.ts` to match your Zendesk configuration.

### Issue 2: Field ID Is Incorrect

**Problem**: The field ID `46477062161683` might not be correct

**Solution**:
1. Go to Zendesk Admin Center → Tickets → Fields
2. Click on your Service Type field
3. Check the URL - it should end with the field ID number
4. Update `.env` with the correct ID:
   ```
   ZENDESK_FIELD_SERVICE_TYPE=your_correct_field_id
   ```

### Issue 3: Field Type Mismatch

**Problem**: Field might be a text field instead of dropdown

**Solution**: If it's a text field, any value will work. If it's a dropdown, values must match exactly.

To check the field type:
1. Go to Admin Center → Tickets → Fields
2. Find your Service Type field
3. Check the "Type" column (should say "Drop-down")

---

## Update Service Names in Zendesk

If you want to use different names in Zendesk than what's in the form, update the mapping in `lib/zendesk.ts`:

```typescript
function getServiceDisplayName(serviceValue: string): string {
  const serviceMap: { [key: string]: string } = {
    'avtek': 'Your Custom Zendesk Name',
    'campus-events': 'Another Custom Name',
    // ... update as needed
  }
  return serviceMap[serviceValue] || serviceValue
}
```

---

## Need More Help?

If the service field still isn't populating after following these steps:

1. Check the Zendesk API response in server logs
2. Verify the field is visible and not hidden
3. Check if there are any Zendesk triggers overriding the field value
4. Test with a simple hardcoded value to isolate the issue

Example test in `lib/zendesk.ts`:

```typescript
// Temporary test - hardcode a value
addCustomField(process.env.ZENDESK_FIELD_SERVICE_TYPE, 'Avtek') // Force test value
```

If this works, the issue is with the mapping. If it doesn't work, the issue is with the Zendesk field configuration.
