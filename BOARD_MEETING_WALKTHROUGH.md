# Underground Intake Site — Board Walkthrough

Use this as a light script while you click through the site. Audience is non-technical; focus on what the visitor sees and the business outcome.

- Two main visitor goals: submit a new project and track an existing one.
- Support pages: pricing, resources, about, contact.
- Internal-only: admin dashboard for pricing and queue management.

## Home
- Landing hero with two big actions: `New Project Request` (starts intake) and `Track Progress` (enter tracking ID). A small card surfaces the support email and hours.

## Start a Project
1. **Select Service** (`/select-service`): highlights Signage (CTA to continue) and shows Printing as “Coming Soon.”
2. **Service Login** (`/auth/login`): MSU services sign in with Microsoft (@msu.mcmaster.ca). After success, users are sent to the form.
3. **Project Request Form** (`/form`):
   - Contact info prefilled after login; event details, date, location, and links.
   - Uploads for logos and supporting attachments.
   - Call-to-action text and full content section for what should appear on the design.
   - “Continue to Add-Ons” moves the saved request forward; “Cancel” clears and signs out.
4. **Add-Ons & Packages** (`/add-ons`):
   - Pick a package (color-coded cards) and optional digital/printed/special add-ons.
   - Order summary shows estimated total; “Continue to Review” keeps selections.
5. **Review Order** (`/review`):
   - Read-only recap of contact info, event details, content, uploaded files, selected package/add-ons, and total.
   - “Submit Request” sends everything to the team.
6. **Success** (`/success`):
   - Confirmation message with tracking ID (and queue position when available).
   - Buttons to track the project, submit another, or go home; lists what happens next.

## Track a Project
- **Track Landing** (`/track`): enter the tracking ID from the email.
- **Track Detail** (`/track/[id]`): shows a progress bar (Submitted → Queued → In Progress → Review → Complete), queue position (when applicable), project details, and status history. Contact link at the bottom.

## Support Pages
- **Prices** (`/prices`): 2025 price list image plus a “Click here to order” link back into intake.
- **Resources** (`/resources`): quick links to postering guidelines, board maps, large-format pricing cheat sheet, and poster templates.
- **About** (`/about`): who Underground is, what makes the team unique, and proof points (experience, versatility, equipment).
- **Contact** (`/contact`): business hours, address, email, phone, and a simple message form with success/error feedback.

## Admin (internal)
- **Admin Login** (`/admin`): Microsoft sign-in for authorized staff.
- **Pricing Dashboard**: view/edit packages and add-ons (names, prices, colors, notes); save pushes changes live.
- **Queue Management** (`/admin/queue`): list of projects with ticket IDs, status chips, queue positions (drag via dropdown), and a side panel to change status, assign staff, set ETA, and add notes. Stats cards summarize counts by status.

## Talk Track Tips
- Start from Home → New Project → Form → Add-Ons → Review → Success → Track, then briefly show Prices/Resources/About/Contact.
- Close with the admin view to show how the team updates pricing and manages the queue.


## When a service logs in. If their email contains a partial or full match, they will be assigned to one of these services. IE: sraeng@msu.mcmaster.ca is a partial match to SRA, so they will be autofilled as SRA. Other users that are not on this list will not be able to continue and will be met with an error. 
  // Avtek
  'eventstech': 'Avtek',
  // Campus Events
  'eventspromo': 'Campus Events',
  // CFMU
  'cfmupromotions': 'CFMU',
  'cfmu': 'CFMU',
  // Diversity + Equity Network
  'diversitypromotions': 'Diversity + Equity Network',
  'diversity': 'Diversity + Equity Network',
  // EFRT
  'efrt': 'EFRT',
  // First Year Council
  'fyc': 'First Year Council',
  // Food Collective Centre
  'fccpromo': 'Food Collective Centre',
  'fcc': 'Food Collective Centre',
  'foodcollective': 'Food Collective Centre',
  // HotSpot
  'ittech': 'HotSpot',
  'hotspot': 'HotSpot',
  // Macademics
  'macademicspromo': 'Macademics',
  'macademics': 'Macademics',
  // Maccess
  'maccesspromo': 'Maccess',
  'maccess': 'Maccess',
  // Maroons
  'maroonspromo': 'Maroons',
  'maroons': 'Maroons',
  // Ombuds
  'ombuds': 'Ombuds',
  // Pride
  'pridepromo': 'Pride',
  'pride': 'Pride',
  // SHEC
  'shecpromotions': 'SHEC',
  'shec': 'SHEC',
  // Spark
  'sparkpromopub': 'Spark',
  'sparkpromo': 'Spark',
  'spark': 'Spark',
  // SWHAT
  'swhat': 'SWHAT',
  // WGEN
  'wgenpromo': 'WGEN',
  'wgen': 'WGEN',
  // Clubs
  'clubsadmin': 'Clubs',
  'clubs': 'Clubs',
  // Elections
  'elections': 'Elections',
  // Hub
  'hub': 'Hub',
  // SRA 
  'sra': 'SRA',
  'speaker': 'SRA',
  // TwelveEighty (multiple aliases)
  'sm1280': 'TwelveEighty',
  'twelveeighty': 'TwelveEighty',
  '1280': 'TwelveEighty',
  'grind': 'TwelveEighty',
  'union': 'TwelveEighty',

##Service Contacts
Service Name,Email
Avtek,eventstech@msu.mcmaster.ca
Campus Events,eventspromo@msu.mcmaster.ca
CFMU,cfmupromotions@msu.mcmaster.ca
Diversity + Equity Network,diversitypromotions@msu.mcmaster.ca
EFRT,efrt@msu.mcmaster.ca
First Year Council,fyc@msu.mcmaster.ca
Food Collective Centre,fccpromo@msu.mcmaster.ca
HotSpot,ittech@msu.mcmaster.ca
Macademics,macademicspromo@msu.mcmaster.ca
Maccess,maccesspromo@msu.mcmaster.ca
Maroons,maroons_promo@msu.mcmaster.ca
Ombuds,ombuds@msu.mcmaster.ca
Pride Community Centre,pridepromo@msu.mcmaster.ca
SHEC,shecpromotions@msu.mcmaster.ca
Spark,sparkpromo_pub@msu.mcmaster.ca
SWHAT,swhat@msu.mcmaster.ca
WGEN,wgenpromo@msu.mcmaster.ca
Elections,elections@msu.mcmaster.ca
First Year Council,fyc@msu.mcmaster.ca
SRA
Clubs,clubsadmin@msu.mcmaster.ca
TwelveEighty/Grind/Union/Student,sm1280@msu.mcmaster.ca
Hub,hub@msu.mcmaster.ca