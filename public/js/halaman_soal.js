// Variabel global untuk halaman kuis
let currentUser = null;
let currentQuizPackage = null;
let quizStartTime = null;
let quizAccessToken = null;

// Konstanta konfigurasi
const CONFIG = {
  TIMER_DURATION: 29 * 60 + 59, // 29:59 dalam detik
  SESSION_TIMEOUT: 2, // 2 jam
  NOTIFICATION_DURATION: 5000,
  REDIRECT_DELAY: 1000,
  PRINT_DELAY: 1000,
  QUESTIONS_PER_PAGE: 5,
  TOTAL_QUESTIONS: 20,
};

// Pola perhitungan skor untuk setiap pertanyaan
// Pertanyaan dengan pola Growth Mindset (skor rendah = growth mindset)
const pertanyaanGrowthMindset = [0, 3, 6, 7, 10, 11, 13, 15, 16, 19]; // index 0-based

// Pertanyaan dengan pola Fixed Mindset (skor tinggi = fixed mindset)
const pertanyaanFixedMindset = [1, 2, 4, 5, 8, 9, 12, 14, 17, 18]; // index 0-based

// Data kuis
const dataKuis = [
  {
    question:
      "Kemampuan Anda adalah sesuatu yang sangat mendasar yang tidak banyak dapat Anda ubah lagi.",
    options: ["Sangat Setuju", "Setuju", "Tidak Setuju", "Sangat Tidak Setuju"],
  },
  {
    question:
      "Tidak peduli seberapapun tingkat kemampuan Anda saat ini, Anda bisa mengubahnya walaupun sedikit.",
    options: ["Sangat Setuju", "Setuju", "Tidak Setuju", "Sangat Tidak Setuju"],
  },
  {
    question: "Anda akan selalu dapat mengubah kemampuan Anda.",
    options: ["Sangat Setuju", "Setuju", "Tidak Setuju", "Sangat Tidak Setuju"],
  },
  {
    question:
      "Anda adalah seseorang yang unik, tidak banyak yang dapat dilakukan untuk mengubahnya.",
    options: ["Sangat Setuju", "Setuju", "Tidak Setuju", "Sangat Tidak Setuju"],
  },
  {
    question: "Anda akan selalu dapat mengubah diri Anda sendiri.",
    options: ["Sangat Setuju", "Setuju", "Tidak Setuju", "Sangat Tidak Setuju"],
  },
  {
    question:
      "Kemampuan dalam bidang seni dan musik dapat dipelajari oleh siapapun.",
    options: ["Sangat Setuju", "Setuju", "Tidak Setuju", "Sangat Tidak Setuju"],
  },
  {
    question:
      "Hanya sedikit orang yang benar-benar mahir dalam olahraga, Anda harus membawa bakat itu sejak lahir.",
    options: ["Sangat Setuju", "Setuju", "Tidak Setuju", "Sangat Tidak Setuju"],
  },
  {
    question:
      "Matematika lebih mudah dipelajari oleh pria atau seseorang yang berada dalam lingkungan yang menyukainya.",
    options: ["Sangat Setuju", "Setuju", "Tidak Setuju", "Sangat Tidak Setuju"],
  },
  {
    question:
      "Makin keras Anda mengerjakan sesuatu makin mahir Anda dalam hal ini.",
    options: ["Sangat Setuju", "Setuju", "Tidak Setuju", "Sangat Tidak Setuju"],
  },
  {
    question:
      "Tidak peduli tipe apapun Anda saat ini, Anda akan selalu dapat mengubahnya.",
    options: ["Sangat Setuju", "Setuju", "Tidak Setuju", "Sangat Tidak Setuju"],
  },
  {
    question:
      "Mencoba sesuatu yang baru akan sangat menyulitkan Anda sehingga Anda ingin menghindarinya.",
    options: ["Sangat Setuju", "Setuju", "Tidak Setuju", "Sangat Tidak Setuju"],
  },
  {
    question:
      "Sebagian orang baik dan pintar, sebagian lagi tidak. Tidak banyak yang dapat berubah.",
    options: ["Sangat Setuju", "Setuju", "Tidak Setuju", "Sangat Tidak Setuju"],
  },
  {
    question:
      "Saya sangat menghargai kritik dan saran dari siapapun juga terkait dengan kinerja saya saat ini.",
    options: ["Sangat Setuju", "Setuju", "Tidak Setuju", "Sangat Tidak Setuju"],
  },
  {
    question: "Saya kurang senang bila ada kritik dan saran dari orang lain.",
    options: ["Sangat Setuju", "Setuju", "Tidak Setuju", "Sangat Tidak Setuju"],
  },
  {
    question:
      "Semua orang yang tanpa cacat-otak atau cacat-lahir memiliki kemampuan yang sama dalam belajar.",
    options: ["Sangat Setuju", "Setuju", "Tidak Setuju", "Sangat Tidak Setuju"],
  },
  {
    question:
      "Anda bisa mempelajari sesuatu yang baru, tapi Anda tidak bisa mengubah kemampuan Anda.",
    options: ["Sangat Setuju", "Setuju", "Tidak Setuju", "Sangat Tidak Setuju"],
  },
  {
    question:
      "Anda dapat melakukan sesuatu secara berbeda, tapi sebenarnya Anda tetap tidak dapat mengubah kemampuan Anda.",
    options: ["Sangat Setuju", "Setuju", "Tidak Setuju", "Sangat Tidak Setuju"],
  },
  {
    question:
      "Semua orang pada dasarnya baik, tapi kadang-kadang membuat keputusan yang salah.",
    options: ["Sangat Setuju", "Setuju", "Tidak Setuju", "Sangat Tidak Setuju"],
  },
  {
    question:
      "Alasan terpenting mengapa Anda melakukan pekerjaan Anda adalah keinginan untuk mempelajari sesuatu yang baru.",
    options: ["Sangat Setuju", "Setuju", "Tidak Setuju", "Sangat Tidak Setuju"],
  },
  {
    question: "Orang yang benar-benar cerdas, tidak perlu bekerja keras.",
    options: ["Sangat Setuju", "Setuju", "Tidak Setuju", "Sangat Tidak Setuju"],
  },
];

