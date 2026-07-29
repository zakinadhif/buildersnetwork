"""Membangun panduan kontributor mockup sebagai .docx.

Untuk desainer dan kontributor ringan: tanpa database, tanpa Docker, tanpa API key
— cukup galeri mockup-nya saja. File .docx-nya adalah artefak build; edit script
ini, bukan file Word-nya. Edisi bahasa Inggrisnya build-mockups-guide-en.py —
jaga keduanya tetap sejalan.

    pip install python-docx
    python docs/build-mockups-guide-id.py   # -> docs/panduan-memulai-mockup.docx
"""

from pathlib import Path

from _docx_kit import NOTE_BG, WARN_BG, new_doc

doc, k = new_doc()

k.title(
    "Al-Fath Berkarya",
    "Ikut menggarap mockup — panduan untuk desainer",
    "Diverifikasi end-to-end pada clone yang bersih — 14 Juli 2026.\n"
    "Kamu butuh Node, pnpm, dan Git. Kamu TIDAK butuh Docker, database, atau API key apa pun.",
)

k.para(
    "Galeri mockup adalah tempat tampilan Al-Fath Berkarya dirancang. Bentuknya aplikasi statis "
    "yang berdiri sendiri: layar-layar React berisi data palsu, tanpa backend sama sekali. Itu "
    "membuatnya jadi bagian project yang paling mudah untuk dibantu — sekaligus salah satu yang "
    "paling berharga, karena mockup inilah acuan utama yang dipakai saat membangun aplikasi "
    "aslinya."
)
k.para(
    "Panduan ini membawa kamu dari belum meng-install apa pun sampai galeri berjalan di komputermu, "
    "lalu sampai perubahan pertamamu masuk ke sebuah pull request. Ini memang sengaja dibuat "
    "sebagai jalur singkat: semua yang menjadi bagian aplikasi penuh — database, Docker, API key, "
    "code generation — boleh kamu lewati sepenuhnya."
)

k.callout(
    "Yang kamu install cuma sebagian kecil dari project ini.",
    "Aplikasi penuh menarik 923 package, sebagian di antaranya mengompilasi kode native dan berat "
    "dijalankan di perangkat kelas bawah. Galeri hanya butuh 67 package, dan tidak ada satu pun "
    "yang perlu dikompilasi. Perintah install di Bagian 3 yang menjaga hal itu — dan perintahnya "
    "berbeda dari yang ada di README.",
)

# =============================================================================
doc.add_heading("1. Yang kamu butuhkan", level=1)

k.para("Tiga tools. Cuma itu.")

k.table(
    ["Tools", "Versi", "Buat apa"],
    [
        ["Node.js", "24 atau lebih baru", "Menjalankan dev server"],
        ["pnpm", "10 atau lebih baru", "Meng-install package — npm dan yarn tidak akan jalan"],
        ["Git", "versi terbaru mana pun", "Mengambil kode, dan mengirim balik perubahanmu"],
    ],
    widths=[1.5, 1.7, 3.3],
)

k.para(
    "Yang tidak dibutuhkan: Docker, database, API key, atau layanan berbayar apa pun. Kalau ada "
    "langkah yang meminta salah satunya, berarti kamu sedang mengikuti panduan yang keliru — yang "
    "itu docs/panduan-memulai.docx, untuk orang yang menggarap aplikasi penuh.",
    muted=True,
    size=9.5,
)

doc.add_heading("Node.js 24", level=2)
k.code(
    """
# Windows (PowerShell)
winget install CoreyButler.NVMforWindows
nvm install 24
nvm use 24

# macOS / Linux
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
nvm install 24
nvm use 24

# Cek hasilnya
node -v      # -> v24.x.x
"""
)
k.para(
    "Installer dari nodejs.org juga tidak masalah — pilih versi 24 LTS. Version manager di atas "
    "cuma lebih enak kalau kamu mengerjakan beberapa project sekaligus.",
    muted=True,
    size=9.5,
)

doc.add_heading("pnpm 10", level=2)
k.para(
    "Node 24 sudah membawa alat untuk meng-install pnpm, jadi cukup dua baris. Jangan diganti "
    "dengan npm atau yarn — project ini memakai pnpm workspace, dan yang lain akan menghasilkan "
    "install yang rusak."
)
k.code(
    """
corepack enable
corepack prepare pnpm@10.18.1 --activate

# Cek hasilnya
pnpm -v      # -> 10.x.x
"""
)

doc.add_heading("Git", level=2)
k.code(
    """
# Windows
winget install Git.Git

# macOS
brew install git

# Debian / Ubuntu
sudo apt install git
"""
)

# =============================================================================
doc.add_heading("2. Ambil kodenya", level=1)

