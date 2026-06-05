# HAIS ERP - API & Database Contract

Dokumen ini mendefinisikan standar kontrak **RESTful API** dan **Database Schema** untuk Hang Nadim ARFF Integrated System (HAIS), menjembatani Frontend (React Native) dan Backend (Rust Axum + PostgreSQL).

## 1. Standar Response API

Sesuai dengan *Cybersecurity & Development Skill*, semua _endpoint_ HAIS **wajib** membungkus responnya dalam standar seragam (`ApiResponse`).

### 1.1. Response Sukses (200 OK / 201 Created)
```json
{
  "success": true,
  "message": "Operasi berhasil",
  "data": { ... } // (Optional) Objek atau Array data
}
```

### 1.2. Response Gagal (400, 401, 403, 404, 500)
```json
{
  "success": false,
  "message": "Deskripsi error yang aman bagi pengguna (Tidak mengekspos isi database)",
  "data": null
}
```
*Catatan Security:* Backend Rust **tidak boleh** melempar (_throw_) _stack trace error_ atau _query_ SQL asli ke Frontend.

---

## 2. Authentication & Authorization

Semua _endpoint_ (kecuali login & forgot password) **wajib** menggunakan header otorisasi:
`Authorization: Bearer <access_token>`

### 2.1. API Endpoints

| Method | Endpoint | Deskripsi | Akses Role |
|--------|----------|-----------|------------|
| POST | `/v1/auth/login` | Login user & dapatkan token | Public |
| POST | `/v1/auth/refresh` | Refresh access token via refreshToken | Public |
| POST | `/v1/auth/forgot-password` | Kirim kode OTP ke email | Public |
| POST | `/v1/auth/logout` | Invalidate token dari Redis Cache | Authenticated |

---

## 3. Public Document Verification (Digital Signature)

Fitur ini dapat diakses dari halaman Login tanpa perlu autentikasi. Berguna untuk memindai QR Code di dokumen cetak/PDF guna memastikan keaslian Tanda Tangan Digital.

| Method | Endpoint | Deskripsi | Akses Role |
|--------|----------|-----------|------------|
| GET | `/v1/documents/verify/{signature_id}` | Cek keaslian dokumen & info penanda tangan | Public |

---

## 3. Operational Modules API (Business Layer)

Berikut rancangan kontrak untuk modul-modul bisnis operasional ARFF:

### 3.1. Personnel & Shift Data
| Method | Endpoint | Deskripsi | Akses Role |
|--------|----------|-----------|------------|
| GET | `/v1/personnel` | Ambil daftar personel aktif | All Business Roles |
| GET | `/v1/personnel/duty` | Ambil daftar personel *On Duty* | All Business Roles |
| GET | `/v1/shifts/today` | Ambil jadwal *Shift* hari ini | All Business Roles |
| POST | `/v1/shifts/assign` | Menentukan anggota ke suatu shift | Manager, Team Leader |

### 3.2. Vehicle (Fleet Management) & Inspection
| Method | Endpoint | Deskripsi | Akses Role |
|--------|----------|-----------|------------|
| GET | `/v1/vehicles` | Daftar kendaraan dan statusnya | All Business Roles |
| POST | `/v1/inspections` | Submit form inspeksi harian kendaraan | Staff, Team Leader |
| GET | `/v1/inspections/history/{vehicle_id}` | Lihat riwayat inspeksi | Manager, Team Leader |

### 3.3. Emergency & Watchroom
| Method | Endpoint | Deskripsi | Akses Role |
|--------|----------|-----------|------------|
| POST | `/v1/emergencies` | Broadcast / Lapor situasi darurat | All Roles |
| PUT | `/v1/emergencies/{id}/status` | Update status penanganan (Resolved) | Watchroom, Manager |

---

## 4. System Administration API (System Layer)

Modul ini **hanya** dapat diakses oleh `superuser` dan `administrator`.

| Method | Endpoint | Deskripsi | Akses Role |
|--------|----------|-----------|------------|
| POST | `/v1/admin/users` | Registrasi akun user baru (Karyawan) | Administrator |
| GET | `/v1/admin/audit-logs` | Lihat aktivitas (*Create/Update/Delete*) | Superuser |
| POST | `/v1/admin/database/backup` | Trigger manual backup database | Superuser |

---

## 5. Database Schema (PostgreSQL)

Mengacu pada arsitektur DDD, berikut adalah *Entity-Relationship* mendasar yang menopang API di atas.

### 5.1. Table: `users` (System/Auth)
| Kolom | Tipe Data | Constraint | Keterangan |
|-------|-----------|------------|------------|
| id | UUID | PRIMARY KEY | |
| name | VARCHAR(255)| NOT NULL | |
| username | VARCHAR(100)| UNIQUE | |
| password_hash | VARCHAR(255)| NOT NULL | Hashed by Argon2id |
| role | VARCHAR(50) | NOT NULL | e.g., 'superuser', 'staff', 'manager' |
| created_at | TIMESTAMPTZ | DEFAULT NOW()| |

