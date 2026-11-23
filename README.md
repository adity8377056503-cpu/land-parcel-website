# LAND PARCEL — Premium Real Estate Marketplace

**Tagline:** *Your Trusted Partner in Premium Property Deals.*  
**Primary Market:** Delhi NCR (Delhi, Dwarka, Najafgarh, West Delhi, South West Delhi, Gurugram, Manesar, Noida, Greater Noida, Faridabad, Sonipat, Jhajjar).  
**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, Supabase (PostgreSQL, Auth, RLS, Storage), WhatsApp API & n8n Automation.

---

## 🌟 Key Features

1. **Multi-Category Asset Marketplace:**
   - **Residential Properties:** Independent Houses, Builder Floors, Apartments/Flats, Villas, Duplexes, Residential Plots.
   - **Commercial Properties:** Retail Shops, Corporate Office Spaces, SCO Plots, Commercial Buildings, Showrooms.
   - **Industrial Properties:** Heavy Warehousing, Manufacturing Plants, Factories, Industrial Plots, Logistics Hubs.
   - **Agricultural Land:** Farm Land, Countryside Farmhouses, Agro Orchards.
   - **Institutional & Bulk Land:** Schools, Hospitals, Large Acreage & Township Development Land Parcels.

2. **Advanced Property Discovery & Search:**
   - Instant search across cities, localities, asset categories, sub-types, and price brackets.
   - Filter by Buy/Rent/Sell, Bedrooms, Covered Area, Ceiling Height, Road Width, Availability.
   - Dynamic sorting: Price (Low to High, High to Low), Largest Area, Latest Listings.
   - Grid and List views with zero layout shifts.

3. **Dynamic Property Detail Pages:**
   - Dedicated SEO URLs (e.g. `/properties/demo-industrial-warehouse-sector-35-begampur-khatola-gurugram`).
   - Dynamic specs reflecting property nature (covered area & loading bays for industrial; water & land types for agricultural; bedrooms/floors for residential).
   - High-resolution galleries, road connectivity, landmark highlights, direct WhatsApp click-to-chat, and verified inquiry forms.

4. **Multi-Step Seller Listing Engine (`/list-property`):**
   - Step 1: Owner, Authorized Agent, or Developer contact information.
   - Step 2: Location, exact address, title, and detailed descriptions.
   - Step 3: Area measurements, unit conversion, price expectations, road access.
   - Step 4: Authorization and consent verification with admin approval queue.

5. **Lead & Buyer Inquiry Management:**
   - Property-specific inquiries with buyer type identification (Individual, Investor, Corporate, Developer, Broker).
   - Server-side validation, duplicate prevention, and consent logging.
   - Automatic routing to database and external n8n automation webhooks.

6. **Secure Admin Dashboard (`/admin`):**
   - KPI metrics: Total Properties, Active vs Pending Review, Total Inquiries, Scheduled Site Visits.
   - Property Management: Publish/Unpublish, Approve/Reject submissions, Mark as Sold, Delete listings.
   - Lead Tracking: Full workflow pipeline (New → Contacted → Interested → Site Visit Scheduled → Negotiation → Converted → Closed → Not Interested).
   - Internal follow-up notes and 1-click CSV Lead Export.
   - Configurable settings: WhatsApp routing, notification emails, and SEO presets.

7. **WhatsApp Business & n8n Integration:**
   - Instant click-to-chat with pre-filled property title and listing ID.
   - Webhook trigger architecture configured for n8n workflows and Meta WhatsApp Cloud API templates.

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables Setup
Copy `.env.example` to `.env.local` and configure your credentials:

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anonymous Client Key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Key (Server-side admin access) |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps Platform API Key |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Official WhatsApp business phone (format: `919999999999`) |
| `N8N_WEBHOOK_URL` | n8n Webhook URL for lead processing & WhatsApp automation |
| `N8N_WEBHOOK_SECRET` | Secret token for secure webhook validation |
| `NEXT_PUBLIC_SITE_URL` | Public canonical site URL (`https://landparcel.in`) |

### 3. Database Setup (Supabase / PostgreSQL)
1. Open your Supabase Dashboard -> **SQL Editor**.
2. Open and paste the contents of `supabase/schema.sql`.
3. Run the script. This creates:
   - 12 Relational Tables (`properties`, `enquiries`, `sellers`, `profiles`, `locations`, `categories`, `site_visits`, etc.)
   - Performance Indexes for fast multi-dimensional search
   - Strict Row Level Security (RLS) policies ensuring unapproved listings and private leads remain shielded from public visitors.

### 4. Admin Access
- URL: `/admin` or `/admin/login`
- Default Development Email: `admin@landparcel.in`
- Default Development Password: `Admin@LandParcel2026`

*(Credentials and WhatsApp routing can be customized directly in `/admin/settings`)*

### 5. Run Development Server
```bash
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000) to explore the marketplace.

---

## 📱 WhatsApp & n8n Automation Architecture

```
User Inquiry / Seller Submission
             │
             ▼
    Next.js Server API
             │
      ┌──────┴────────────────┐
      ▼                       ▼
Supabase Database        n8n Webhook
(Encrypted Record)      (Async Dispatcher)
                              │
             ┌────────────────┴───────────────┐
             ▼                                ▼
WhatsApp Cloud API Notification       Internal Admin Email
 (To Client / Lead Acknowledgment)    (To Business Sales Team)
```

**Click-to-Chat Fallback:**
If WhatsApp Cloud API tokens are not configured, the website automatically falls back to standard WhatsApp Click-to-Chat links with custom pre-filled message templates.

---

## 🔒 Security & Compliance
- **Zero Unverified Claims:** The platform does not make speculative returns or unauthorized legal verification assertions.
- **Explicit Consent:** Every lead and seller submission requires active consent checkbox logging before submission.
- **Demo Data Transparency:** All placeholder development records are clearly tagged with the `DEMO` badge.
- **Admin Isolation:** Admin routes are isolated behind authentication checks and restricted in `robots.txt`.