// Variabel state kuis
let indeksPertanyaanSaatIni = 0;
let jawabanPengguna = {};
let waktuTersisa = CONFIG.TIMER_DURATION;
let grupHalamanSaatIni = 0;
let intervalTimer;

// Inisialisasi halaman
document.addEventListener("DOMContentLoaded", async () => {
  await cekAutentikasiDanAksesKuis();
  inisialisasiMenuMobile();
  inisialisasiKuis();
  inisialisasiFungsiCetak();
});

// Inisialisasi fungsi tombol cetak
function inisialisasiFungsiCetak() {
  const tombolCetak = document.getElementById("printBtn");
  if (tombolCetak) {
    tombolCetak.addEventListener("click", cetakHasil);
  }
}

// Cek autentikasi dan akses kuis
async function cekAutentikasiDanAksesKuis() {
  try {
    // Cek autentikasi terlebih dahulu
    const response = await fetch("/api/auth/check", {
      method: "GET",
      credentials: "include",
    });

    if (response.ok) {
      const data = await response.json();
      currentUser = data.user;
      perbaruiInfoPengguna();
    } else {
      // Pengguna belum login, arahkan ke halaman login
      window.location.href = "/login?redirect=halaman_pemetaan";
      return;
    }

    // Cek akses kuis - harus berasal dari halaman_pemetaan
    currentQuizPackage = sessionStorage.getItem("currentQuizPackage");
    quizStartTime = sessionStorage.getItem("quizStartTime");
    quizAccessToken = sessionStorage.getItem("quizAccessToken");

    if (!currentQuizPackage || !quizStartTime || !quizAccessToken) {
      // Tidak ada sesi kuis yang valid, arahkan kembali ke halaman_pemetaan
      tampilkanNotifikasi(
        "Akses tidak valid. Silakan mulai dari halaman pemetaan.",
        "error"
      );
      setTimeout(() => {
        window.location.href = "./halaman_pemetaan.html";
      }, 2000);
      return;
    }

    // Cek apakah sesi kuis masih valid (tidak lebih dari 2 jam)
    const waktuMulai = new Date(quizStartTime);
    const waktuSekarang = new Date();
    const selisihWaktu = (waktuSekarang - waktuMulai) / (1000 * 60 * 60); // dalam jam

    if (selisihWaktu > CONFIG.SESSION_TIMEOUT) {
      // Sesi kuis sudah berakhir
      hapusSesiKuis();
      tampilkanNotifikasi(
        "Sesi kuis telah berakhir. Silakan mulai ulang.",
        "error"
      );
      setTimeout(() => {
        window.location.href = "./halaman_pemetaan.html";
      }, 2000);
      return;
    }

    console.log(`Kuis dimulai: ${currentQuizPackage} pada ${quizStartTime}`);
  } catch (error) {
    console.error("Kesalahan saat mengecek autentikasi dan akses kuis:", error);
    window.location.href = "/login?redirect=halaman_pemetaan";
  }
}