### 5.2. Table: `personnels` (Business Layer)
| Kolom | Tipe Data | Constraint | Keterangan |
|-------|-----------|------------|------------|
| id | UUID | PRIMARY KEY | |
| user_id | UUID | FK -> users(id) | Relasi Akun (Bisa Null jika belum ada akun) |
| identity_num | VARCHAR(50) | UNIQUE | NIK / Nomor Pegawai |
| rank | VARCHAR(50) | | Pangkat / Jabatan ARFF |
| status | VARCHAR(50) | DEFAULT 'ACTIVE' | ACTIVE, LEAVE, SICK, OFF |

### 5.3. Table: `shift_groups` (Master Regu)
| Kolom | Tipe Data | Constraint | Keterangan |
|-------|-----------|------------|------------|
| id | UUID | PRIMARY KEY | |
| name | VARCHAR(50) | UNIQUE | e.g., 'Alpha', 'Bravo', 'Charlie' |

### 5.4. Table: `shift_members` (Anggota Tetap Regu)
| Kolom | Tipe Data | Constraint | Keterangan |
|-------|-----------|------------|------------|
| id | UUID | PRIMARY KEY | |
| shift_group_id| UUID | FK -> shift_groups(id) | |
| personnel_id | UUID | FK -> personnels(id) | Anggota ARFF |

### 5.5. Table: `daily_rosters` (Buku Jaga Harian Transaksional)
| Kolom | Tipe Data | Constraint | Keterangan |
|-------|-----------|------------|------------|
| id | UUID | PRIMARY KEY | |
| date | DATE | NOT NULL | Tanggal dinas (e.g., 2026-06-05) |
| shift_group_id| UUID | FK -> shift_groups(id) | Regu yang dinas hari ini |
| personnel_id | UUID | FK -> personnels(id) | Personel aktual yang dinas |
| is_present | BOOLEAN | DEFAULT TRUE | Apakah hadir? |
| notes | VARCHAR(255)| | e.g., 'Sakit', 'Cuti' |

### 5.6. Table: `vehicles`
| Kolom | Tipe Data | Constraint | Keterangan |
|-------|-----------|------------|------------|
| id | UUID | PRIMARY KEY | |
| call_sign | VARCHAR(50) | UNIQUE | e.g., 'Foam Tender 1', 'Ambulance 1' |
| category | VARCHAR(50) | NOT NULL | 'UTAMA' atau 'PENDUKUNG' |
| vehicle_type | VARCHAR(50) | | e.g., 'FOAM_TENDER', 'AMBULANCE' |
| license_plate | VARCHAR(50) | | Nomor Polisi (jika ada) |
| status | VARCHAR(50) | DEFAULT 'READY'| READY, MAINTENANCE, OUT_OF_SERVICE |
| specifications| JSONB | | Menyimpan atribut spesifik (Kapasitas air/medis) |

### 5.7. Table: `checklist_templates` (Master Data Ceklis)
| Kolom | Tipe Data | Constraint | Keterangan |
|-------|-----------|------------|------------|
| id | UUID | PRIMARY KEY | |
| target_type | VARCHAR(50) | | e.g., 'VEHICLE', 'APAR', 'FIREHOSE' |
| name | VARCHAR(255)| | e.g., 'Cek Harian Foam Tender', 'Cek APAR Bulanan' |

### 5.8. Table: `checklist_items` (Butir Ceklis)
| Kolom | Tipe Data | Constraint | Keterangan |
|-------|-----------|------------|------------|
| id | UUID | PRIMARY KEY | |
| template_id | UUID | FK -> checklist_templates(id)| |
| category | VARCHAR(100)| | e.g., 'Engine' (Mobil), 'Fisik' (APAR) |
| description | VARCHAR(255)| | e.g., 'Cek Level Oli', 'Cek Tekanan APAR' |
| is_critical | BOOLEAN | DEFAULT FALSE | Jika gagal, aset tidak bisa dipakai |

### 5.9. Table: `inspections` (Header Laporan Inspeksi)
| Kolom | Tipe Data | Constraint | Keterangan |
|-------|-----------|------------|------------|
| id | UUID | PRIMARY KEY | |
| target_type | VARCHAR(50) | NOT NULL | 'VEHICLE' atau 'EQUIPMENT' (Polymorphic) |
| target_id | UUID | NOT NULL | ID Kendaraan atau ID APAR yang dicek |
| inspector_id | UUID | FK -> personnels(id)| Personel yang mengecek |
| template_id | UUID | FK -> checklist_templates(id)| Template yang dipakai |
| result | VARCHAR(20) | NOT NULL | PASSED, FAILED, WARNING |
| notes | TEXT | | Catatan temuan umum |
| inspected_at | TIMESTAMPTZ | DEFAULT NOW()| Waktu inspeksi selesai |

