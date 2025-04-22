function logout() {
  window.location.href = "/";
  localStorage.removeItem("userLogin");
}

function renderHeader() {
  let adminLoginNameEL = document.querySelector("#admin_login_name");
  adminLoginNameEL.innerText = adminLoginNameEL.innerText.replace("[name]", getUserLoginData().name);
}

renderHeader();

const darkToggle = document.getElementById("darkModeToggle");
darkToggle.addEventListener("change", () => {
  document.documentElement.setAttribute("data-bs-theme", darkToggle.checked ? "dark" : "light");
});

const toggleSidebar = document.getElementById("toggleSidebar");
toggleSidebar.addEventListener("click", () => {
  document.getElementById("sidebar").classList.toggle("collapsed");
});

function showToast(message) {
  document.getElementById("toastBody").innerText = message;
  const toast = new bootstrap.Toast(document.getElementById("liveToast"));
  toast.show();
}

const checkbox = document.getElementById("checkbox");

// Set chế độ mặc định khi load trang
document.body.classList.add("light-mode");

checkbox.addEventListener("change", function () {
  if (this.checked) {
    document.body.classList.remove("dark-mode");
    document.body.classList.add("light-mode");
  } else {
    document.body.classList.remove("light-mode");
    document.body.classList.add("dark-mode");
  }
});
