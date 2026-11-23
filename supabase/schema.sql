-- ==============================================================================
-- LAND PARCEL - PRODUCTION POSTGRESQL / SUPABASE DATABASE SCHEMA
-- Super Admin (Aditya Raj), Customer OTP Accounts, Dual Listing & Subscriptions
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. USER PROFILES & ROLE-BASED ACCESS CONTROL (Supabase Auth Integration)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    mobile TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE,
    account_type TEXT DEFAULT 'owner' CHECK (account_type IN ('owner', 'dealer', 'agent', 'builder', 'developer', 'super_admin')),
    role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'super_admin')),
    is_mobile_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Server-verified admin check functions (NEVER trust client claims or mobile string alone)
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    IF auth.jwt() ->> 'role' = 'service_role' THEN
        RETURN true;
    END IF;
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
          AND role = 'super_admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_verified_admin()
RETURNS BOOLEAN AS $$
BEGIN
    IF auth.jwt() ->> 'role' = 'service_role' THEN
        RETURN true;
    END IF;
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
          AND role IN ('super_admin', 'admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Prevent unauthorized role escalation on public.profiles
CREATE OR REPLACE FUNCTION public.prevent_profile_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
    IF auth.jwt() ->> 'role' = 'service_role' THEN
        RETURN NEW;
    END IF;

    IF NOT public.is_super_admin() THEN
        IF TG_OP = 'INSERT' AND NEW.role IS DISTINCT FROM 'customer' THEN
            RAISE EXCEPTION 'Only an authorized Super Admin can assign admin roles.';
        END IF;
        IF TG_OP = 'UPDATE' AND NEW.role IS DISTINCT FROM OLD.role THEN
            RAISE EXCEPTION 'Only an authorized Super Admin can change user roles.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_profile_role_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_profile_role_escalation
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_role_escalation();

-- ==============================================================================
-- 3. SECURE MOBILE OTP VERIFICATIONS (SERVER SERVICE_ROLE ONLY)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.otp_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mobile TEXT NOT NULL,
    otp_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    purpose TEXT DEFAULT 'customer_auth' CHECK (purpose IN ('customer_auth', 'registration')),
    attempts INT DEFAULT 0,
    max_attempts INT DEFAULT 5,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_otp_mobile ON public.otp_verifications(mobile);
CREATE INDEX IF NOT EXISTS idx_otp_expires ON public.otp_verifications(expires_at);

-- Strictly lock OTP table to server service_role only (no client access)
ALTER TABLE public.otp_verifications ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 4. SUBSCRIPTION PLANS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    billing_period TEXT DEFAULT 'monthly' CHECK (billing_period IN ('monthly', 'quarterly')),
    validity_months INT NOT NULL DEFAULT 1,
    listing_credits INT NOT NULL DEFAULT 20,
    listing_quota INT NOT NULL DEFAULT 20,
    featured_quota INT DEFAULT 0,
    features JSONB DEFAULT '[]'::jsonb,
    is_popular BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 5. CUSTOMER ACCOUNTS TABLE (QUOTA, VERIFIED MOBILE & SUBSCRIPTION TRACKER)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.client_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    mobile TEXT UNIQUE NOT NULL,
    email TEXT,
    role TEXT DEFAULT 'owner' CHECK (role IN ('owner', 'dealer', 'agent', 'builder', 'developer')),
    system_role TEXT DEFAULT 'customer' CHECK (system_role IN ('customer', 'admin', 'super_admin')),
    is_mobile_verified BOOLEAN DEFAULT false,
    company_name TEXT,
    rera_number TEXT,
    pan_number TEXT,

    -- Free Listing Plan (Strict 5 lifetime free credits; never resets monthly)
    free_credits_total INT DEFAULT 5,
    free_credits_used INT DEFAULT 0,

    -- Purchased Subscription Listing Credits (Separate from free credits; added ONLY after verified payment)
    paid_credits_total INT DEFAULT 0,
    paid_credits_used INT DEFAULT 0,

    -- Subscription Status
    subscription_status TEXT DEFAULT 'none' CHECK (subscription_status IN ('none', 'active', 'expired', 'pending', 'cancelled')),
    current_plan_id UUID REFERENCES public.subscription_plans(id) ON DELETE SET NULL,
    current_plan_name TEXT,
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Prevent customers from modifying their own credits, subscription status, or system_role
CREATE OR REPLACE FUNCTION public.prevent_customer_credit_tampering()
RETURNS TRIGGER AS $$
BEGIN
    IF auth.jwt() ->> 'role' = 'service_role' OR public.is_super_admin() THEN
        RETURN NEW;
    END IF;

    IF TG_OP = 'UPDATE' THEN
        IF NEW.system_role IS DISTINCT FROM OLD.system_role
           OR NEW.free_credits_total IS DISTINCT FROM OLD.free_credits_total
           OR NEW.free_credits_used IS DISTINCT FROM OLD.free_credits_used
           OR NEW.paid_credits_total IS DISTINCT FROM OLD.paid_credits_total
           OR NEW.paid_credits_used IS DISTINCT FROM OLD.paid_credits_used
           OR NEW.subscription_status IS DISTINCT FROM OLD.subscription_status THEN
            RAISE EXCEPTION 'Unauthorized modification of credits, subscription, or role.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_customer_credit_tampering ON public.client_accounts;
CREATE TRIGGER trg_prevent_customer_credit_tampering
BEFORE UPDATE ON public.client_accounts
FOR EACH ROW EXECUTE FUNCTION public.prevent_customer_credit_tampering();

-- ==============================================================================
-- 6. SUBSCRIPTIONS HISTORY & PAYMENT TRANSACTIONS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES public.client_accounts(id) ON DELETE CASCADE NOT NULL,
    plan_id UUID REFERENCES public.subscription_plans(id) ON DELETE SET NULL,
    plan_name TEXT NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'pending', 'cancelled')),
    amount NUMERIC(10, 2) NOT NULL,
    billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'quarterly')),
    validity_months INT DEFAULT 1,
    listing_credits INT DEFAULT 20,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('offline_upi', 'offline_bank_transfer', 'offline_cash', 'gateway_razorpay')),
    payment_reference TEXT,
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.payment_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id TEXT UNIQUE NOT NULL,
    invoice_number TEXT,
    client_id UUID REFERENCES public.client_accounts(id) ON DELETE CASCADE NOT NULL,
    client_name TEXT NOT NULL,
    client_mobile TEXT NOT NULL,
    client_email TEXT,
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
    plan_id UUID REFERENCES public.subscription_plans(id) ON DELETE SET NULL,
    plan_name TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    status TEXT DEFAULT 'pending_verification' CHECK (status IN ('pending_verification', 'verified', 'rejected')),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('offline_upi', 'offline_bank_transfer', 'offline_cash', 'gateway_razorpay')),
    reference_number TEXT NOT NULL,
    proof_notes TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by TEXT,
    admin_notes TEXT
);

