# Product Copy — Al-Fath Berkarya

All visible text across every screen, including buttons, labels, placeholders, error messages, AI messages, and email copy.

---

## Welcome Screen (`/welcome`)

### Sign Up Mode
- **Heading:** Kamu masuk.
- **Subheading:** Orang-orang di sini lagi ngerjain sesuatu yang nyata. Kenalan dulu.
- **Email placeholder:** email
- **Password placeholder:** password
- **Button (loading):** …
- **Button (ready):** Mulai →
- **Toggle link:** sudah anggota? masuk ↗
- **Error (wrong email domain):** Gunakan email student Telkom (@student.telkomuniversity.ac.id).
- **Error (fallback):** Gagal daftar

### Sign In Mode
- **Heading:** Selamat datang kembali.
- **Email placeholder:** email
- **Password placeholder:** password
- **Button (loading):** …
- **Button (ready):** Masuk →
- **Toggle link:** belum anggota? daftar ↗
- **Error (fallback):** Gagal masuk

---

## Login Screen (`/login`)

- **Heading:** Sign in
- **Subheading:** Enter your credentials to continue
- **Email label:** Email
- **Email placeholder:** you@example.com
- **Password label:** Password
- **Password placeholder:** ••••••••
- **Button (loading):** Signing in...
- **Button (ready):** Sign in
- **Error (fallback):** Sign in failed

---

## Verify Email Screen (`/verify-email`)

- **Header:** Al-Fath Berkarya
- **Heading:** Cek email kamu.
- **Status (sent):** Kode 6 digit dikirim ke {email}.
- **Status (sending):** Mengirim kode ke {email}…
- **Input placeholder:** 123456
- **Button (loading):** …
- **Button (ready):** Verifikasi →
- **Resend (active):** Tidak menerima kode? kirim ulang ↗
- **Resend (cooldown):** Tidak menerima kode? kirim ulang dalam {n}s
- **Error:** Gagal mengirim kode.
- **Error:** Kode tidak valid.
- **Error:** Kode tidak valid atau sudah kedaluwarsa.
- **Error:** Kode salah.

---

## Onboarding Screen (`/onboarding`)

- **Header:** Al-Fath Berkarya · onboarding
- **Input placeholder:** balas…
- **Send button:** ↑
- **Loading state:** lagi nyusun profil kamu
- **Error message:** ada yang error — coba lagi?

### AI First Message
> hei — selamat datang di al-fath berkarya. aku mau kenalan dulu — abis itu kita nyusun profil kamu bareng.
>
> siapa nama kamu?

### AI System Prompt (instructions to the AI, not shown to user)
> Kamu adalah AI onboarding untuk Al-Fath Berkarya — komunitas builder eksklusif mahasiswa teknik informatika di Telkom University, Indonesia.
>
> Lakukan intake percakapan yang santai dan hangat untuk membangun profil anggota baru. Cakup: nama, tingkat/jurusan, skill teknis (probe lebih dalam — tanya apa yang pernah mereka bikin, bukan cuma yang mereka tahu), hal yang pernah dibangun, apa yang mau mereka bangun/pelajari, project sekarang, gaya kolaborasi.
>
> Aturan:
> - SATU pertanyaan per pesan. Jangan tumpuk pertanyaan.
> - Santai, langsung, akrab. Maksimal 1-2 kalimat. Pakai "kamu/aku", bukan "Anda/saya". Semua lowercase kecuali nama orang/tempat.
> - Kalau jawabannya terlalu umum, tanya satu follow-up yang spesifik.
> - Setelah 8-10 pertukaran yang sudah mencakup semua area, akhiri pesanmu dengan tepat: "oke, biar aku susun profil kamu sekarang."
> - JANGAN bilang "oke, biar aku susun profil kamu sekarang" sebelum semua area tercakup.

### AI Sign-off (end of onboarding chat)
> oke, biar aku susun profil kamu sekarang.

---

## Review Screen (`/review`)

- **Header:** Al-Fath Berkarya
- **Heading:** Ini yang aku tangkap.
- **Subheading:** Kalau ada yang meleset, ketuk langsung.
- **Field — Name:** Nama
- **Field — Year & Major:** Angkatan · Jurusan
- **Field — Skills:** Skills
- **Field — Building:** Lagi bikin
- **Field — Wants:** Pengen belajar / bikin
- **Field — Work style:** Gaya kerja
- **Empty field placeholder:** ketuk buat edit
- **Skill input placeholder:** + tambah skill
- **Skill remove button:** ×
- **Loading state:** lagi nyariin orang-orangnya
- **Publish button:** Publish profil →

