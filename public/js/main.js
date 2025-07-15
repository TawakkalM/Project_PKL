// Variabel global untuk status login
let isLoggedIn = false;
let currentUser = null;

// Opsi untuk observer animasi
const OBSERVER_OPTIONS = {
  fadeIn: {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  },
  navigation: {
    threshold: 0.5,
  },
};

// Konfigurasi notifikasi
const NOTIFICATION_CONFIG = {
  duration: 3000,
  animationDelay: 100,
  fadeOutDelay: 300,
};

// Inisialisasi aplikasi saat DOM sudah siap
document.addEventListener("DOMContentLoaded", async () => {
  await checkAuthStatus();
  initializeEventListeners();
  initializeFadeInAnimations();
});

// Periksa status autentikasi pengguna
async function checkAuthStatus() {
  try {
    const response = await fetch("/api/auth/check", {
      method: "GET",
      credentials: "include",
    });

    if (response.ok) {
      const data = await response.json();
      setUserLoggedIn(data.user);
    } else {
      setUserLoggedOut();
    }
  } catch (error) {
    console.error("Gagal memeriksa status autentikasi:", error);
    setUserLoggedOut();
  }
}

// Set status pengguna sebagai login
function setUserLoggedIn(user) {
  isLoggedIn = true;
  currentUser = user;
  updateAuthUI();
}

// Set status pengguna sebagai logout
function setUserLoggedOut() {
  isLoggedIn = false;
  currentUser = null;
  updateAuthUI();
}

// Perbarui tampilan UI autentikasi
function updateAuthUI() {
  const authSection = document.getElementById("auth-section");
  const mobileAuthSection = document.getElementById("mobile-auth-section");

  if (isLoggedIn && currentUser) {
    updateLoggedInUI(authSection, mobileAuthSection);
  } else {
    updateLoggedOutUI(authSection, mobileAuthSection);
  }
}

// Perbarui UI untuk pengguna yang sudah login
function updateLoggedInUI(authSection, mobileAuthSection) {
  const userIcon = createUserIcon();

  // Tampilan desktop
  authSection.innerHTML = `
    <div class="hidden md:flex items-center space-x-4">
      ${userIcon}
      <span class="text-sm text-[#003692] font-medium">${currentUser.name}</span>
      <span class="h-6 border-l border-gray-400"></span>
      <button onclick="logout()" class="text-sm text-[#003692] hover:text-[#5375c6] font-medium">
        Keluar
      </button>
    </div>
  `;

  // Tampilan mobile
  mobileAuthSection.innerHTML = `
    <div class="space-y-2">
      <div class="flex items-center space-x-2 py-2">
        ${userIcon.replace("w-8 h-8", "w-6 h-6").replace("w-8 h-8", "w-5 h-5")}
        <span class="text-[#003692] font-medium">${currentUser.name}</span>
      </div>
      <button onclick="logout()" class="block w-full text-left bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition">
        Keluar
      </button>
    </div>
  `;
}

// Perbarui UI untuk pengguna yang belum login
function updateLoggedOutUI(authSection, mobileAuthSection) {
  // Tampilan desktop
  authSection.innerHTML = `
    <button class="hidden lg:w-25 md:block md:h-7 md:py-0 bg-[#003692] px-3 py-2 sm:px-4 sm:py-2 rounded-2xl hover:bg-[#5375c6] transition-colors duration-200 btn-hover">
      <a href="/login" class="text-white text-sm:text-base font-normal">Masuk</a>
    </button>
  `;

  // Tampilan mobile
  mobileAuthSection.innerHTML = `
    <a href="/login" class="block bg-[#003692] text-white text-center px-4 py-2 rounded-xl hover:bg-[#5375c6] transition">Masuk</a>
  `;
}

// Buat ikon pengguna
function createUserIcon() {
  return `
    <div class="w-8 h-8 rounded-full flex items-end justify-center rounded-full border-2 border-[#003692] bg-white">
      <svg class="w-8 h-8 text-[#003692]" fill="none" stroke="currentColor" viewBox="0 0 24 15">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
      </svg>
    </div>
  `;
}

// Fungsi logout pengguna
async function logout() {
  try {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    if (response.ok) {
      setUserLoggedOut();
      showNotification("Logout berhasil!", "success");
    } else {
      showNotification("Terjadi kesalahan saat logout", "error");
    }
  } catch (error) {
    console.error("Gagal melakukan logout:", error);
    showNotification("Terjadi kesalahan saat logout", "error");
  }
}

// Tangani klik tombol "Mulai Kerjakan"
function handleMulaiKerjakan() {
  const redirectUrl = isLoggedIn
    ? "/halaman_pemetaan"
    : "/login?redirect=halaman_pemetaan";

  window.location.href = redirectUrl;
}