-- ==============================================================================
-- 7. PROPERTY CATEGORIES, LOCATIONS, SELLERS & CENTRAL PROPERTIES
-- ==============================================================================
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

CREATE TABLE IF NOT EXISTS public.sellers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    mobile TEXT NOT NULL,
    email TEXT,
    seller_type TEXT NOT NULL CHECK (seller_type IN ('owner', 'dealer', 'agent', 'builder', 'developer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('residential', 'commercial', 'industrial', 'agricultural', 'institutional', 'large-land')),
    property_type TEXT NOT NULL,

    -- Dual Listing Statuses & Origin
    status TEXT DEFAULT 'pending' CHECK (status IN ('draft', 'pending', 'published', 'rejected', 'sold', 'rented', 'unpublished')),
    source TEXT DEFAULT 'owner' CHECK (source IN ('admin', 'owner', 'dealer', 'agent', 'builder', 'developer')),
    availability_status TEXT DEFAULT 'available' CHECK (availability_status IN ('ready-to-move', 'under-construction', 'available', 'sold')),

    -- Location
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

    -- Area Specs
    total_area NUMERIC(12, 2) NOT NULL,
    area_unit TEXT NOT NULL CHECK (area_unit IN ('sqft', 'sqm', 'sqyd', 'acre', 'bigha', 'kanal', 'marla', 'hectare')),
    built_up_area NUMERIC(12, 2),
    carpet_area NUMERIC(12, 2),

    -- Residential Specs
    bedrooms INT,
    bathrooms INT,
    floor_number INT,
    total_floors INT,
    furnishing TEXT CHECK (furnishing IN ('furnished', 'semi-furnished', 'unfurnished')),
    parking INT,
    property_age TEXT,

    -- Industrial Specs
    covered_area NUMERIC(12, 2),
    road_width NUMERIC(6, 2),
    ceiling_height NUMERIC(6, 2),
    power_availability TEXT,
    loading_facilities BOOLEAN DEFAULT false,

    -- Agricultural Specs
    land_type TEXT,
    road_access TEXT,
    water_availability TEXT,

    -- Meta & SEO
    nearby_landmarks TEXT,
    road_connectivity TEXT,
    highlights TEXT[] DEFAULT '{}',
    is_featured BOOLEAN DEFAULT false,
    is_demo BOOLEAN DEFAULT false,
    view_count INT DEFAULT 0,
    video_url TEXT,
    seo_title TEXT,
    seo_description TEXT,

    -- Relational Ownership
    customer_id UUID REFERENCES public.client_accounts(id) ON DELETE SET NULL,
    seller_id UUID REFERENCES public.sellers(id) ON DELETE SET NULL,
    seller_name TEXT,
    seller_mobile TEXT,
    seller_email TEXT,
    seller_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS public.property_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
    url TEXT NOT NULL,
    alt_text TEXT,
    is_cover BOOLEAN DEFAULT false,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.property_videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
    url TEXT NOT NULL,
    title TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.property_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT,
    is_private BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

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

-- ==============================================================================
-- 8. ENQUIRIES, LEAD NOTES, SAVED PROPERTIES & ADMIN SETTINGS
-- ==============================================================================
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

CREATE TABLE IF NOT EXISTS public.lead_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enquiry_id UUID REFERENCES public.enquiries(id) ON DELETE CASCADE NOT NULL,
    note TEXT NOT NULL,
    created_by TEXT DEFAULT 'Aditya Raj',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.saved_properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, property_id)
);

