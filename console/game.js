let elBetMoneyRight = document.querySelector(".el-bet-money-right");
let elBetMoneyLeft = document.querySelector(".el-bet-money-left");
let containerBet = document.querySelector(".container-bet");

const money = document.querySelector(".money");
money.textContent = `${userLogin.assets.toLocaleString()}`;

const username = document.querySelector(".username");
username.textContent = `${userLogin.name}`;

let currentBetSide = null;
const MAX_BET = 9999999999; // Giới hạn tổng số tiền cược

// Ghi nhận bên cược
function showInputBetRight() {
  currentBetSide = "right";
  elBetMoneyRight.innerHTML = `
    <img src="../image/image-game/money.png" class="position-absolute">
    <span></span>
  `;
  elBetMoneyLeft.innerHTML = `
    <img src="../image/image-game/cuoc.png" class="position-absolute">
  `;
  containerBet.style.visibility = "visible";
}

function showInputBetLeft() {
  currentBetSide = "left";
  elBetMoneyLeft.innerHTML = `
    <img src="../image/image-game/money.png" class="position-absolute">
    <span></span>
  `;
  elBetMoneyRight.innerHTML = `
    <img src="../image/image-game/cuoc.png" class="position-absolute">
  `;
  containerBet.style.visibility = "visible";
}

// Xử lý khi click các mệnh giá
const amountButtons = document.querySelectorAll("[data-amount]");
amountButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    if (!currentBetSide) {
      alert("Hãy chọn bên cược trước!");
      return;
    }

    const amount = parseInt(btn.dataset.amount);
    let betDisplay;

    if (currentBetSide === "left") {
      betDisplay = elBetMoneyLeft.querySelector("span");
    } else {
      betDisplay = elBetMoneyRight.querySelector("span");
    }

    let currentAmount = parseInt(betDisplay.textContent.replace(/,/g, "")) || 0;

    if (amount > userLogin.assets) {
      alert("Không đủ tiền để cược số này!");
      return;
    }

    if (currentAmount + amount > MAX_BET) {
      alert("Vượt quá giới hạn cược!");
      return;
    }

    currentAmount += amount;
    betDisplay.textContent = currentAmount.toLocaleString();

    userLogin.assets -= amount;
    money.textContent = userLogin.assets.toLocaleString();
  });
});

// Nút x2
document.querySelector(".btn-bet").addEventListener("click", () => {
  const spanLeft = elBetMoneyLeft.querySelector("span");
  const spanRight = elBetMoneyRight.querySelector("span");

  const betLeft = spanLeft ? parseInt(spanLeft.textContent.replace(/,/g, "")) : 0;
  const betRight = spanRight ? parseInt(spanRight.textContent.replace(/,/g, "")) : 0;

  if (betLeft === 0 && betRight === 0) {
    alert("Bạn chưa đặt cược!");
    return;
  }

  // Xử lý bên Chẵn (Left)
  if (betLeft > 0) {
    const betMainLeft = document.querySelector(".el-bet-main-left span");
    let currentMainLeft = parseInt(betMainLeft.textContent.replace(/,/g, "")) || 0;

    let clone = spanLeft.cloneNode(true);
    clone.style.position = "absolute";
    clone.style.top = "0";
    clone.style.left = "50%";
    clone.style.transform = "translateX(-50%)";
    clone.style.transition = "top 0.5s ease";
    clone.style.zIndex = "10";

    elBetMoneyLeft.appendChild(clone);

    setTimeout(() => {
      clone.style.top = "100px";
    }, 10);

    setTimeout(() => {
      currentMainLeft += betLeft;
      betMainLeft.textContent = currentMainLeft.toLocaleString();
      clone.remove();
      elBetMoneyLeft.innerHTML = `<img src="../image/image-game/cuoc.png" class="position-absolute">`;
    }, 600);
  }

  // Xử lý bên Lẻ (Right)
  if (betRight > 0) {
    const betMainRight = document.querySelector(".el-bet-main-right span");
    let currentMainRight = parseInt(betMainRight.textContent.replace(/,/g, "")) || 0;

    let clone = spanRight.cloneNode(true);
    clone.style.position = "absolute";
    clone.style.top = "0";
    clone.style.left = "50%";
    clone.style.transform = "translateX(-50%)";
    clone.style.transition = "top 0.5s ease";
    clone.style.zIndex = "10";

    elBetMoneyRight.appendChild(clone);

    setTimeout(() => {
      clone.style.top = "100px";
    }, 10);

    setTimeout(() => {
      currentMainRight += betRight;
      betMainRight.textContent = currentMainRight.toLocaleString();
      clone.remove();
      elBetMoneyRight.innerHTML = `<img src="../image/image-game/cuoc.png" class="position-absolute">`;
    }, 600);
  }

  currentBetSide = null;
});

