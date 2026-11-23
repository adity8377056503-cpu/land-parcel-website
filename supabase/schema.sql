-- ==============================================================================
-- LAND PARCEL - FULL POSTGRESQL / SUPABASE DATABASE SCHEMA
-- Multi-Category Real Estate Marketplace & Dual Listing System
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. USER PROFILES TABLE (Supabase Auth Integration)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'agent', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. PROPERTY CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.property_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    image_url TEXT,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. LOCATIONS TABLE
CREATE TABLE IF NOT EXISTS public.locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. SELLERS & SUBMITTERS TABLE
CREATE TABLE IF NOT EXISTS public.sellers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    mobile TEXT NOT NULL,
    email TEXT,
    seller_type TEXT NOT NULL CHECK (seller_type IN ('owner', 'agent', 'developer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. CENTRAL PROPERTIES TABLE (DUAL LISTING ENGINE)
CREATE TABLE IF NOT EXISTS public.properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('residential', 'commercial', 'industrial', 'agricultural', 'institutional', 'large-land')),
    property_type TEXT NOT NULL,
    
    -- DUAL LISTING STATUSES & ORIGIN
    status TEXT DEFAULT 'pending' CHECK (status IN ('draft', 'pending', 'published', 'rejected', 'sold', 'rented', 'unpublished')),
    source TEXT DEFAULT 'owner' CHECK (source IN ('admin', 'owner', 'agent', 'developer')),
    availability_status TEXT DEFAULT 'available' CHECK (availability_status IN ('ready-to-move', 'under-construction', 'available', 'sold')),
    
    -- Geographical Address
    address TEXT NOT NULL,
    locality TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    
    -- Financials
    price NUMERIC(15, 2) NOT NULL,
    price_unit TEXT DEFAULT 'total' CHECK (price_unit IN ('total', 'per-sqft', 'per-acre')),
    price_negotiable BOOLEAN DEFAULT false,
    
    -- Area Specifications
    total_area NUMERIC(12, 2) NOT NULL,
    area_unit TEXT NOT NULL CHECK (area_unit IN ('sqft', 'sqm', 'sqyd', 'acre', 'bigha', 'kanal', 'marla', 'hectare')),
    built_up_area NUMERIC(12, 2),
    carpet_area NUMERIC(12, 2),
    
    -- Residential Dynamic Specs
    bedrooms INT,
    bathrooms INT,
    floor_number INT,
    total_floors INT,
    furnishing TEXT CHECK (furnishing IN ('furnished', 'semi-furnished', 'unfurnished')),
    parking INT,
    property_age TEXT,
    
    -- Industrial Dynamic Specs
    covered_area NUMERIC(12, 2),
    road_width NUMERIC(6, 2),
    ceiling_height NUMERIC(6, 2),
    power_availability TEXT,
    loading_facilities BOOLEAN DEFAULT false,
    
    -- Agricultural Dynamic Specs
    land_type TEXT,
    road_access TEXT,
    water_availability TEXT,
    
    -- Connectivity & SEO
    nearby_landmarks TEXT,
    road_connectivity TEXT,
    highlights TEXT[] DEFAULT '{}',
    is_featured BOOLEAN DEFAULT false,
    is_demo BOOLEAN DEFAULT false,
    view_count INT DEFAULT 0,
    video_url TEXT,
    seo_title TEXT,
    seo_description TEXT,
    
    -- Relational Link
    seller_id UUID REFERENCES public.sellers(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE
);

-- 7. PROPERTY IMAGES TABLE
CREATE TABLE IF NOT EXISTS public.property_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
    url TEXT NOT NULL,
    alt_text TEXT,
    is_cover BOOLEAN DEFAULT false,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. PROPERTY VIDEOS TABLE
CREATE TABLE IF NOT EXISTS public.property_videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
    url TEXT NOT NULL,
    title TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. CONFIDENTIAL PROPERTY DOCUMENTS TABLE (OWNERSHIP DEEDS / PERMITS)
CREATE TABLE IF NOT EXISTS public.property_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT,
    is_private BOOLEAN DEFAULT true, -- STRICTLY PRIVATE TO ADMINS
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. LISTING AUDIT TRAIL TABLE
CREATE TABLE IF NOT EXISTS public.property_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
    action TEXT NOT NULL,
    changed_by TEXT NOT NULL,
    notes TEXT,
    previous_status TEXT,
    new_status TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. BUYER ENQUIRIES & LEADS TABLE
CREATE TABLE IF NOT EXISTS public.enquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id TEXT UNIQUE NOT NULL,
    property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
    property_title TEXT,
    name TEXT NOT NULL,
    mobile TEXT NOT NULL,
    email TEXT,
    buyer_type TEXT NOT NULL CHECK (buyer_type IN ('individual', 'investor', 'company', 'developer', 'broker')),
    budget_min NUMERIC(15, 2),
    budget_max NUMERIC(15, 2),
    message TEXT,
    preferred_contact_time TEXT,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'interested', 'site-visit-scheduled', 'negotiation', 'converted', 'closed', 'not-interested')),
    source TEXT DEFAULT 'website',
    consent BOOLEAN NOT NULL DEFAULT true,
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 12. LEAD NOTES TABLE
CREATE TABLE IF NOT EXISTS public.lead_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enquiry_id UUID REFERENCES public.enquiries(id) ON DELETE CASCADE NOT NULL,
    note TEXT NOT NULL,
    created_by TEXT DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 13. SAVED PROPERTIES TABLE
