// Variabel global untuk menyimpan data pengguna saat ini
let currentUser = null;

// Konstanta untuk konfigurasi
const CONFIG = {
  NOTIFICATION_DURATION: 5000,
  LOADING_DELAY: 500,
  REDIRECT_DELAY: 1000,
  QUIZ_REDIRECT_DELAY: 1500,
};

// Inisialisasi halaman saat DOM sudah siap
document.addEventListener("DOMContentLoaded", async () => {
  await cekAutentikasiDanMuatPengguna();
  sembunyikanLayarMuat();
  inisialisasiMenuMobile();
  inisialisasiAnimasiFadeIn();
});

// Fungsi untuk mengecek autentikasi dan memuat data pengguna
async function cekAutentikasiDanMuatPengguna() {
  try {
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
    }
  } catch (error) {
    console.error("Kesalahan saat mengecek status autentikasi:", error);
    window.location.href = "/login?redirect=halaman_pemetaan";
  }
}

// Fungsi untuk memperbarui informasi pengguna di navbar
function perbaruiInfoPengguna() {
  const elemenNamaPengguna = document.getElementById("user-name");
  const elemenNamaPenggunaMobile = document.getElementById("user-name-mobile");

  if (currentUser) {
    if (elemenNamaPengguna) {
      elemenNamaPengguna.textContent = currentUser.name;
    }
    if (elemenNamaPenggunaMobile) {
      elemenNamaPenggunaMobile.textContent = currentUser.name;
    }
  }
}

// Fungsi untuk menginisialisasi menu mobile
function inisialisasiMenuMobile() {
  const tombolMenuMobile = document.getElementById("mobile-menu-btn");
  const menuMobile = document.getElementById("mobile-menu");
  let statusMenuTerbuka = false;

  if (tombolMenuMobile && menuMobile) {
    // Event listener untuk tombol menu mobile
    tombolMenuMobile.addEventListener("click", () => {
      statusMenuTerbuka = !statusMenuTerbuka;

      if (statusMenuTerbuka) {
        menuMobile.classList.add("active");
      } else {
        menuMobile.classList.remove("active");
      }
    });

    // Tutup menu mobile saat klik di luar area menu
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

// Fungsi untuk menginisialisasi animasi fade-in
function inisialisasiAnimasiFadeIn() {
  const opsiObserver = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, opsiObserver);

  // Amati semua elemen dengan kelas fade-in
  document.querySelectorAll(".fade-in").forEach((elemen) => {
    observer.observe(elemen);
  });
}

// Fungsi untuk menyembunyikan layar loading
function sembunyikanLayarMuat() {
  const layarMuat = document.getElementById("loading-screen");

  if (layarMuat) {
    setTimeout(() => {
      layarMuat.style.opacity = "0";

      setTimeout(() => {
        layarMuat.style.display = "none";
      }, 300);
    }, CONFIG.LOADING_DELAY);
  }
}

// Fungsi untuk logout pengguna
async function logout() {
  try {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    if (response.ok) {
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

// Fungsi untuk memulai soal kuis
function mulaiSoal(namaPaketSoal) {
  // Tampilkan dialog konfirmasi
  const konfirmasi = confirm(
    `Anda akan memulai ${namaPaketSoal}. Pastikan Anda sudah siap dan memiliki waktu yang cukup. Lanjutkan?`
  );

  if (konfirmasi) {
    // Buat sesi kuis dan arahkan ke halaman soal
    tampilkanNotifikasi(`Memulai ${namaPaketSoal}...`, "info");

    // Simpan data paket kuis di sessionStorage untuk halaman kuis
    sessionStorage.setItem("currentQuizPackage", namaPaketSoal);
    sessionStorage.setItem("quizStartTime", new Date().toISOString());
    sessionStorage.setItem("quizAccessToken", buatTokenAkses());

    // Arahkan ke halaman kuis setelah delay singkat
    setTimeout(() => {
      window.location.href = "./halaman_soal.html";
    }, CONFIG.QUIZ_REDIRECT_DELAY);
  }
}

// Fungsi untuk membuat token akses kuis
function buatTokenAkses() {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substr(2, 9);
  return btoa(timestamp + randomString);
}

// Fungsi untuk menampilkan notifikasi
function tampilkanNotifikasi(pesan, tipe = "info") {
  // Buat elemen notifikasi
  const notifikasi = document.createElement("div");
  notifikasi.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full max-w-sm`;

  // Atur gaya notifikasi berdasarkan tipe
  const gayaNotifikasi = getGayaNotifikasi(tipe);
  notifikasi.classList.add(...gayaNotifikasi);

  // Atur konten notifikasi
  notifikasi.innerHTML = buatKontenNotifikasi(pesan);

  // Tambahkan ke DOM
  document.body.appendChild(notifikasi);

  // Animasi masuk
  setTimeout(() => {
    notifikasi.classList.remove("translate-x-full");
  }, 100);

  // Hapus setelah durasi yang ditentukan
  setTimeout(() => {
    hapusNotifikasi(notifikasi);
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

// Fungsi helper untuk membuat konten notifikasi
function buatKontenNotifikasi(pesan) {
  return `
        <div class="flex items-center">
            <span class="flex-1">${pesan}</span>
            <button onclick="hapusNotifikasiIni(this)" class="ml-2 text-gray-400 hover:text-gray-600">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </div>
    `;
}

// Fungsi untuk menghapus notifikasi dengan animasi
function hapusNotifikasi(elemenNotifikasi) {
  if (elemenNotifikasi.parentElement) {
    elemenNotifikasi.classList.add("translate-x-full");

    setTimeout(() => {
      if (elemenNotifikasi.parentElement) {
        document.body.removeChild(elemenNotifikasi);
      }
    }, 300);
  }
}

// Fungsi global untuk menghapus notifikasi dari tombol close
function hapusNotifikasiIni(tombol) {
  const notifikasi = tombol.closest(".fixed");
  if (notifikasi) {
    hapusNotifikasi(notifikasi);
  }
}
