-- HAIS ERP - PostgreSQL Schema
-- Mengacu pada API_CONTRACT.md

DROP TABLE IF EXISTS audit_logs, digital_signatures, inspection_results, inspections, checklist_items, checklist_templates, vehicles, daily_rosters, shift_members, shift_groups, personnels, users CASCADE;


-- Mengaktifkan ekstensi UUID (jika belum ada)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 5.1. Table: users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ -- Soft delete
);

-- 5.2. Table: personnels
CREATE TABLE IF NOT EXISTS personnels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    identity_num VARCHAR(50) UNIQUE,
    rank VARCHAR(50),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    deleted_at TIMESTAMPTZ
);

-- 5.3. Table: shift_groups
CREATE TABLE IF NOT EXISTS shift_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE,
    deleted_at TIMESTAMPTZ
);

-- 5.4. Table: shift_members
CREATE TABLE IF NOT EXISTS shift_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shift_group_id UUID REFERENCES shift_groups(id) ON DELETE CASCADE,
    personnel_id UUID REFERENCES personnels(id) ON DELETE CASCADE,
    deleted_at TIMESTAMPTZ
);

-- 5.5. Table: daily_rosters
CREATE TABLE IF NOT EXISTS daily_rosters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    shift_group_id UUID REFERENCES shift_groups(id) ON DELETE CASCADE,
    personnel_id UUID REFERENCES personnels(id) ON DELETE CASCADE,
    is_present BOOLEAN DEFAULT TRUE,
    notes VARCHAR(255),
    deleted_at TIMESTAMPTZ
);

-- 5.6. Table: vehicles
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    call_sign VARCHAR(50) UNIQUE,
    category VARCHAR(50) NOT NULL,
    vehicle_type VARCHAR(50),
    license_plate VARCHAR(50),
    status VARCHAR(50) DEFAULT 'READY',
    specifications JSONB,
    deleted_at TIMESTAMPTZ
);

-- 5.7. Table: checklist_templates
CREATE TABLE IF NOT EXISTS checklist_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    target_type VARCHAR(50),
    name VARCHAR(255),
    deleted_at TIMESTAMPTZ
);

-- 5.8. Table: checklist_items
CREATE TABLE IF NOT EXISTS checklist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID REFERENCES checklist_templates(id) ON DELETE CASCADE,
    category VARCHAR(100),
    description VARCHAR(255),
    is_critical BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ
);

-- 5.9. Table: inspections
CREATE TABLE IF NOT EXISTS inspections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    target_type VARCHAR(50) NOT NULL,
    target_id UUID NOT NULL,
    inspector_id UUID REFERENCES personnels(id) ON DELETE CASCADE,
    template_id UUID REFERENCES checklist_templates(id) ON DELETE CASCADE,
    result VARCHAR(20) NOT NULL,
    notes TEXT,
    inspected_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- 5.10. Table: inspection_results
CREATE TABLE IF NOT EXISTS inspection_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inspection_id UUID REFERENCES inspections(id) ON DELETE CASCADE,
    item_id UUID REFERENCES checklist_items(id) ON DELETE CASCADE,
    is_ok BOOLEAN NOT NULL,
    actual_value VARCHAR(255),
    notes TEXT,
    deleted_at TIMESTAMPTZ
);

-- 5.11. Table: digital_signatures
CREATE TABLE IF NOT EXISTS digital_signatures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_type VARCHAR(50) NOT NULL,
    reference_id UUID NOT NULL,
    signer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    signature_hash VARCHAR(255) NOT NULL,
    signed_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- 5.12. Table: audit_logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    ip_address VARCHAR(50),
    timestamp TIMESTAMPTZ DEFAULT NOW()
);