// Perbarui informasi pengguna di navbar
function perbaruiInfoPengguna() {
  const elemenNamaPengguna = document.getElementById("user-name");
  const elemenNamaPenggunaMobile = document.getElementById("user-name-mobile");

  if (currentUser && currentUser.name) {
    if (elemenNamaPengguna) {
      elemenNamaPengguna.textContent = currentUser.name;
    }
    if (elemenNamaPenggunaMobile) {
      elemenNamaPenggunaMobile.textContent = currentUser.name;
    }
  }
}

// Inisialisasi menu mobile
function inisialisasiMenuMobile() {
  const tombolMenuMobile = document.getElementById("mobile-menu-btn");
  const menuMobile = document.getElementById("mobile-menu");
  let statusMenuTerbuka = false;

  if (tombolMenuMobile && menuMobile) {
    tombolMenuMobile.addEventListener("click", () => {
      statusMenuTerbuka = !statusMenuTerbuka;

      if (statusMenuTerbuka) {
        menuMobile.classList.add("active");
      } else {
        menuMobile.classList.remove("active");
      }
    });

    // Tutup menu mobile saat klik di luar area
    document.addEventListener("click", (event) => {
      const targetKlik = event.target;
      const klikDiLuarMenu =
        !menuMobile.contains(targetKlik) &&
        !tombolMenuMobile.contains(targetKlik);

      if (klikDiLuarMenu && statusMenuTerbuka) {
        statusMenuTerbuka = false;
        menuMobile.classList.remove("active");
      }
    });
  }
}

// Inisialisasi kuis
function inisialisasiKuis() {
  // Mulai timer
  intervalTimer = setInterval(perbaruiTimer, 1000);
  perbaruiGrupHalamanSaatIni();
  perbaruiPertanyaan();
  perbaruiPaginasi();
  perbaruiProgress();
}

// Fungsi timer
function perbaruiTimer() {
  const menit = Math.floor(waktuTersisa / 60);
  const detik = waktuTersisa % 60;
  const elemenTimer = document.getElementById("timer");

  if (elemenTimer) {
    elemenTimer.textContent = `${menit.toString().padStart(2, "0")}:${detik
      .toString()
      .padStart(2, "0")}`;
  }

  if (waktuTersisa > 0) {
    waktuTersisa--;
  } else {
    clearInterval(intervalTimer);
    tampilkanHasil();
  }
}

// Perbarui indikator progress
function perbaruiProgress() {
  const jumlahTerjawab = Object.keys(jawabanPengguna).length;
  const totalPertanyaan = dataKuis.length;
  const persentase = (jumlahTerjawab / totalPertanyaan) * 100;

  const elemenTeksProgress = document.getElementById("progressText");
  const elemenBarProgress = document.getElementById("progressBar");

  if (elemenTeksProgress) {
    elemenTeksProgress.textContent = `${jumlahTerjawab}/${totalPertanyaan} Terjawab`;
  }
  if (elemenBarProgress) {
    elemenBarProgress.style.width = `${persentase}%`;
  }
}

// Cek apakah semua pertanyaan sudah dijawab
function apakahSemuaPertanyaanTerjawab() {
  return Object.keys(jawabanPengguna).length === dataKuis.length;
}