CREATE TABLE IF NOT EXISTS public.admin_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 9. PERFORMANCE INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_mobile ON public.profiles(mobile);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_properties_slug ON public.properties(slug);
CREATE INDEX IF NOT EXISTS idx_properties_category ON public.properties(category);
CREATE INDEX IF NOT EXISTS idx_properties_city ON public.properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_source ON public.properties(source);
CREATE INDEX IF NOT EXISTS idx_properties_customer ON public.properties(customer_id);
CREATE INDEX IF NOT EXISTS idx_client_accounts_mobile ON public.client_accounts(mobile);
CREATE INDEX IF NOT EXISTS idx_client_accounts_user_id ON public.client_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_client_accounts_status ON public.client_accounts(subscription_status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_client ON public.subscriptions(client_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON public.payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_client ON public.payment_transactions(client_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON public.enquiries(status);
CREATE INDEX IF NOT EXISTS idx_enquiries_lead_id ON public.enquiries(lead_id);

-- ==============================================================================
-- 10. STRICT ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- Profiles: Users read/update only their own profile; Super Admin manages all
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (id = auth.uid() OR public.is_verified_admin());
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Super Admin manages all profiles" ON public.profiles FOR ALL USING (public.is_super_admin());

-- Properties: Public views published only; Customers view & edit own non-published listings; Admin manages all
CREATE POLICY "Public views published properties" ON public.properties FOR SELECT USING (status = 'published');
CREATE POLICY "Customers view own properties" ON public.properties FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.client_accounts ca WHERE ca.id = properties.customer_id AND ca.user_id = auth.uid())
);
CREATE POLICY "Customers submit pending properties" ON public.properties FOR INSERT WITH CHECK (
    status = 'pending' AND source IN ('owner', 'dealer', 'agent', 'builder', 'developer')
);
CREATE POLICY "Customers edit own non-published properties" ON public.properties FOR UPDATE USING (
    status IN ('draft', 'pending', 'rejected') AND
    EXISTS (SELECT 1 FROM public.client_accounts ca WHERE ca.id = properties.customer_id AND ca.user_id = auth.uid())
) WITH CHECK (
    status IN ('draft', 'pending') AND source <> 'admin'
);
CREATE POLICY "Admin full access properties" ON public.properties FOR ALL USING (public.is_verified_admin());

-- Property Images & Videos
CREATE POLICY "Public views published images" ON public.property_images FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.properties p WHERE p.id = property_images.property_id AND p.status = 'published')
);
CREATE POLICY "Admin full access images" ON public.property_images FOR ALL USING (public.is_verified_admin());

CREATE POLICY "Public views published videos" ON public.property_videos FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.properties p WHERE p.id = property_videos.property_id AND p.status = 'published')
);
CREATE POLICY "Admin full access videos" ON public.property_videos FOR ALL USING (public.is_verified_admin());

-- Confidential Property Documents: Strictly Admin Only
CREATE POLICY "Admin full access documents" ON public.property_documents FOR ALL USING (public.is_verified_admin());
CREATE POLICY "Admin full access audit logs" ON public.property_audit_logs FOR ALL USING (public.is_verified_admin());

-- Enquiries & Lead Notes
CREATE POLICY "Public submits enquiries" ON public.enquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin full access enquiries" ON public.enquiries FOR ALL USING (public.is_verified_admin());
CREATE POLICY "Admin full access lead notes" ON public.lead_notes FOR ALL USING (public.is_verified_admin());
CREATE POLICY "Admin full access settings" ON public.admin_settings FOR ALL USING (public.is_super_admin());

