// Menangani form login
document.addEventListener("DOMContentLoaded", () => {
  initializeLoginForm();
});

// Inisialisasi form login
function initializeLoginForm() {
  const loginForm = document.getElementById("login-form");
  const errorMessage = document.getElementById("error-message");
  const successMessage = document.getElementById("success-message");
  const loginBtn = document.getElementById("login-btn");

  loginForm.addEventListener("submit", (e) => {
    handleFormSubmit(e, errorMessage, successMessage, loginBtn);
  });
}

// Menangani submit form
async function handleFormSubmit(event, errorMessage, successMessage, loginBtn) {
  event.preventDefault();

  const formData = getFormData();

  // Bersihkan pesan sebelumnya
  clearMessages(errorMessage, successMessage);

  // Validasi form
  const validationError = validateForm(formData);
  if (validationError) {
    showMessage(errorMessage, validationError);
    return;
  }

  // Proses login
  await processLogin(formData, errorMessage, successMessage, loginBtn);
}

// Mengambil data dari form
function getFormData() {
  return {
    nik: document.getElementById("nik").value.trim(),
    password: document.getElementById("password").value,
  };
}

// Validasi form
function validateForm({ nik, password }) {
  if (!nik || !password) {
    return "NIK dan password harus diisi";
  }

  if (!/^\d{16}$/.test(nik)) {
    return "NIK harus berupa 16 digit angka";
  }

  return null;
}

// Proses login ke server
async function processLogin(formData, errorMessage, successMessage, loginBtn) {
  // Tampilkan state loading
  setLoadingState(loginBtn, true);

  try {
    const response = await sendLoginRequest(formData);
    const data = await response.json();

    if (response.ok) {
      handleLoginSuccess(successMessage);
    } else {
      handleLoginError(errorMessage, data.error);
    }
  } catch (error) {
    console.error("Login error:", error);
    showMessage(errorMessage, "Terjadi kesalahan. Silakan coba lagi.");
  } finally {
    // Reset state tombol
    setLoadingState(loginBtn, false);
  }
}

// Kirim request login ke server
async function sendLoginRequest({ nik, password }) {
  return await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ nik, password }),
    credentials: "include",
  });
}

// Menangani login sukses
function handleLoginSuccess(successMessage) {
  showMessage(successMessage, "Login berhasil! Mengalihkan...");

  // Redirect setelah 1 detik
  setTimeout(() => {
    redirectToPage();
  }, 1000);
}

// Menangani login error
function handleLoginError(errorMessage, errorText) {
  const message = errorText || "Login gagal";
  showMessage(errorMessage, message);
}

// Redirect ke halaman setelah login
function redirectToPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const redirectTo = urlParams.get("redirect");

  if (redirectTo) {
    window.location.href = `/${redirectTo}`;
  } else {
    window.location.href = "/";
  }
}

// Set state loading pada tombol
function setLoadingState(button, isLoading) {
  button.disabled = isLoading;
  button.textContent = isLoading ? "Signing in..." : "Sign in";
}

// Bersihkan semua pesan
function clearMessages(errorMessage, successMessage) {
  hideMessage(errorMessage);
  hideMessage(successMessage);
}

// Toggle visibility password
function togglePassword() {
  const passwordInput = document.getElementById("password");
  const eyeIcon = document.getElementById("eyeIcon");

  if (passwordInput.type === "password") {
    showPassword(passwordInput, eyeIcon);
  } else {
    hidePassword(passwordInput, eyeIcon);
  }
}

// Tampilkan password
function showPassword(input, icon) {
  input.type = "text";
  icon.innerHTML = getHidePasswordIcon();
}

// Sembunyikan password
function hidePassword(input, icon) {
  input.type = "password";
  icon.innerHTML = getShowPasswordIcon();
}

// Icon untuk menyembunyikan password
function getHidePasswordIcon() {
  return `
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
    <line x1="1" y1="1" x2="23" y2="23"></line>
  `;
}

// Icon untuk menampilkan password
function getShowPasswordIcon() {
  return `
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  `;
}

// Tampilkan pesan
function showMessage(element, message) {
  element.textContent = message;
  element.classList.remove("hidden");
}

// Sembunyikan pesan
function hideMessage(element) {
  element.classList.add("hidden");
}