---

## Matches Screen (`/matches`)

- **Header:** Al-Fath Berkarya
- **Welcome message:** Dipublish. Selamat datang, {firstName}.
- **Heading:** Tiga orang yang kayaknya perlu kamu kenal.
- **Empty state:** Belum ada yang cocok sekarang — explore komunitas di bawah.
- **Match card — profile link:** Lihat profil →
- **Bottom CTA button:** Ke komunitas →

---

## Community Home Screen (`/home`)

- **Header:** Al-Fath Berkarya
- **AI greeting:** hei {firstName} — lagi nyari siapa? tanya aja soal komunitas ini.
- **Input placeholder:** siapa yang lagi kerja di ML? ada yang jago backend?
- **Send button:** ↑
- **Section header:** Anggota ({count})
- **Error message:** ada yang error — coba lagi?

### AI System Prompt (instructions to the AI, not shown to user)
> Kamu adalah AI discovery untuk komunitas builder Al-Fath Berkarya.
>
> Direktori anggota:
> {dynamic member directory}
>
> Pertanyaan: "{user input}"
>
> Jawab dengan bahasa Indonesia kasual dan langsung. Sebutkan maksimal 3 anggota yang relevan beserta nama dan 1-2 kalimat kenapa mereka cocok. Kalau ga ada yang cocok, bilang aja terus terang. Singkat padat.

---

## Member Profile Screen (`/member/:id`)

- **Back button:** ← balik
- **Section label — Skills:** Skills
- **Section label — Building:** Lagi bikin
- **Section label — Wants:** Pengen
- **Section label — Work style:** Vibe
- **Not found message:** anggota tidak ditemukan.

---

## 404 Screen

- **Heading:** 404
- **Message:** Page not found
- **Button:** Go home

---

## Email — Verification Code

- **From:** Al-Fath Berkarya \<noreply@buildersnetwork.web.id\>
- **Subject:** Kode verifikasi kamu
- **Body:**
  > Kode OTP kamu: **{code}**
  >
  > Berlaku 10 menit. Jangan bagikan kode ini ke siapa pun.

---

## Seed Member Profiles (pre-loaded community)

These profiles are shown to new users from day one.

**Hafiz Maulana** · Tingkat 2 · Informatika
- Skills: Go, Rust, Systems Programming, Networking
- Lagi bikin: Tool sinkronisasi file peer-to-peer — ringan, offline-first, ga butuh cloud sama sekali.
- Pengen: Distributed systems, WebAssembly, desain protokol.
- Vibe: Kerja solo dulu, baru share. Full async. Mau pair kalau masalahnya beneran susah.

**Fatimah Zahra** · Tingkat 3 · Informatika
- Skills: Python, Machine Learning, FastAPI, scikit-learn
- Lagi bikin: Rekomendasi kuliner lokal berbasis ML — privacy-first, konteks Indonesia.
- Pengen: Deep learning, MLOps, inference pipeline yang scalable.
- Vibe: Suka pair di masalah yang susah. Butuh kolaborator yang bisa adu argumen teknis.

**Rizal Anwar** · Tingkat 4 · Rekayasa Perangkat Lunak
- Skills: React, TypeScript, Node.js, PostgreSQL
- Lagi bikin: Library autentikasi open source buat Next.js — pengen bikin auth jadi hal yang membosankan.
- Pengen: Systems programming, Rust, building in public.
- Vibe: Ship cepet, dokumentasi rapi. Full async dan transparan.

**Dinda Pratiwi** · Tingkat 2 · Informatika
- Skills: React, Figma, CSS, TypeScript
- Lagi bikin: App keuangan pribadi buat mahasiswa — fokus ke kejelasan pengeluaran, bukan optimasi.
- Pengen: Backend development, API, eventually full-stack.
- Vibe: Pemikir visual dengan opini UX yang kuat. Suka build bareng orang yang peduli sama craft.

**Arya Kusuma** · Tingkat 3 · Informatika
- Skills: Flutter, Firebase, Dart, Mobile
- Lagi bikin: Jadwal sholat dengan fitur komunitas spesifik masjid.
- Pengen: Arsitektur backend, cloud infrastructure, DevOps.
- Vibe: Lebih suka tim kecil yang solid. Ship dan iterasi cepet. Ga suka meeting yang ga perlu.
