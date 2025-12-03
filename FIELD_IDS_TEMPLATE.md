# Zendesk Custom Field IDs

After creating your custom fields in Zendesk, fill in the Field IDs below.

## How to Find Field IDs

1. Go to Admin → Objects and rules → Tickets → Fields
2. Click on a custom field
3. Look at the URL: `https://undergroundmediaanddesign.zendesk.com/admin/objects-rules/tickets/ticket-fields/123456789`
4. The number at the end is your Field ID

---

## Fill in Your Field IDs Below

Once you have the IDs, copy them into your `.env` file.

```env
# Service Type (Drop-down)
ZENDESK_FIELD_SERVICE_TYPE=

# Event Name (Text)
ZENDESK_FIELD_EVENT_NAME=

# Event Date (Date)
ZENDESK_FIELD_EVENT_DATE=

# Event Time (Text)
ZENDESK_FIELD_EVENT_TIME=

# Event Location (Text)
ZENDESK_FIELD_EVENT_LOCATION=

# Event Link (Text)
ZENDESK_FIELD_EVENT_LINK=

# Call to Action (Text)
ZENDESK_FIELD_CALL_TO_ACTION=

# Content Description (Multi-line)
ZENDESK_FIELD_CONTENT_DESCRIPTION=

# Additional Info (Multi-line)
ZENDESK_FIELD_ADDITIONAL_INFO=

# Selected Package (Drop-down)
ZENDESK_FIELD_SELECTED_PACKAGE=

# Package Price (Decimal)
ZENDESK_FIELD_PACKAGE_PRICE=

# Selected Add-Ons (Multi-line)
ZENDESK_FIELD_SELECTED_ADDONS=

# Total Price (Decimal)
ZENDESK_FIELD_TOTAL_PRICE=
```

---

## Quick Reference

| Field Name | Type | Required |
|------------|------|----------|
| Service Type | Drop-down | Yes |
| Event Name | Text | Yes |
| Event Date | Date | Yes |
| Event Time | Text | No |
| Event Location | Text | No |
| Event Link | Text | No |
| Call to Action | Text | No |
| Content Description | Multi-line | Yes |
| Additional Info | Multi-line | No |
| Selected Package | Drop-down | Yes |
| Package Price | Decimal | No |
| Selected Add-Ons | Multi-line | No |
| Total Price | Decimal | Yes |

---

Once you've filled in all the IDs above, paste them into your `.env` file and let me know!
