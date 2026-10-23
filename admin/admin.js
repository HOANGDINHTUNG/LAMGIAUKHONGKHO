function logout() {
  window.location.href = "/";
  localStorage.removeItem("userLogin");
}

function renderHeader() {
  let adminLoginNameEL = document.querySelector("#admin_login_name");
  if (adminLoginNameEL) {
    let userData = typeof getUserLoginData === "function" ? getUserLoginData() : null;
    let name = userData ? userData.name : "Admin";
    adminLoginNameEL.innerText = adminLoginNameEL.innerText.replace("[name]", name);
  }
}

renderHeader();

const darkToggle = document.getElementById("darkModeToggle");
if (darkToggle) {
  darkToggle.addEventListener("change", () => {
    document.documentElement.setAttribute("data-bs-theme", darkToggle.checked ? "dark" : "light");
  });
}

const toggleSidebar = document.getElementById("toggleSidebar");
if (toggleSidebar) {
  toggleSidebar.addEventListener("click", () => {
    const sidebar = document.getElementById("sidebar");
    if (sidebar) sidebar.classList.toggle("collapsed");
  });
}

function showToast(message) {
  const toastBody = document.getElementById("toastBody");
  const liveToast = document.getElementById("liveToast");
  if (toastBody && liveToast && typeof bootstrap !== "undefined") {
    toastBody.innerText = message;
    const toast = new bootstrap.Toast(liveToast);
    toast.show();
  }
}

const checkbox = document.getElementById("checkbox");
if (checkbox) {
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
}