### 5.10. Table: `inspection_results` (Detail Hasil Ceklis)
| Kolom | Tipe Data | Constraint | Keterangan |
|-------|-----------|------------|------------|
| id | UUID | PRIMARY KEY | |
| inspection_id | UUID | FK -> inspections(id)| Laporan header-nya |
| item_id | UUID | FK -> checklist_items(id)| Butir yang dicek |
| is_ok | BOOLEAN | NOT NULL | Lulus / Tidak Lulus |
| actual_value | VARCHAR(255)| | Nilai aktual (misal tekanan bar) |
| notes | TEXT | | Catatan spesifik jika rusak |

### 5.11. Table: `digital_signatures` (Verifikasi QR Code Tanda Tangan)
| Kolom | Tipe Data | Constraint | Keterangan |
|-------|-----------|------------|------------|
| id | UUID | PRIMARY KEY | Ini yang di-embed ke dalam QR Code |
| document_type | VARCHAR(50) | NOT NULL | e.g., 'INSPECTION_REPORT', 'MAINTENANCE_LOG' |
| reference_id | UUID | NOT NULL | ID dari tabel dokumen aslinya |
| signer_id | UUID | FK -> users(id) | Siapa yang menandatangani secara digital |
| signature_hash| VARCHAR(255)| NOT NULL | Hash Kriptografi dari isi dokumen (Buktikan keaslian) |
| signed_at | TIMESTAMPTZ | DEFAULT NOW()| Kapan dokumen ditandatangani |

### 5.12. Table: `audit_logs` (Cybersecurity Requirement)
| Kolom | Tipe Data | Constraint | Keterangan |
|-------|-----------|------------|------------|
| id | UUID | PRIMARY KEY | |
| actor_id | UUID | FK -> users(id) | Siapa yang melakukan |
| action | VARCHAR(50) | NOT NULL | e.g., 'UPDATE_VEHICLE_STATUS' |
| entity_type | VARCHAR(50) | NOT NULL | e.g., 'vehicles' |
| entity_id | UUID | NOT NULL | ID data yang diubah |
| ip_address | VARCHAR(50) | | IP Address asal request |
| timestamp | TIMESTAMPTZ | DEFAULT NOW()| |

---

## 6. Standar Keamanan & Performance (Cybersecurity Note)
1. **Password Encryption**: Rust wajib mem-parsing password dengan algoritma **Argon2id**.
2. **Audit Logging**: Semua request berjenis `POST`, `PUT`, `DELETE`, dan `PATCH` wajib tercatat di dalam `audit_logs`. Endpoint GET tidak perlu (terkecuali untuk data super sensitif).
3. **Database Pagination**: Endpoint GET List (seperti `/v1/inspections`) wajib mendukung `?page=1&limit=20` agar tidak membebani memori (FlatList Optimization di React Native).
4. **Soft Delete**: Data kritikal tidak diizinkan menggunakan perintah SQL `DELETE`. Gunakan kolom `deleted_at TIMESTAMPTZ` (*Soft Delete*).
5. **Digital Signature**: `signature_hash` menggunakan SHA-256 berisikan data gabungan: `document_type + reference_id + signer_id + isi_laporan`. Jika ada perbedaan 1 karakter pun saat di-verify, QR code dianggap tidak valid / dokumen palsu.

---

## 7. Asset QR Inspection System (Context-Aware Routing)

Fitur ini memungkinkan _QR Scanner_ di halaman depan (atau di dalam aplikasi) untuk memiliki fungsi ganda: memindai dokumen digital **ATAU** memindai stiker QR pada aset fisik (Kendaraan, APAR, Hose Reel) untuk memulai inspeksi.

### 7.1. Alur Kerja (Workflow)
1. **Pemindaian**: Pengguna memindai QR Code fisik di lapangan (misal: stiker di APAR tabung #01).
2. **Session Resumption**: Aplikasi membaca payload QR. Jika tipe QR adalah `ASSET`, aplikasi mengecek *SecureStore*. Karena pengguna sudah mencentang "Ingat Saya" dan token masih valid, aplikasi **mem-bypass login**.
3. **Deep Routing**: Aplikasi otomatis diarahkan (langsung lompat) ke halaman `InspectionFormScreen` khusus untuk aset tersebut. (Jika belum login, diarahkan ke Login dahulu, lalu *auto-redirect* setelah login sukses).
4. **Data Retrieval**: Aplikasi menembak API `GET /v1/assets/{id}/inspection-context` untuk mengambil data aset dan daftar ceklisnya.
5. **Submit**: Pengguna mengisi form dan menyimpannya lewat API `POST /v1/inspections`.

### 7.2. API Endpoints

| Method | Endpoint | Deskripsi | Akses Role |
|--------|----------|-----------|------------|
| GET | `/v1/assets/resolve/{qr_payload_id}` | Mengecek apakah QR ini milik Dokumen atau Aset (APAR/Kendaraan) | Authenticated / Public |
| GET | `/v1/assets/{asset_id}/inspection-context`| Mengambil info aset & *Checklist Template* yang sesuai untuk dirender di UI | Staff, Inspector |

Dengan sistem ini, satu _QR Scanner_ dapat menjadi gerbang universal untuk berbagai aksi operasional yang responsif terhadap *Session* pengguna.
