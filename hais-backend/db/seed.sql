-- HAIS ERP - PostgreSQL Seeder
-- Mengisi data awal untuk keperluan testing dan development

-- Insert Superuser & Admin
INSERT INTO users (id, name, username, password_hash, role) VALUES
('11111111-1111-1111-1111-111111111111', 'Super Admin', 'superuser', '$argon2id$v=19$m=19456,t=2,p=1$4n4QyV3wL1U5b0NXYp3Yow$gCjP2+8yTz1Xk2nBqPZ3P+zZqY/J4vS9J5gP2yM9H6o', 'superuser'),
('22222222-2222-2222-2222-222222222222', 'Manager Ops', 'manager', '$argon2id$v=19$m=19456,t=2,p=1$4n4QyV3wL1U5b0NXYp3Yow$gCjP2+8yTz1Xk2nBqPZ3P+zZqY/J4vS9J5gP2yM9H6o', 'manager'),
('33333333-3333-3333-3333-333333333333', 'Staff Lapangan 1', 'staff1', '$argon2id$v=19$m=19456,t=2,p=1$4n4QyV3wL1U5b0NXYp3Yow$gCjP2+8yTz1Xk2nBqPZ3P+zZqY/J4vS9J5gP2yM9H6o', 'staff')
ON CONFLICT (username) DO NOTHING;

-- Insert Personnels
INSERT INTO personnels (id, user_id, identity_num, rank) VALUES
('44444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333333', 'EMP-001', 'Team Leader'),
('55555555-5555-5555-5555-555555555555', NULL, 'EMP-002', 'Rescue Personnel')
ON CONFLICT (identity_num) DO NOTHING;

-- Insert Shift Groups
INSERT INTO shift_groups (id, name) VALUES
('66666666-6666-6666-6666-666666666666', 'Alpha'),
('77777777-7777-7777-7777-777777777777', 'Bravo'),
('88888888-8888-8888-8888-888888888888', 'Charlie')
ON CONFLICT (name) DO NOTHING;

-- Insert Shift Members
INSERT INTO shift_members (shift_group_id, personnel_id) VALUES
('66666666-6666-6666-6666-666666666666', '44444444-4444-4444-4444-444444444444'),
('66666666-6666-6666-6666-666666666666', '55555555-5555-5555-5555-555555555555');

-- Insert Vehicles
INSERT INTO vehicles (id, call_sign, category, vehicle_type, license_plate, specifications) VALUES
('99999999-9999-9999-9999-999999999999', 'Foam Tender 1', 'UTAMA', 'FOAM_TENDER', 'B 1234 ABC', '{"water_capacity": 10000, "foam_capacity": 1200}'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Ambulance 1', 'PENDUKUNG', 'AMBULANCE', 'B 5678 DEF', '{"medical_beds": 1, "oxygen_tanks": 2}')
ON CONFLICT (call_sign) DO NOTHING;

-- Insert Checklist Templates
INSERT INTO checklist_templates (id, target_type, name) VALUES
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'VEHICLE', 'Inspeksi Harian Kendaraan Utama (Foam Tender)');

-- Insert Checklist Items
INSERT INTO checklist_items (template_id, category, description, is_critical) VALUES
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Engine', 'Level Oli Mesin dalam batas normal', true),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Pump', 'Tekanan pompa normal (8-10 bar)', true),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Body', 'Tidak ada goresan atau penyok mayor', false);
