/** The production handoff shapes selected by issue #144. */
export type Post = {
  id: number;
  karyaId: number;
  authorId: number;
  author: string;
  body: string;
  hoursAgo: number;
};

export type Comment = {
  id: number;
  postId: number;
  authorId: number;
  body: string;
  createdAt: string;
};

export const POSTS: Post[] = [
  { id: 1, karyaId: 1, authorId: 1, author: "Arief Maulana", body: "Beta terbuka udah live! Mahasiswa Telkom bisa daftar & lihat lowongan magang dari alumni. Makasih yang udah nyoba versi awal 🙏", hoursAgo: 5 },
  { id: 2, karyaId: 1, authorId: 2, author: "Siti Rahmah", body: "Rombak alur onboarding — sekarang cuma 2 langkah sebelum lihat lowongan pertama. Data awal: drop-off turun jauh.", hoursAgo: 22 },
  { id: 3, karyaId: 1, authorId: 1, author: "Arief Maulana", body: "Lagi cari 1 orang yang kuat di data scraping buat sinkronisasi lowongan otomatis. Kalau tertarik, colek ya.", hoursAgo: 50 },
];

export const COMMENT_AUTHORS: Record<number, string> = {
  4: "Dian Pertiwi",
  5: "Eko Saputra",
  99: "Zaki Nadhif",
};

export const COMMENTS: Comment[] = [
  { id: 1, postId: 1, authorId: 4, body: "Baru coba versi beta-nya. Filter lokasi sudah enak — berikutnya ada rencana tambah pilihan remote?", createdAt: "2 menit lalu" },
  { id: 2, postId: 1, authorId: 5, body: "Alur lamarannya jauh lebih jelas sekarang. Di layar kecil tombol simpan lowongan sempat kelewat, mungkin bisa dibuat lebih menonjol.", createdAt: "8 menit lalu" },
  { id: 3, postId: 1, authorId: 99, body: "Aku juga sempat kelewat. Mungkin posisi tombolnya bisa tetap terlihat saat daftar digulir.", createdAt: "baru saja" },
];