// Perbarui status tombol selanjutnya
function perbaruiStatusTombolSelanjutnya() {
  const tombolSelanjutnya = document.getElementById("nextBtn");
  const peringatanPenyelesaian = document.getElementById("completionWarning");

  if (indeksPertanyaanSaatIni === 19) {
    // Pertanyaan terakhir
    const semuaTerjawab = apakahSemuaPertanyaanTerjawab();

    if (semuaTerjawab) {
      tombolSelanjutnya.disabled = false;
      tombolSelanjutnya.className =
        "bg-bbgtk-blue hover:bg-blue-700 text-white px-6 sm:px-8 py-2 rounded-full font-medium transition-colors order-3";
      tombolSelanjutnya.textContent = "Selesai";
      peringatanPenyelesaian.classList.add("hidden");
    } else {
      tombolSelanjutnya.disabled = true;
      tombolSelanjutnya.className =
        "bg-gray-400 text-gray-600 px-6 sm:px-8 py-2 rounded-full font-medium cursor-not-allowed order-3";
      tombolSelanjutnya.textContent = "Selesai";

      // Tampilkan peringatan dan perbarui jumlah yang tersisa
      const jumlahTersisa =
        dataKuis.length - Object.keys(jawabanPengguna).length;
      const elemenSisaPertanyaan =
        document.getElementById("remainingQuestions");
      if (elemenSisaPertanyaan) {
        elemenSisaPertanyaan.textContent = jumlahTersisa;
      }
      peringatanPenyelesaian.classList.remove("hidden");
    }
  } else {
    tombolSelanjutnya.disabled = false;
    tombolSelanjutnya.className =
      "bg-bbgtk-blue hover:bg-blue-700 text-white px-6 sm:px-8 py-2 rounded-full font-medium transition-colors order-3";
    tombolSelanjutnya.textContent = "Lanjut";
    peringatanPenyelesaian.classList.add("hidden");
  }
}

// Perbarui tampilan pertanyaan
function perbaruiPertanyaan() {
  const pertanyaan = dataKuis[indeksPertanyaanSaatIni];
  const elemenPertanyaanSaatIni = document.getElementById("currentQuestion");
  const elemenTeksPertanyaan = document.getElementById("questionText");

  if (elemenPertanyaanSaatIni) {
    elemenPertanyaanSaatIni.textContent = indeksPertanyaanSaatIni + 1;
  }
  if (elemenTeksPertanyaan) {
    elemenTeksPertanyaan.textContent = pertanyaan.question;
  }

  // Perbarui visibilitas tombol sebelumnya
  const tombolSebelumnya = document.getElementById("prevBtn");
  if (tombolSebelumnya) {
    tombolSebelumnya.style.visibility =
      indeksPertanyaanSaatIni === 0 ? "hidden" : "visible";
  }

  // Perbarui status tombol selanjutnya
  perbaruiStatusTombolSelanjutnya();

  const containerPilihan = document.getElementById("answerOptions");
  if (containerPilihan) {
    containerPilihan.innerHTML = "";

    pertanyaan.options.forEach((pilihan, indeks) => {
      const label = buatElemenPilihan(pilihan, indeks);
      containerPilihan.appendChild(label);
    });
  }
}

// Fungsi helper untuk membuat elemen pilihan
function buatElemenPilihan(pilihan, indeks) {
  const label = document.createElement("label");
  label.className =
    "flex items-start space-x-3 p-3 sm:p-4 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors";

  const isChecked = jawabanPengguna[indeksPertanyaanSaatIni] === indeks;
  label.innerHTML = `
        <input type="radio" name="question_${indeksPertanyaanSaatIni}" class="mt-1 h-4 w-4 text-bbgtk-blue border-gray-300 focus:ring-bbgtk-blue flex-shrink-0" 
                data-option="${indeks}" value="${indeks}" ${
    isChecked ? "checked" : ""
  }>
        <span class="text-gray-700 text-sm sm:text-base leading-relaxed">${pilihan}</span>
    `;
  return label;
}

// Perbarui paginasi untuk menampilkan grup saat ini
function perbaruiPaginasi() {
  const paginasi = document.getElementById("pagination");
  const panahKiri = document.getElementById("leftArrow");
  const panahKanan = document.getElementById("rightArrow");

  if (!paginasi || !panahKiri || !panahKanan) return;

  // Bersihkan tombol yang ada
  paginasi.innerHTML = "";

  // Hitung indeks awal dan akhir untuk grup saat ini
  const indeksAwal = grupHalamanSaatIni * CONFIG.QUESTIONS_PER_PAGE;
  const indeksAkhir = Math.min(
    indeksAwal + CONFIG.QUESTIONS_PER_PAGE,
    CONFIG.TOTAL_QUESTIONS
  );

  // Buat tombol untuk grup saat ini
  for (let i = indeksAwal; i < indeksAkhir; i++) {
    const tombol = buatTombolPaginasi(i);
    paginasi.appendChild(tombol);
  }

  // Perbarui status panah - sembunyikan sepenuhnya di grup halaman pertama/terakhir
  aturVisibilitasPanah(panahKiri, panahKanan);
}