CREATE TABLE IF NOT EXISTS public.saved_properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, property_id)
);

-- 14. ADMIN SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.admin_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- SEARCH PERFORMANCE INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_properties_slug ON public.properties(slug);
CREATE INDEX IF NOT EXISTS idx_properties_category ON public.properties(category);
CREATE INDEX IF NOT EXISTS idx_properties_city ON public.properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_source ON public.properties(source);
CREATE INDEX IF NOT EXISTS idx_properties_price ON public.properties(price);
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON public.enquiries(status);
CREATE INDEX IF NOT EXISTS idx_enquiries_lead_id ON public.enquiries(lead_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- 1. PUBLIC ACCESS: Can ONLY view PUBLISHED / ACTIVE properties
CREATE POLICY "Public can view published properties"
ON public.properties FOR SELECT
USING (status = 'published');

-- 2. PUBLIC IMAGES: Can only view images for published properties
CREATE POLICY "Public can view published property images"
ON public.property_images FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.properties p
    WHERE p.id = property_images.property_id AND p.status = 'published'
));

-- 3. CONFIDENTIAL DOCUMENTS: Strictly inaccessible to public if is_private is true
CREATE POLICY "Public can only view non-private documents"
ON public.property_documents FOR SELECT
USING (is_private = false AND EXISTS (
    SELECT 1 FROM public.properties p
    WHERE p.id = property_documents.property_id AND p.status = 'published'
));

-- 4. PUBLIC ENQUIRIES: Visitors can insert new buyer inquiries
CREATE POLICY "Public can submit enquiries"
ON public.enquiries FOR INSERT
WITH CHECK (true);

-- 5. PUBLIC SELLER SUBMISSION: Public can insert with status 'pending' ONLY
CREATE POLICY "Public can submit pending properties"
ON public.properties FOR INSERT
WITH CHECK (status = 'pending' AND source IN ('owner', 'agent', 'developer'));

CREATE POLICY "Public can insert seller info"
ON public.sellers FOR INSERT
WITH CHECK (true);

-- 6. ADMIN & SERVICE ROLE FULL PRIVILEGES (BYPASS)
CREATE POLICY "Admin full access properties"
ON public.properties FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role' OR auth.jwt() ->> 'email' = 'admin@landparcel.in');

CREATE POLICY "Admin full access documents"
ON public.property_documents FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role' OR auth.jwt() ->> 'email' = 'admin@landparcel.in');

CREATE POLICY "Admin full access audit logs"
ON public.property_audit_logs FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role' OR auth.jwt() ->> 'email' = 'admin@landparcel.in');

CREATE POLICY "Admin full access enquiries"
ON public.enquiries FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role' OR auth.jwt() ->> 'email' = 'admin@landparcel.in');