k.para(
    "Kalau kamu punya akses tulis ke repository-nya, clone langsung. Kalau belum — atau kamu tidak "
    "yakin — fork dulu di GitHub lalu clone hasil fork-mu; berkontribusi lewat fork sepenuhnya "
    "didukung, dan pull request-mu tetap mendapat preview yang bisa dibuka."
)
k.code(
    """
git clone https://github.com/zakinadhif/buildersnetwork.git
cd buildersnetwork
"""
)

# =============================================================================
doc.add_heading("3. Install — versi kecilnya", level=1)

k.para("Inilah satu-satunya perintah di panduan ini yang wajib kamu tulis dengan benar.")
k.code(
    """
pnpm install --filter mockups...
"""
)

k.callout(
    "Perhatikan tiga titiknya.",
    "`--filter mockups...` berarti \"aplikasi mockups beserta yang dibutuhkannya\" — tidak lebih. "
    "Tiga titik di belakang itu bagian dari sintaksnya, bukan tanda baca dalam kalimat ini. Kalau "
    "kamu menjalankan `pnpm install` biasa, seluruh project akan ter-install: API, driver database, "
    "pemroses gambar, runtime Cloudflare. Tetap jalan, tapi jumlah package-nya sekitar 14x lipat "
    "dan ada kode native yang dikompilasi — persis yang ingin kamu hindari di laptop sederhana.",
    WARN_BG,
)

k.table(
    ["", "`pnpm install --filter mockups...`", "`pnpm install`"],
    [
        ["Jumlah package", "67", "923"],
        ["Mengompilasi kode native", "Tidak", "Ya — better-sqlite3, sharp, workerd"],
        ["Cukup untuk menjalankan galeri", "Ya", "Ya"],
    ],
    widths=[1.7, 2.5, 2.3],
)

k.para(
    "Kalau suatu saat kamu memang butuh aplikasi penuh, tinggal jalankan `pnpm install` biasa saat "
    "itu — tidak ada satu pun langkah di sini yang perlu dibatalkan.",
    muted=True,
    size=9.5,
)

# =============================================================================
doc.add_heading("4. Jalankan galerinya", level=1)

k.code(
    """
pnpm dev:mockups
"""
)
k.para(
    "Buka http://localhost:5173. Selesai — tidak ada file environment yang perlu diisi, tidak ada "
    "database yang perlu dibuat, tidak ada terminal kedua yang perlu dijalankan. Galerinya siap "
    "dalam waktu kurang dari satu detik dan langsung memuat ulang begitu kamu menyimpan file."
)

k.callout(
    "Seharusnya langsung jalan.",
    "Kalau halamannya terbuka dan kamu bisa melihat layar Launchpad beserta kartu, avatar, dan "
    "pengganti font-nya, berarti setup-mu sudah lengkap dan benar. Tidak ada langkah verifikasi "
    "lanjutan — galeri ini tidak punya backend yang bisa salah konfigurasi.",
)

# =============================================================================
doc.add_heading("5. Isi foldernya", level=1)

k.para(
    "Semuanya ada di apps/mockups/src. Hampir seluruh waktumu akan dihabiskan di dua tempat: "
    "screens/ dan lib/tokens.ts."
)

k.table(
    ["Path", "Isinya"],
    [
        [
            "`screens/`",
            "Satu file untuk tiap layar mockup — `Launchpad.tsx`, `Jelajahi.tsx`, `cari/`. Di "
            "sinilah tata letak dan susunan tiap layar berada. Mulailah dari sini.",
        ],
        [
            "`lib/tokens.ts`",
            "Token desain — warna, skala tipografi, spasi — dalam satu objek bernama `T`. **Inilah "
            "satu-satunya sumber design system.** Ubah satu warna di sini, dan semua layar ikut "
            "berubah.",
        ],
        [
            "`components/`",
            "Kerangka bersama yang dipakai ulang setiap layar: `Shell`, `LeftNav`, `Avatar`, `Tag`.",
        ],
        [
            "`data/`",
            "Konten palsu yang ditampilkan tiap layar — karya, member, ajakan. Semuanya karangan, "
            "bukan dari database. Bebas kamu ubah.",
        ],
        [
            "`gallery/`",
            "Perkakas internal galeri: daftar layar yang ada, dan pengganti font. Jarang perlu "
            "kamu sentuh.",
        ],
    ],
    widths=[1.5, 5.0],
)

k.callout(
    "Rancang lewat token, bukan langsung di layarnya.",
    "Kalau kamu mendapati dirimu menulis kode warna atau ukuran piksel langsung di dalam sebuah "
    "layar, berhenti dulu — tempatnya di `lib/tokens.ts` sebagai token, supaya seluruh galeri tetap "
    "konsisten dengannya. Nilai dadakan yang cuma dipakai di satu layar adalah cara sebuah design "
    "system mati pelan-pelan.",
)