document.querySelector(".btn-bet").addEventListener("click", () => {
  const spanLeft = elBetMoneyLeft.querySelector("span");
  const spanRight = elBetMoneyRight.querySelector("span");

  const betLeft = spanLeft ? parseInt(spanLeft.textContent.replace(/,/g, "")) : 0;
  const betRight = spanRight ? parseInt(spanRight.textContent.replace(/,/g, "")) : 0;

  if (betLeft === 0 && betRight === 0) {
    alert("Bạn chưa đặt cược!");
    return;
  }

  // Cộng dồn bên Chẵn (Left)
  if (betLeft > 0) {
    const betMainLeft = document.querySelector(".el-bet-main-left span");
    let currentMainLeft = parseInt(betMainLeft.textContent.replace(/,/g, "")) || 0;

    let clone = spanLeft.cloneNode(true);
    clone.style.position = "absolute";
    clone.style.top = "0";
    clone.style.left = "50%";
    clone.style.transform = "translateX(-50%)";
    clone.style.transition = "top 0.5s ease";
    clone.style.zIndex = "10";

    elBetMoneyLeft.appendChild(clone);

    setTimeout(() => {
      clone.style.top = "100px";
    }, 10);

    setTimeout(() => {
      betMainLeft.textContent = (currentMainLeft + betLeft).toLocaleString();
      clone.remove();
      elBetMoneyLeft.innerHTML = `<img src="../image/image-game/cuoc.png" class="position-absolute">`;
    }, 600);
  }

  // Cộng dồn bên Lẻ (Right)
  if (betRight > 0) {
    const betMainRight = document.querySelector(".el-bet-main-right span");
    let currentMainRight = parseInt(betMainRight.textContent.replace(/,/g, "")) || 0;

    let clone = spanRight.cloneNode(true);
    clone.style.position = "absolute";
    clone.style.top = "0";
    clone.style.left = "50%";
    clone.style.transform = "translateX(-50%)";
    clone.style.transition = "top 0.5s ease";
    clone.style.zIndex = "10";

    elBetMoneyRight.appendChild(clone);

    setTimeout(() => {
      clone.style.top = "100px";
    }, 10);

    setTimeout(() => {
      betMainRight.textContent = (currentMainRight + betRight).toLocaleString();
      clone.remove();
      elBetMoneyRight.innerHTML = `<img src="../image/image-game/cuoc.png" class="position-absolute">`;
    }, 600);
  }

  currentBetSide = null;
});


document.querySelector(".btn-cancel").addEventListener("click", () => {
  let refund = 0;

  // Lấy các phần tử hiển thị số tiền cược ở bên trái và bên phải
  const spanLeft = elBetMoneyLeft.querySelector("span");
  const spanRight = elBetMoneyRight.querySelector("span");

  // Tính tổng số tiền cược nếu có
  if (spanLeft && spanLeft.textContent) {
    refund += parseInt(spanLeft.textContent.replace(/,/g, "")) || 0;
  }

  if (spanRight && spanRight.textContent) {
    refund += parseInt(spanRight.textContent.replace(/,/g, "")) || 0;
  }

  // Hoàn lại số tiền cược vào tài khoản người dùng
  userLogin.assets += refund;
  money.textContent = userLogin.assets.toLocaleString(); // Cập nhật số dư tài khoản

  // Xóa tiền cược trên giao diện (thay ảnh hoặc nội dung khác)
  elBetMoneyLeft.innerHTML = `<img src="../image/image-game/cuoc.png" class="position-absolute">`;
  elBetMoneyRight.innerHTML = `<img src="../image/image-game/cuoc.png" class="position-absolute">`;

  // Reset lại trạng thái cược bên trái và bên phải
  currentBetSide = null;

  alert(`Số tiền cược đã được hoàn lại: ${refund.toLocaleString()} đồng.`);
});


// // Lấy phần tử đồng hồ đếm ngược
// const countdownElement = document.getElementById('countdown');

// // Đặt số giây ban đầu
// let timeLeft = 10;

// // Hàm cập nhật thời gian mỗi giây
// const countdownTimer = setInterval(() => {
//   // Cập nhật hiển thị thời gian
//   countdownElement.textContent = timeLeft;

//   // Giảm số giây
//   timeLeft--;

//   // Dừng đếm ngược khi hết thời gian
//   if (timeLeft < 0) {
//     clearInterval(countdownTimer);
//     countdownElement.textContent = "0";
//   }
// }, 1000);


// Thời gian đếm ngược
let timeLeft = 10; // 60 giây
const countdownElement = document.querySelector('.countdown-timer');
const plateElement = document.querySelector('.el-plate-open');

// Hàm cập nhật đồng hồ đếm ngược
function updateCountdown() {
  if (timeLeft > 0) {
    countdownElement.textContent = timeLeft;
    timeLeft--;
  } else {
    countdownElement.textContent = "0";
    // Khi hết thời gian, hiển thị dĩa trắng và xúc xắc
    plateElement.style.display = 'flex';
    setTimeout(() => {
      plateElement.style.opacity = '1';
      rollDice(); // Cuộn xúc xắc
    }, 500);
  }
}

// Hàm cuộn xúc xắc (tạo số ngẫu nhiên)
function rollDice() {
  const dice1 = document.getElementById('dice-1');
  const dice2 = document.getElementById('dice-2');
  const dice3 = document.getElementById('dice-3');

  const dice1Value = Math.floor(Math.random() * 6) + 1;
  const dice2Value = Math.floor(Math.random() * 6) + 1;
  const dice3Value = Math.floor(Math.random() * 6) + 1;

  dice1.textContent = dice1Value;
  dice2.textContent = dice2Value;
  dice3.textContent = dice3Value;
}

// Khởi động đồng hồ đếm ngược
setInterval(updateCountdown, 1000);