// Fungsi helper untuk mengatur visibilitas panah
function aturVisibilitasPanah(panahKiri, panahKanan) {
  if (grupHalamanSaatIni === 0) {
    panahKiri.style.display = "none";
  } else {
    panahKiri.style.display = "block";
    panahKiri.style.opacity = "1";
    panahKiri.style.pointerEvents = "auto";
  }

  if (grupHalamanSaatIni === 3) {
    panahKanan.style.display = "none";
  } else {
    panahKanan.style.display = "block";
    panahKanan.style.opacity = "1";
    panahKanan.style.pointerEvents = "auto";
  }
}

// Fungsi helper untuk membuat tombol paginasi
function buatTombolPaginasi(indeks) {
  const tombol = document.createElement("button");
  tombol.className =
    "w-8 h-8 sm:w-10 sm:h-10 rounded-full font-medium transition-colors text-sm sm:text-base";
  tombol.textContent = indeks + 1;

  // Cek apakah pertanyaan spesifik ini sudah dijawab
  const sudahDijawab = jawabanPengguna[indeks] !== undefined;

  if (sudahDijawab && indeks !== indeksPertanyaanSaatIni) {
    tombol.className += " bg-green-500 text-white"; // Hijau untuk yang sudah dijawab
  } else if (indeks === indeksPertanyaanSaatIni) {
    tombol.className += " bg-bbgtk-blue text-white"; // Biru untuk yang sedang aktif
  } else {
    tombol.className += " bg-gray-200 text-gray-700 hover:bg-gray-300"; // Abu-abu untuk yang belum dijawab
  }

  tombol.addEventListener("click", () => {
    indeksPertanyaanSaatIni = indeks;
    perbaruiPertanyaan();
    perbaruiPaginasi();
  });

  return tombol;
}

// Perbarui grup halaman saat ini berdasarkan pertanyaan saat ini
function perbaruiGrupHalamanSaatIni() {
  grupHalamanSaatIni = Math.floor(
    indeksPertanyaanSaatIni / CONFIG.QUESTIONS_PER_PAGE
  );
}

// Simpan jawaban
function simpanJawaban() {
  const tombolRadio = document.querySelector(
    `input[name="question_${indeksPertanyaanSaatIni}"]:checked`
  );
  if (tombolRadio) {
    jawabanPengguna[indeksPertanyaanSaatIni] = Number.parseInt(
      tombolRadio.value
    );
  }
  perbaruiProgress();
  perbaruiStatusTombolSelanjutnya();
}

// Hapus jawaban saat ini
function hapusJawabanSaatIni() {
  delete jawabanPengguna[indeksPertanyaanSaatIni];
  perbaruiPertanyaan();
  perbaruiPaginasi();
  perbaruiProgress();
  perbaruiStatusTombolSelanjutnya();
}

// Navigasi ke grup halaman sebelumnya
function navigasiKiri() {
  if (grupHalamanSaatIni > 0) {
    grupHalamanSaatIni--;
    perbaruiPaginasi();
  }
}

// Navigasi ke grup halaman selanjutnya
function navigasiKanan() {
  if (grupHalamanSaatIni < 3) {
    grupHalamanSaatIni++;
    perbaruiPaginasi();
  }
}

// Fungsi untuk menghitung skor per pertanyaan
function hitungSkorPertanyaan(indeksPertanyaan, indexJawaban) {
  // Cek apakah pertanyaan termasuk Growth Mindset pattern
  if (pertanyaanGrowthMindset.includes(indeksPertanyaan)) {
    // Untuk Growth Mindset: Sangat Setuju=0, Setuju=1, Tidak Setuju=2, Sangat Tidak Setuju=3
    return indexJawaban;
  }
  // Untuk Fixed Mindset pattern
  else if (pertanyaanFixedMindset.includes(indeksPertanyaan)) {
    // Untuk Fixed Mindset: Sangat Setuju=3, Setuju=2, Tidak Setuju=1, Sangat Tidak Setuju=0
    return 3 - indexJawaban;
  }

  // Default fallback (tidak seharusnya terjadi)
  return 0;
}