// Inisialisasi animasi fade-in
function initializeFadeInAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, OBSERVER_OPTIONS.fadeIn);

  // Amati semua elemen dengan kelas fade-in
  document.querySelectorAll(".fade-in").forEach((element) => {
    observer.observe(element);
  });
}

// Inisialisasi semua event listener
function initializeEventListeners() {
  setupMobileMenu();
  setupSmoothScrolling();
  setupNavbarScrollEffect();
  setupFooterHoverEffects();
  setupNavigationHighlighting();
}

// Setup menu mobile
function setupMobileMenu() {
  const mobileMenuBtn = document.getElementById("mobile-menu-btn");
  const mobileMenu = document.getElementById("mobile-menu");

  if (!mobileMenuBtn || !mobileMenu) return;

  let isMenuOpen = false;

  // Toggle menu mobile
  mobileMenuBtn.addEventListener("click", () => {
    isMenuOpen = !isMenuOpen;
    mobileMenu.classList.toggle("active", isMenuOpen);
  });

  // Tutup menu saat klik di luar
  document.addEventListener("click", (event) => {
    if (shouldCloseMobileMenu(event, mobileMenu, mobileMenuBtn, isMenuOpen)) {
      isMenuOpen = false;
      mobileMenu.classList.remove("active");
    }
  });
}

// Periksa apakah menu mobile harus ditutup
function shouldCloseMobileMenu(event, mobileMenu, mobileMenuBtn, isMenuOpen) {
  return (
    !mobileMenu.contains(event.target) &&
    !mobileMenuBtn.contains(event.target) &&
    isMenuOpen
  );
}

// Setup smooth scrolling untuk anchor links
function setupSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", handleAnchorClick);
  });
}

// Tangani klik anchor link
function handleAnchorClick(event) {
  event.preventDefault();

  const target = document.querySelector(this.getAttribute("href"));
  if (!target) return;

  target.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });

  // Tutup menu mobile setelah klik
  const mobileMenu = document.getElementById("mobile-menu");
  if (mobileMenu) {
    mobileMenu.classList.remove("active");
  }
}

// Setup efek scroll pada navbar
function setupNavbarScrollEffect() {
  window.addEventListener("scroll", () => {
    const navbar = document.querySelector("nav");
    if (!navbar) return;

    const shouldAddBackdrop = window.scrollY > 50;
    navbar.classList.toggle("bg-white/95", shouldAddBackdrop);
    navbar.classList.toggle("backdrop-blur-sm", shouldAddBackdrop);
  });
}

// Setup efek hover pada link footer
function setupFooterHoverEffects() {
  const footerLinks = document.querySelectorAll("footer a");

  footerLinks.forEach((link) => {
    link.addEventListener("mouseenter", () => {
      link.style.transform = "translateX(5px)";
    });

    link.addEventListener("mouseleave", () => {
      link.style.transform = "translateX(0)";
    });
  });
}

// Setup highlighting navigasi aktif
function setupNavigationHighlighting() {
  const sections = document.querySelectorAll("main, section");
  const navLinks = document.querySelectorAll('nav a[href^="#"]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        updateActiveNavigation(entry.target, navLinks);
      }
    });
  }, OBSERVER_OPTIONS.navigation);

  sections.forEach((section) => {
    observer.observe(section);
  });
}

// Perbarui navigasi aktif
function updateActiveNavigation(activeSection, navLinks) {
  const activeId = activeSection.getAttribute("id");

  navLinks.forEach((link) => {
    const linkId = link.getAttribute("href").substring(1);
    const isActive = linkId === activeId;

    link.classList.toggle("text-[#FEB902]", isActive);
    link.classList.toggle("font-semibold", isActive);
  });
}

// Tampilkan notifikasi
function showNotification(message, type = "info") {
  const notification = createNotificationElement(message, type);

  document.body.appendChild(notification);

  // Animasi masuk
  setTimeout(() => {
    notification.classList.remove("translate-x-full");
  }, NOTIFICATION_CONFIG.animationDelay);

  // Hapus notifikasi setelah durasi tertentu
  setTimeout(() => {
    removeNotification(notification);
  }, NOTIFICATION_CONFIG.duration);
}

// Buat elemen notifikasi
function createNotificationElement(message, type) {
  const notification = document.createElement("div");
  notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full`;

  // Tentukan style berdasarkan tipe
  const typeStyles = {
    success: ["bg-green-100", "border-green-400", "text-green-700"],
    error: ["bg-red-100", "border-red-400", "text-red-700"],
    info: ["bg-blue-100", "border-blue-400", "text-blue-700"],
  };

  const styles = typeStyles[type] || typeStyles.info;
  notification.classList.add("border", ...styles);
  notification.textContent = message;

  return notification;
}

// Hapus notifikasi dengan animasi
function removeNotification(notification) {
  notification.classList.add("translate-x-full");

  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, NOTIFICATION_CONFIG.fadeOutDelay);
}