-- Subscription Plans: Public read active; Super Admin manages pricing/credits
CREATE POLICY "Public views active plans" ON public.subscription_plans FOR SELECT USING (is_active = true);
CREATE POLICY "Super Admin manages plans" ON public.subscription_plans FOR ALL USING (public.is_super_admin());

-- Client Accounts: Strictly own account only; Super Admin manages all
CREATE POLICY "Customers view own account" ON public.client_accounts FOR SELECT USING (user_id = auth.uid() OR public.is_verified_admin());
CREATE POLICY "Customers update own profile fields" ON public.client_accounts FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Super Admin manages client accounts" ON public.client_accounts FOR ALL USING (public.is_super_admin());

-- Subscriptions & Payments: Own records read-only; pending insert only; Super Admin verifies & manages all
CREATE POLICY "Customers view own subscriptions" ON public.subscriptions FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.client_accounts ca WHERE ca.id = subscriptions.client_id AND ca.user_id = auth.uid())
    OR public.is_verified_admin()
);
CREATE POLICY "Super Admin manages subscriptions" ON public.subscriptions FOR ALL USING (public.is_super_admin());

CREATE POLICY "Customers view own payments" ON public.payment_transactions FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.client_accounts ca WHERE ca.id = payment_transactions.client_id AND ca.user_id = auth.uid())
    OR public.is_verified_admin()
);
CREATE POLICY "Customers submit pending payments" ON public.payment_transactions FOR INSERT WITH CHECK (
    status = 'pending_verification' AND
    EXISTS (SELECT 1 FROM public.client_accounts ca WHERE ca.id = payment_transactions.client_id AND ca.user_id = auth.uid())
);
CREATE POLICY "Super Admin manages payments" ON public.payment_transactions FOR ALL USING (public.is_super_admin());

-- ==============================================================================
-- 11. SEED OFFICIAL SUBSCRIPTION PLANS ONLY (NO DEMO USERS / NO FAKE PAYMENTS)
-- ==============================================================================
INSERT INTO public.subscription_plans (slug, name, description, price, billing_period, validity_months, listing_credits, listing_quota, featured_quota, features, is_popular)
VALUES
    ('monthly-plan', 'Monthly Plan', 'Standard monthly listing package for property owners, dealers, agents, builders, and developers in Delhi NCR.', 599, 'monthly', 1, 20, 20, 1, '["20 Property Listing Credits", "Validity: 1 Month (30 Days)", "Separate from 5 Lifetime Free Credits", "Credits Added Upon Payment Verification", "Existing Published Listings Stay Live After Expiry", "Official Tax Invoice & Receipt"]'::jsonb, false),
    ('quarterly-plan', 'Quarterly Plan', 'Best value 3-month package for active dealers, agents, builders, and developers.', 999, 'quarterly', 3, 50, 50, 3, '["50 Property Listing Credits", "Validity: 3 Months (90 Days)", "Save ₹798 Compared to Monthly Renewals", "Separate from 5 Lifetime Free Credits", "Credits Added Upon Payment Verification", "Existing Published Listings Stay Live After Expiry", "Official Tax Invoice & Receipt"]'::jsonb, true)
ON CONFLICT (slug) DO UPDATE SET
    price = EXCLUDED.price,
    validity_months = EXCLUDED.validity_months,
    listing_credits = EXCLUDED.listing_credits,
    listing_quota = EXCLUDED.listing_quota;

-- ==============================================================================
-- 12. SUPABASE STORAGE BUCKETS CONFIGURATION
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'properties',
    'properties',
    true,
    52428800,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/quicktime', 'video/webm']
) ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'property-documents',
    'property-documents',
    false,
    52428800,
    ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png']
) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Read Properties Bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'properties');

CREATE POLICY "Admin All Properties Bucket"
ON storage.objects FOR ALL
USING (bucket_id = 'properties' AND public.is_verified_admin());

CREATE POLICY "Admin Restricted Property Documents Bucket"
ON storage.objects FOR ALL
USING (bucket_id = 'property-documents' AND public.is_verified_admin());

-- ==============================================================================
-- NOTE FOR PRODUCTION SUPER ADMIN BOOTSTRAP (Aditya Raj — 8377056503):
-- After creating Aditya Raj's password-protected account in Supabase Auth:
--   UPDATE public.profiles SET role = 'super_admin', full_name = 'Aditya Raj', mobile = '8377056503', is_mobile_verified = true WHERE id = '<ADITYA_AUTH_UUID>';
-- Never auto-grant super_admin from client input or mobile number alone.
-- ==============================================================================