// Hitung skor dan tampilkan hasil
function hitungSkor() {
  let totalSkor = 0;
  for (let i = 0; i < CONFIG.TOTAL_QUESTIONS; i++) {
    if (jawabanPengguna[i] !== undefined) {
      const skorPertanyaan = hitungSkorPertanyaan(i, jawabanPengguna[i]);
      totalSkor += skorPertanyaan;
    }
  }
  return totalSkor;
}

// Dapatkan profil pola pikir berdasarkan skor
function dapatkanProfilPolaPikir(skor) {
  const profilMap = {
    FF: {
      range: [0, 20],
      name: "Pola Pikir Tetap (Fixed Mindset)",
      description:
        "Anda cenderung percaya bahwa kemampuan adalah tetap dan tidak dapat diubah.",
    },
    FG: {
      range: [21, 33],
      name: "Pola Pikir Tetap dengan sedikit Pola Pikir Berkembang",
      description:
        "Anda memiliki kecenderungan pola pikir tetap namun mulai terbuka pada perkembangan.",
    },
    GF: {
      range: [34, 44],
      name: "Pola Pikir Berkembang dengan sedikit Pola Pikir Tetap",
      description:
        "Anda cenderung memiliki pola pikir berkembang namun masih ada sedikit pola pikir tetap.",
    },
    GG: {
      range: [45, 60],
      name: "Pola Pikir Berkembang (Growth Mindset)",
      description:
        "Anda memiliki pola pikir berkembang yang kuat dan percaya kemampuan dapat ditingkatkan.",
    },
  };

  for (const [kode, profil] of Object.entries(profilMap)) {
    const [min, max] = profil.range;
    if (skor >= min && skor <= max) {
      return { code: kode, ...profil };
    }
  }

  // Default fallback
  return profilMap.FF;
}

// Tampilkan hasil
function tampilkanHasil() {
  clearInterval(intervalTimer);

  const skor = hitungSkor();
  const profil = dapatkanProfilPolaPikir(skor);
  const jumlahTerjawab = Object.keys(jawabanPengguna).length;
  const menitTersisa = Math.floor(waktuTersisa / 60);
  const detikTersisa = waktuTersisa % 60;

  // Perbarui konten halaman hasil
  perbaruiElemenHasil(skor, profil, jumlahTerjawab, menitTersisa, detikTersisa);

  // Sembunyikan konten kuis dan tampilkan hasil
  const kontenKuis = document.getElementById("quizContent");
  const halamanHasil = document.getElementById("resultsPage");

  if (kontenKuis) kontenKuis.classList.add("hidden");
  if (halamanHasil) halamanHasil.classList.remove("hidden");

  // Tambahkan tombol "Kembali ke Beranda"
  tambahkanTombolKembaliBeranda();
}

// Fungsi helper untuk memperbarui elemen hasil
function perbaruiElemenHasil(
  skor,
  profil,
  jumlahTerjawab,
  menitTersisa,
  detikTersisa
) {
  const elemenSkorAkhir = document.getElementById("finalScore");
  const elemenJudulProfil = document.getElementById("profileTitle");
  const elemenKodeProfil = document.getElementById("profileCode");
  const elemenDeskripsiProfil = document.getElementById("profileDescription");
  const elemenJumlahTerjawab = document.getElementById("answeredCount");
  const elemenWaktuTersisa = document.getElementById("timeRemaining");

  if (elemenSkorAkhir) elemenSkorAkhir.textContent = skor;
  if (elemenJudulProfil) elemenJudulProfil.textContent = profil.name;
  if (elemenKodeProfil) elemenKodeProfil.textContent = profil.code;
  if (elemenDeskripsiProfil)
    elemenDeskripsiProfil.textContent = profil.description;
  if (elemenJumlahTerjawab) elemenJumlahTerjawab.textContent = jumlahTerjawab;
  if (elemenWaktuTersisa) {
    elemenWaktuTersisa.textContent = `${menitTersisa
      .toString()
      .padStart(2, "0")}:${detikTersisa.toString().padStart(2, "0")}`;
  }
}

