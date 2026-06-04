Sistem HAIS dibangun dengan arsitektur **Monolit Modular** menggunakan React Native untuk memastikan isolasi antar domain bisnis tetap bersih, kokoh, dan mudah dipelihara ( *maintainable* ):

* **🔑 Accounts (Identitas & Akses - RBAC)**

  * Registrasi modern dengan pembatasan domain email `@gmail.com` dan `@yahoo.com`.
  * Autentikasi aman berbasis **OTP (One-Time Password)** untuk pemulihan kata sandi.
  * Manajemen hak akses berbasis peran (RBAC - Role-Based Access Control) terpusat.
  * **📅 Operations (Shift & Penjadwalan)*** Penjadwalan dinamis harian per regu ( *squad* ), plotting operasional, dan pemantauan armada dinas.
  * **👤 Personnel (Inti HR & Kompetensi)*** Sumber data tunggal ( *single source of truth* ) personel ARFF, riwayat penugasan, dan pangkat/posisi jabatan.
* **📜 Certifications (Kepatuhan Lisensi)**

  * Pelacakan masa berlaku lisensi personel ARFF dan *automatic trigger notification* sebelum masa aktif habis.
* **🧯 Fire Protection Assets (Sistem Proteksi Kebakaran)**

  * Sistem inspeksi harian armada APAR dan Hosereel berbasis pemindaian QR Code (hash verifikatif).
  * Pelaporan status kondisi fisik, tekanan, selang, dan riwayat inspektur.
* **🛡️ Audit Log (Jejak Aktivitas)**

  * Pencatatan riwayat perubahan data ( *created, updated, deleted* ) secara otomatis di seluruh sistem untuk kepatuhan ICAO.
