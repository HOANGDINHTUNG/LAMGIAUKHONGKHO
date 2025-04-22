function updateClock() {
  const now = new Date();

  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0"); // tháng bắt đầu từ 0
  const year = now.getFullYear();

  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  const ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12; // nếu 0 => 12

  const formattedTime = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}${ampm}  (GMT +7)`;

  document.getElementById("clock").textContent = formattedTime;
}

setInterval(updateClock, 1000);
updateClock();

// ảnh duy chuyển
const images = [
  "./image/338aba802734b9e0f38961c8263aa6de.jpg",
  "./image/05db3fcd496810d1dc2d602d3ed49387.png",
  "./image/06aa7e4b9bc32580efca9ecf97380143.png",
  "./image/316b7e36212a152b72a6337ed56d8048.png",
  "./image/41c2f49b74a4b1feb30e69e74e63dddc.png",
  "./image/52185d3a200d1c9edccf045f1801a518.png",
  "./image/744d6d78aaa1ea248a4e22131bdc405b.png",
  "./image/86e6a9d0277900c0187165fe47779cee.png",
  "./image/982d8b69eede011ded6cae66b76840f7.png",
  "./image/bd23943aee12bcfb7230b6ae3244b727.jpg",
  "./image/bf03489ec13406fd079e5abf60535be9.jpg",
  "./image/d523c7753c26357df40d2cdba5b01e26.png",
];

let index = 0;
const imgTag = document.getElementById("slideshow");
setInterval(() => {
  index = (index + 1) % images.length;
  imgTag.src = images[index];
}, 2000);

// du chuyển ảnh băng nút
const carousel = document.getElementById("carousel");
const itemsPerPage = 5;
let currentPage = 0;

const totalItems = carousel.children.length;
const totalPages = Math.ceil(totalItems / itemsPerPage);

function slide(direction) {
  currentPage += direction;
  if (currentPage < 0) currentPage = 0;
  if (currentPage >= totalPages) currentPage = totalPages - 1;

  const offset = currentPage * 100;
  carousel.style.transform = `translateX(-${offset}%)`;
}

// Danh sách các hình ảnh số từ 0 đến 9
const imageList = [
  "./image/ball/ball 0.png",
  "./image/ball/ball 1.png",
  "./image/ball/ball 2.png",
  "./image/ball/ball 3.png",
  "./image/ball/ball 4.png",
  "./image/ball/ball 5.png",
  "./image/ball/ball 6.png",
  "./image/ball/ball 7.png",
  "./image/ball/ball 8.png",
  "./image/ball/ball 9.png",
];

// Hàm cập nhật đồng hồ đếm ngược cho từng đối tượng
function startCountdown(timerId, startTime, boxId) {
  let countdownTime = startTime;
  let originalTime = countdownTime;

  // Hàm cập nhật thời gian đồng hồ
  function updateCountdown() {
    const minutes = Math.floor(countdownTime / 60);
    const seconds = countdownTime % 60;

    // Cập nhật giao diện đồng hồ
    document.getElementById(timerId).textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;

    // Nếu thời gian còn lại > 0, tiếp tục đếm ngược
    if (countdownTime > 0) {
      countdownTime--;
    } else {
      // Khi hết thời gian, reset về giá trị ban đầu và thay đổi hình ảnh ngẫu nhiên
      countdownTime = originalTime;
      changeImages(boxId); // Gọi hàm thay đổi hình ảnh cho đồng hồ này
    }
  }

  // Hàm thay đổi hình ảnh ngẫu nhiên từ 0 đến 9
  function changeImages(boxId) {
    const images = document.querySelectorAll(`#${boxId} .ball-img`);
    images.forEach((image) => {
      const randomIndex = Math.floor(Math.random() * imageList.length); // Lấy ngẫu nhiên từ 0-9
      image.src = imageList[randomIndex]; // Thay đổi hình ảnh
    });
    // Tuỳ chọn: Thêm hiệu ứng visual khi hết giờ
    document.getElementById(timerId).style.color = "#f44336";
    setTimeout(() => {
      document.getElementById(timerId).style.color = "#fff"; // Đặt lại màu sau 0.5s
    }, 500);
  }

  // Khởi động đồng hồ cho mỗi đối tượng
  const countdownInterval = setInterval(updateCountdown, 1000);

  // Gọi ngay 1 lần để hiển thị thời gian ban đầu
  updateCountdown();
}

// Khởi tạo các đồng hồ với thời gian khác nhau
startCountdown("timer1", 60, "box1");
startCountdown("timer6", 45, "box6");
startCountdown("timer2", 90, "box2");
startCountdown("timer3", 120, "box3");