// Tambahkan tombol "Kembali ke Beranda" ke hasil
function tambahkanTombolKembaliBeranda() {
  const halamanHasil = document.getElementById("resultsPage");
  if (!halamanHasil) return;

  const containerTombolAksi = halamanHasil.querySelector(
    ".flex.flex-col.sm\\:flex-row.gap-4.justify-center"
  );

  if (containerTombolAksi && !document.getElementById("back-to-home-btn")) {
    const tombolKembali = document.createElement("button");
    tombolKembali.id = "back-to-home-btn";
    tombolKembali.className =
      "bg-[#003692] hover:bg-[#5375c6] text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center";
    tombolKembali.innerHTML = `
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
            </svg>
            Kembali ke Beranda
        `;
    tombolKembali.addEventListener("click", kembaliKeBeranda);

    containerTombolAksi.appendChild(tombolKembali);
  }
}

// Fungsi untuk kembali ke halaman beranda
function kembaliKeBeranda() {
  hapusSesiKuis();
  tampilkanNotifikasi("Mengarahkan ke beranda...", "info");
  setTimeout(() => {
    window.location.href = "./index.html";
  }, CONFIG.REDIRECT_DELAY);
}

// Mulai ulang kuis
function mulaiUlangKuis() {
  // Reset semua variabel
  indeksPertanyaanSaatIni = 0;
  jawabanPengguna = {};
  waktuTersisa = CONFIG.TIMER_DURATION;
  grupHalamanSaatIni = 0;

  // Tampilkan konten kuis dan sembunyikan hasil
  const kontenKuis = document.getElementById("quizContent");
  const halamanHasil = document.getElementById("resultsPage");

  if (kontenKuis) kontenKuis.classList.remove("hidden");
  if (halamanHasil) halamanHasil.classList.add("hidden");

  // Mulai ulang timer
  intervalTimer = setInterval(perbaruiTimer, 1000);

  // Perbarui tampilan
  perbaruiGrupHalamanSaatIni();
  perbaruiPertanyaan();
  perbaruiPaginasi();
  perbaruiProgress();
}