# =============================================================================
doc.add_heading("6. Coba ubah sesuatu", level=1)

k.para(
    "Cobalah perubahan sekecil mungkin dulu, untuk membuktikan alurnya benar-benar jalan. Buka "
    "apps/mockups/src/lib/tokens.ts, ubah warna `accent`, lalu simpan. Semua layar di galeri akan "
    "langsung berganti warna. Setelah itu kembalikan seperti semula."
)
k.para(
    "Selanjutnya alurnya cuma begitu saja: edit file, lihat browser, ulangi. Tidak ada yang perlu "
    "di-restart, tidak ada yang perlu di-build ulang."
)

doc.add_heading("Sebelum membuka pull request", level=2)
k.para("Dua perintah. Keduanya jalan dengan install versi kecil tadi.")
k.code(
    """
pnpm lint                     # format + gaya penulisan kode (Biome)
pnpm --filter mockups build   # cek tipe + build — menangkap import yang rusak
"""
)
k.para(
    "Kalau lint mengeluh soal format, `pnpm lint:fix` akan membereskan sebagian besarnya "
    "untukmu.",
    muted=True,
    size=9.5,
)

doc.add_heading("Mengirimkannya", level=2)
k.code(
    """
git checkout -b desain/nama-perubahanmu
git add .
git commit -m "desain: ringkasan singkat perubahanmu"
git push -u origin desain/nama-perubahanmu
"""
)
k.para(
    "Lalu buka pull request di GitHub. Setiap PR yang menyentuh apps/mockups otomatis mendapat URL "
    "preview-nya sendiri yang langsung bisa dibuka — termasuk PR dari fork — sehingga reviewer bisa "
    "mengklik perubahanmu, bukan cuma membayangkannya dari diff."
)

# =============================================================================
doc.add_heading("7. Kalau ada yang bermasalah", level=1)

k.table(
    ["Gejala", "Solusi"],
    [
        [
            "`pnpm: command not found`",
            "Langkah Corepack belum berhasil. Jalankan `corepack enable` lagi, lalu buka terminal "
            "baru.",
        ],
        [
            "Install-nya besar sekali, lambat, atau gagal saat mengompilasi sesuatu",
            "Kemungkinan besar kamu menjalankan `pnpm install` biasa. Pakai "
            "`pnpm install --filter mockups...` — perhatikan tiga titiknya.",
        ],
        [
            "`Port 5173 is already in use`",
            "Ada hal lain yang memakai port itu — sering kali dev server aplikasi utama. Tutup "
            "dulu, atau biarkan Vite memakai port berikutnya saat ditawarkan.",
        ],
        [
            "Halaman kosong, atau muncul error import di terminal",
            "Biasanya salah ketik di file yang baru saja kamu edit. Terminal yang menjalankan "
            "`pnpm dev:mockups` menampilkan nama file dan barisnya.",
        ],
        [
            "Browser masih menampilkan versi lama",
            "Reload paksa (Ctrl+Shift+R / Cmd+Shift+R) biasanya cukup.",
        ],
    ],
    widths=[2.5, 4.0],
)

# =============================================================================
doc.add_heading("8. Langkah selanjutnya", level=1)

k.bullet(
    "galeri versi live, selalu mengikuti main. Berguna untuk melihat apa yang sudah ada sebelum "
    "kamu merancang sesuatu yang baru.",
    bold_lead="mockups.buildersnetwork.web.id — ",
)
k.bullet(
    "cara kerja preview dan deploy mockup, kalau kamu penasaran apa yang terjadi setelah PR-mu "
    "dibuka.",
    bold_lead="plans/how-to/mockup-gallery.md — ",
)
k.bullet(
    "proses desain yang dilayani mockup ini — bagaimana beberapa arah visual dieksplorasi "
    "berbarengan lalu satu dipilih.",
    bold_lead="plans/how-to/parallel-ui-exploration.md — ",
)
k.bullet(
    "setup aplikasi penuh, untuk saat kamu ingin menggarap aplikasi aslinya. Tidak ada isi panduan "
    "ini yang bertentangan dengannya.",
    bold_lead="docs/panduan-memulai.docx — ",
)

k.para(
    "Semua copy UI di project ini memakai Bahasa Indonesia kasual — tulis seperti kamu "
    "mengucapkannya, bukan seperti bank menulis pengumuman."
)

out = Path(__file__).resolve().parent / "panduan-memulai-mockup.docx"
doc.save(out)
print(f"saved -> {out}")