// Hàm để bắt đầu đếm ngược
function startCountdowns(timerId, startTime, boxId) {
  let countdownTime = startTime;
  let originalTime = countdownTime;

  // Hàm cập nhật thời gian đồng hồ
  function updateCountdown() {
    const minutes = Math.floor(countdownTime / 60);
    const seconds = countdownTime % 60;

    // Cập nhật giao diện đồng hồ
    document.getElementById(timerId).textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;

    // Nếu thời gian còn lại > 0, tiếp tục đếm ngược
    if (countdownTime > 0) {
      countdownTime--;
    } else {
      // Khi hết thời gian, reset về giá trị ban đầu và thay đổi hình ảnh ngẫu nhiên
      countdownTime = originalTime;
      changeDiceImages(boxId); // Gọi hàm thay đổi hình ảnh xúc xắc
    }
  }

  // Hàm thay đổi hình ảnh xúc xắc ngẫu nhiên và tính toán kết quả
  function changeDiceImages(boxId) {
    const diceImages = document.querySelectorAll(`#${boxId} .dice-img`);
    let diceValues = [];

    // Thay đổi các hình ảnh xúc xắc ngẫu nhiên và lưu giá trị của chúng
    diceImages.forEach((image, index) => {
      const randomValue = Math.floor(Math.random() * 6) + 1; // Giá trị xúc xắc ngẫu nhiên từ 1 đến 6
      diceValues.push(randomValue);

      // Cập nhật ảnh dựa trên giá trị ngẫu nhiên
      image.src = `./image/xucsac/dice (${randomValue}).png`;
    });

    // Tính tổng của ba xúc xắc
    const total = diceValues.reduce((sum, value) => sum + value, 0);

    // Kiểm tra nếu tổng chia hết cho 2 (Tài)
    if (total % 2 === 0) {
      document.querySelector(`#${boxId} .num-btn:nth-child(2)`).textContent = "Tài"; // Hiển thị "Tài"
    } else {
      document.querySelector(`#${boxId} .num-btn:nth-child(2)`).textContent = "Xỉu"; // Hiển thị "Xỉu"
    }

    // Kiểm tra nếu tổng là chẵn (Chẵn)
    if (total % 2 === 0) {
      document.querySelector(`#${boxId} .num-btn:nth-child(3)`).textContent = "Chẵn"; // Hiển thị "Chẵn"
    } else {
      document.querySelector(`#${boxId} .num-btn:nth-child(3)`).textContent = "Lẻ"; // Hiển thị "Lẻ"
    }

    // Cập nhật số tổng vào ô đầu tiên
    document.querySelector(`#${boxId} .num-btn:nth-child(1)`).textContent = total;
  }

  // Khởi động đồng hồ cho mỗi đối tượng
  const countdownInterval = setInterval(updateCountdown, 1000);

  // Gọi ngay 1 lần để hiển thị thời gian ban đầu
  updateCountdown();
}

// Khởi tạo đồng hồ với thời gian là 20 giây
startCountdowns("timer4", 20, "box4");
startCountdowns("timer5", 30, "box5");

// thanh công cụ

function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const toggleIcon = document.getElementById("toggleIcon");

  sidebar.classList.toggle("collapsed");

  // Đổi icon theo trạng thái
  if (sidebar.classList.contains("collapsed")) {
    toggleIcon.classList.remove("fa-angle-double-left");
    toggleIcon.classList.add("fa-angle-double-right");
  } else {
    toggleIcon.classList.remove("fa-angle-double-right");
    toggleIcon.classList.add("fa-angle-double-left");
  }
}

function toggleMenu() {
  const menu = document.getElementById("dropdownMenu");
  menu.style.display = menu.style.display === "flex" ? "none" : "flex";
}

const navItems = document.querySelectorAll(".nav-menu");

navItems.forEach((item) => {
  item.addEventListener("click", () => {
    navItems.forEach((i) => i.classList.remove("active"));
    item.classList.add("active");
  });
});

//QC
const countdownEl = document.getElementById("countdown");
  const miniGameEl = document.getElementById("miniGame");
  let count = 14;

  const countdown = setInterval(() => {
    count--;
    if (count > 0) {
      countdownEl.innerText = count;
    } else {
      clearInterval(countdown);
      countdownEl.innerText = "X";
      countdownEl.style.cursor = "pointer";

      // Thêm sự kiện click để ẩn toàn bộ
      countdownEl.addEventListener("click", () => {
        miniGameEl.style.display = "none";
      });
    }
  }, 1000);