// Fungsi cetak yang diperbaiki sesuai dengan fungsionalitas HTML print
function cetakHasil() {
  // Tampilkan elemen khusus print
  const headerPrint = document.querySelectorAll(".print-header");
  const footerPrint = document.querySelectorAll(".print-footer");

  headerPrint.forEach((header) => {
    header.style.display = "block";
  });

  footerPrint.forEach((footer) => {
    footer.style.display = "block";
    // Set tanggal saat ini
    const tanggalCetak = footer.querySelector("#printDate");
    if (tanggalCetak) {
      tanggalCetak.textContent = new Date().toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  });

  // Jalankan fungsi cetak
  window.print();

  // Sembunyikan elemen khusus print setelah mencetak
  setTimeout(() => {
    headerPrint.forEach((header) => {
      header.style.display = "none";
    });

    footerPrint.forEach((footer) => {
      footer.style.display = "none";
    });
  }, CONFIG.PRINT_DELAY);
}

// Hapus data sesi kuis
function hapusSesiKuis() {
  sessionStorage.removeItem("currentQuizPackage");
  sessionStorage.removeItem("quizStartTime");
  sessionStorage.removeItem("quizAccessToken");
}

// Fungsi logout
async function logout() {
  try {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    if (response.ok) {
      hapusSesiKuis();
      tampilkanNotifikasi("Logout berhasil!", "success");
      setTimeout(() => {
        window.location.href = "/";
      }, CONFIG.REDIRECT_DELAY);
    } else {
      tampilkanNotifikasi("Terjadi kesalahan saat logout", "error");
    }
  } catch (error) {
    console.error("Kesalahan saat logout:", error);
    tampilkanNotifikasi("Terjadi kesalahan saat logout", "error");
  }
}

// Fungsi tampilkan notifikasi
function tampilkanNotifikasi(pesan, tipe = "info") {
  const notifikasi = document.createElement("div");
  notifikasi.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full max-w-sm`;

  // Atur gaya notifikasi berdasarkan tipe
  const gayaNotifikasi = getGayaNotifikasi(tipe);
  notifikasi.classList.add(...gayaNotifikasi);

  notifikasi.innerHTML = `
        <div class="flex items-center">
            <span class="flex-1">${pesan}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-2 text-gray-400 hover:text-gray-600">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </div>
    `;

  document.body.appendChild(notifikasi);

  setTimeout(() => {
    notifikasi.classList.remove("translate-x-full");
  }, 100);

  setTimeout(() => {
    if (notifikasi.parentElement) {
      notifikasi.classList.add("translate-x-full");
      setTimeout(() => {
        if (notifikasi.parentElement) {
          document.body.removeChild(notifikasi);
        }
      }, 300);
    }
  }, CONFIG.NOTIFICATION_DURATION);
}

// Fungsi helper untuk mendapatkan gaya notifikasi
function getGayaNotifikasi(tipe) {
  const gayaMap = {
    success: ["bg-green-100", "border", "border-green-400", "text-green-700"],
    error: ["bg-red-100", "border", "border-red-400", "text-red-700"],
    info: ["bg-blue-100", "border", "border-blue-400", "text-blue-700"],
  };

  return gayaMap[tipe] || gayaMap.info;
}

// Event listener navigasi - dengan pengecekan null
document.addEventListener("DOMContentLoaded", () => {
  // Tombol navigasi
  const tombolSebelumnya = document.getElementById("prevBtn");
  const tombolSelanjutnya = document.getElementById("nextBtn");
  const tombolKembali = document.getElementById("backBtn");
  const tombolHapus = document.getElementById("clearBtn");
  const panahKiri = document.getElementById("leftArrow");
  const panahKanan = document.getElementById("rightArrow");
  const tombolMulaiUlang = document.getElementById("restartBtn");

  if (tombolSebelumnya) {
    tombolSebelumnya.addEventListener("click", () => {
      if (indeksPertanyaanSaatIni > 0) {
        simpanJawaban();
        indeksPertanyaanSaatIni--;
        perbaruiGrupHalamanSaatIni();
        perbaruiPertanyaan();
        perbaruiPaginasi();
      }
    });
  }

  if (tombolSelanjutnya) {
    tombolSelanjutnya.addEventListener("click", () => {
      if (indeksPertanyaanSaatIni < 19) {
        simpanJawaban();
        indeksPertanyaanSaatIni++;
        perbaruiGrupHalamanSaatIni();
        perbaruiPertanyaan();
        perbaruiPaginasi();
      } else {
        // Hanya izinkan menyelesaikan jika semua pertanyaan sudah dijawab
        if (apakahSemuaPertanyaanTerjawab()) {
          simpanJawaban();
          tampilkanHasil();
        } else {
          // Tampilkan alert untuk kuis yang belum lengkap
          const jumlahTersisa =
            dataKuis.length - Object.keys(jawabanPengguna).length;
          alert(
            `Anda harus menjawab semua soal sebelum menyelesaikan kuesioner. ${jumlahTersisa} soal belum dijawab.`
          );
        }
      }
    });
  }

  if (tombolKembali) {
    tombolKembali.addEventListener("click", () => {
      if (
        confirm("Apakah Anda yakin ingin kembali? Progress akan tersimpan.")
      ) {
        window.location.href = "./halaman_pemetaan.html";
      }
    });
  }

  if (tombolHapus) {
    tombolHapus.addEventListener("click", () => {
      if (
        confirm("Apakah Anda yakin ingin menghapus jawaban untuk soal ini?")
      ) {
        hapusJawabanSaatIni();
      }
    });
  }

  if (panahKiri) {
    panahKiri.addEventListener("click", navigasiKiri);
  }

  if (panahKanan) {
    panahKanan.addEventListener("click", navigasiKanan);
  }

  if (tombolMulaiUlang) {
    tombolMulaiUlang.addEventListener("click", mulaiUlangKuis);
  }

  // Simpan jawaban saat tombol radio berubah
  document.addEventListener("change", (event) => {
    if (
      event.target.type === "radio" &&
      event.target.closest("#answerOptions")
    ) {
      simpanJawaban();
      perbaruiPaginasi();
    }
  });
});

// Cegah akses langsung dengan mengecek referrer dan sesi
window.addEventListener("beforeunload", () => {
  // Simpan data sesi saat navigasi dalam kuis
  if (!window.location.href.includes("halaman_soal")) {
    hapusSesiKuis();
  }
});

// Buat fungsi tersedia secara global untuk handler onclick HTML
window.logout = logout;
window.cetakHasil = cetakHasil;
