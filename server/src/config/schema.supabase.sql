-- ==========================================
-- EXPORTFLOW — SUPABASE POSTGRESQL DDL SCHEMA
-- Copy & Run this script in your Supabase SQL Editor
-- ==========================================

-- 1. Create Custom Enum Types
CREATE TYPE user_role AS ENUM ('Admin', 'Manager', 'Sales');
CREATE TYPE validation_status AS ENUM ('Valid', 'Invalid', 'Risky', 'Unknown', 'Disposable');
CREATE TYPE outreach_status AS ENUM ('Not Contacted', 'Campaign Queued', 'Email Sent', 'Follow Up Scheduled', 'Replied', 'Unresponsive', 'Opted Out');
CREATE TYPE campaign_status AS ENUM ('Draft', 'Pending_Approval', 'Approved', 'Rejected', 'Running', 'Paused', 'Completed');
CREATE TYPE follow_up_priority AS ENUM ('High', 'Medium', 'Low');

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'Sales',
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Organizations Table
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL DEFAULT 'Apex Industrial Exports',
    export_products TEXT[] DEFAULT ARRAY['Industrial Valves & Actuators', 'Submersible Slurry Pumps'],
    target_markets TEXT[] DEFAULT ARRAY['Germany', 'USA', 'UAE', 'Japan', 'Brazil'],
    daily_email_limit INT DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Companies Table
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255) UNIQUE NOT NULL,
    website VARCHAR(255),
    country VARCHAR(100) NOT NULL,
    industry VARCHAR(100) NOT NULL,
    product_interest VARCHAR(255),
    description TEXT,
    employee_count VARCHAR(50),
    source VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Buyer Leads Table
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255) NOT NULL,
    job_title VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(100),
    website VARCHAR(255),
    country VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    city VARCHAR(100),
    industry VARCHAR(100) NOT NULL,
    product_interest VARCHAR(255),
    buyer_type VARCHAR(100) DEFAULT 'Importer',
    lead_source VARCHAR(100) DEFAULT 'CSV Import',
    source_url TEXT,
    company_description TEXT,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    assigned_user UUID REFERENCES users(id) ON DELETE SET NULL,
    lead_status VARCHAR(50) DEFAULT 'Valid',
    validation_status validation_status DEFAULT 'Valid',
    validation_reason TEXT,
    validation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ai_classification VARCHAR(100),
    ai_score INT DEFAULT 60,
    ai_confidence DECIMAL(5,2) DEFAULT 0.85,
    ai_reasoning TEXT,
    ai_recommended_approach TEXT,
    outreach_status outreach_status DEFAULT 'Not Contacted',
    last_contacted TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performant filtering
CREATE INDEX IF NOT EXISTS idx_leads_country_industry ON leads(country, industry);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_ai_score ON leads(ai_score DESC);

-- 6. Email Templates Table
CREATE TABLE IF NOT EXISTS email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body_template TEXT NOT NULL,
    product_category VARCHAR(100),
    target_buyer_type VARCHAR(100),
    is_default BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Campaigns Table
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    product VARCHAR(255) NOT NULL,
    target_countries TEXT[],
    target_industries TEXT[],
    template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,
    daily_sending_limit INT DEFAULT 50,
    status campaign_status DEFAULT 'Draft',
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Follow-ups Table
CREATE TABLE IF NOT EXISTS follow_ups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    assigned_user UUID REFERENCES users(id) ON DELETE SET NULL,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    title VARCHAR(255) NOT NULL,
    notes TEXT,
    status VARCHAR(50) DEFAULT 'Pending',
    priority follow_up_priority DEFAULT 'Medium',
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Suppression List Table
CREATE TABLE IF NOT EXISTS suppression_list (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    reason VARCHAR(255) DEFAULT 'User Unsubscribed',
    source VARCHAR(100) DEFAULT 'Manual',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Audit Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_name VARCHAR(255),
    user_role VARCHAR(50),
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100),
    entity_id VARCHAR(255),
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Default Permissive RLS Policies for Service Role & Authenticated API
CREATE POLICY "Allow service role full access" ON users FOR ALL USING (true);
CREATE POLICY "Allow service role full access" ON leads FOR ALL USING (true);
CREATE POLICY "Allow service role full access" ON companies FOR ALL USING (true);
CREATE POLICY "Allow service role full access" ON campaigns FOR ALL USING (true);
