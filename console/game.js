/* ========================================================
   TÀI XỈU - GAME LOGIC & SYSTEM CONTROLLER
   LÀM GIÀU KHÔNG KHÓ - VERSION 2.0 (HOÀN THIỆN)
   ======================================================== */

// 1. Quản lý Đăng Nhập & Số Dư Người Chơi
let userLogin = null;
try {
  userLogin = JSON.parse(localStorage.getItem("userLogin"));
} catch (e) {
  userLogin = null;
}

// Nếu chưa đăng nhập, tự động tạo tài khoản trải nghiệm
if (!userLogin) {
  userLogin = {
    name: "Đại_Gia_" + Math.floor(100 + Math.random() * 900),
    assets: 5000000,
    role: "USER"
  };
  localStorage.setItem("userLogin", JSON.stringify(userLogin));
} else {
  userLogin.assets = parseInt(userLogin.assets) || 1000000;
}

function saveUserBalance() {
  localStorage.setItem("userLogin", JSON.stringify(userLogin));
  try {
    let userList = JSON.parse(localStorage.getItem("userList")) || [];
    let idx = userList.findIndex((u) => u.name === userLogin.name);
    if (idx !== -1) {
      userList[idx].assets = userLogin.assets;
      localStorage.setItem("userList", JSON.stringify(userList));
    }
  } catch (e) {
    console.error("Lỗi khi đồng bộ danh sách người dùng:", e);
  }
}

// Cập nhật thông tin giao diện người chơi
const moneyEl = document.querySelector(".money");
const usernameEl = document.querySelector(".username");
function updateBalanceDisplay() {
  if (moneyEl) moneyEl.textContent = userLogin.assets.toLocaleString() + " đ";
  if (usernameEl) usernameEl.textContent = userLogin.name;
}
updateBalanceDisplay();

// 2. Trạng Thái Cược & Khởi Tạo Vòng Chơi Chuẩn (Persistence & Realtime Sync)
const BET_DURATION = 60;   // 60 giây đặt cược
const ROLL_DURATION = 2;    // 2 giây xóc đĩa
const RESULT_DURATION = 6;  // 6 giây hiển thị xúc xắc & trả thưởng
const CYCLE_DURATION = BET_DURATION + ROLL_DURATION + RESULT_DURATION; // 68s chu kỳ toàn ván

let currentBetSide = null; // 'left' (TÀI) hoặc 'right' (XỈU)
let tempBetLeft = 0;       // Tiền cược tạm TÀI
let tempBetRight = 0;      // Tiền cược tạm XỈU
let confirmedBetLeft = 0;  // Tiền cược chính thức TÀI ván này
let confirmedBetRight = 0; // Tiền cược chính thức XỈU ván này
let isBettingLocked = false;
let isRolling = false;
let timeLeft = BET_DURATION;

const elBetMoneyLeft = document.querySelector(".el-bet-money-left");
const elBetMoneyRight = document.querySelector(".el-bet-money-right");
const elBetMainLeft = document.querySelector(".el-bet-main-left span");
const elBetMainRight = document.querySelector(".el-bet-main-right span");
const userBetLeftEl = document.getElementById("userBetLeft");
const userBetRightEl = document.getElementById("userBetRight");
const roomBetLeftEl = document.getElementById("roomBetLeft");
const roomBetRightEl = document.getElementById("roomBetRight");
const playerCountLeftEl = document.getElementById("playerCountLeft");
const playerCountRightEl = document.getElementById("playerCountRight");
const sessionIdBadgeEl = document.getElementById("sessionIdBadge");
const beadsTrackEl = document.getElementById("beadsTrack");
const md5HashEl = document.getElementById("md5Hash");
const diceContainerEl = document.getElementById("diceContainer");
const containerBet = document.querySelector(".container-bet");
const elEven = document.querySelector(".el-even");
const elOdd = document.querySelector(".el-odd");
const gameStatusBadge = document.getElementById("gameStatusBadge");
const countdownElement = document.getElementById("countdown");
const bowlElement = document.getElementById("bowl");
const floatingWin = document.getElementById("floatingWin");
const dice1El = document.getElementById("dice-1");
const dice2El = document.getElementById("dice-2");
const dice3El = document.getElementById("dice-3");

// Thống kê phòng cược bắt đầu từ 0 cho mỗi ván
let roomBetTai = 0;
let roomBetXiu = 0;
let playersTai = 0;
let playersXiu = 0;
let isNanMode = false;
try {
  isNanMode = localStorage.getItem("tx_isNanMode") === "true";
} catch (e) {
  isNanMode = false;
}

// Đối tượng lưu trạng thái ván chơi hiện tại
let currentRound = null;

// Lưu trữ & Tải lịch sử ván cược
function loadGameHistory() {
  try {
    const saved = localStorage.getItem("tx_gameHistory");
    if (saved) {
      const arr = JSON.parse(saved);
      if (Array.isArray(arr)) return arr;
    }
  } catch (e) {}
  return [];
}
let gameHistory = loadGameHistory();

function saveGameHistory() {
  try {
    localStorage.setItem("tx_gameHistory", JSON.stringify(gameHistory));
  } catch (e) {}
}

function loadBeadHistory() {
  try {
    const saved = localStorage.getItem("tx_beadHistory");
    if (saved) {
      const arr = JSON.parse(saved);
      if (Array.isArray(arr) && arr.length > 0) return arr;
    }
  } catch (e) {}
  return [
    "xiu", "tai", "tai", "xiu", "xiu", "xiu", "xiu",
    "tai", "xiu", "xiu", "xiu", "tai", "tai",
    "xiu", "tai", "xiu", "tai", "tai"
  ];
}
let beadHistory = loadBeadHistory();

function saveBeadHistory() {
  try {
    localStorage.setItem("tx_beadHistory", JSON.stringify(beadHistory));
  } catch (e) {}
}

function renderBeads() {
  if (!beadsTrackEl) return;
  beadsTrackEl.innerHTML = "";
  beadHistory.forEach((type, index) => {
    const bead = document.createElement("div");
    const isLatest = index === beadHistory.length - 1;
    bead.className = `bead-item ${type}${isLatest ? " latest" : ""}`;
    bead.title = `Ván ${index + 1}: ${type === "tai" ? "TÀI (Chấm Đen)" : "XỈU (Chấm Trắng)"}`;
    bead.onclick = () => {
      showToast(`Kết quả ván cũ: ${type === "tai" ? "TÀI (Chấm Đen)" : "XỈU (Chấm Trắng)"}`);
    };
    beadsTrackEl.appendChild(bead);
  });
}
renderBeads();

function updateRoomStats() {
  if (roomBetLeftEl) roomBetLeftEl.textContent = roomBetTai.toLocaleString();
  if (roomBetRightEl) roomBetRightEl.textContent = roomBetXiu.toLocaleString();
  if (playerCountLeftEl) playerCountLeftEl.textContent = playersTai.toLocaleString();
  if (playerCountRightEl) playerCountRightEl.textContent = playersXiu.toLocaleString();
}

// 1.1 Quản lý Giờ Vàng Cao Điểm (19h-21h tối, 11h-12h trưa & 23h-24h đêm)
let isManualPeakMode = null; // null = tự động theo giờ hệ thống; true/false = ép bật/tắt để thử nghiệm
try {
  const urlParam = new URLSearchParams(window.location.search).get("peak");
  if (urlParam === "1" || urlParam === "true") isManualPeakMode = true;
  else if (urlParam === "0" || urlParam === "false") isManualPeakMode = false;
} catch (e) {}

function isPeakHourActive() {
  if (isManualPeakMode !== null) return isManualPeakMode;
  const currentHour = new Date().getHours();
  // Khung 1: 19h - 21h tối (19:00 -> 20:59)
  const isNightPeak = currentHour >= 19 && currentHour < 21;
  // Khung 2: 11h - 12h trưa (11:00 -> 11:59)
  const isNoonPeak = currentHour >= 11 && currentHour < 12;
  // Khung 3: 23h - 24h đêm (23:00 -> 23:59)
  const isMidnightPeak = currentHour === 23 || currentHour === 0;

  return isNightPeak || isNoonPeak || isMidnightPeak;
}

function updatePeakHourUI() {
  const badge = document.getElementById("peakHoursBadge");
  const isPeak = isPeakHourActive();
  if (badge) {
    badge.style.display = isPeak ? "flex" : "none";
  }
}

function togglePeakMode() {
  const current = isPeakHourActive();
  isManualPeakMode = !current;
  updatePeakHourUI();
  showToast(
    isManualPeakMode
      ? "🔥 ĐÃ KÍCH HOẠT: GIỜ VÀNG CAO ĐIỂM (Cược lớn & Chat bùng nổ)!"
      : "Đã chuyển về chế độ Giờ Thường."
  );
}
window.togglePeakMode = togglePeakMode;

// Sinh số người ngẫu nhiên cho 2 bên luôn bám sát nhau (ngang ngang nhau)
// Giờ vàng: 50 - 250 người/s | Giờ thường: 1 - 100 người/s
function generateBalancedPlayers(currentTai, currentXiu) {
  const isPeak = isPeakHourActive();
  const diff = currentTai - currentXiu; // > 0 nếu Tài nhiều hơn, < 0 nếu Xỉu nhiều hơn

  const minP = isPeak ? 50 : 1;
  const maxP = isPeak ? 250 : 100;
  const base = isPeak
    ? (Math.floor(Math.random() * 160) + 65)  // 65 đến 225
    : (Math.floor(Math.random() * 90) + 6);   // 6 đến 95

  const pull = Math.round(diff * 0.42);
  const jitter = Math.floor(Math.random() * (isPeak ? 15 : 7)) - (isPeak ? 7 : 3);

  let addTai = Math.round(base - pull / 2) - jitter;
  let addXiu = Math.round(base + pull / 2) + jitter;

  addTai = Math.max(minP, Math.min(maxP, addTai));
  addXiu = Math.max(minP, Math.min(maxP, addXiu));

  return { addTai, addXiu };
}

// Sinh số tiền cược ngẫu nhiên cho 2 bên luôn bám sát nhau (ngang ngang nhau)
// Giờ vàng: 50.000.000 - 300.000.000 đ/s | Giờ thường: 1.000.000 - 100.000.000 đ/s
function generateBalancedMoney(currentBetTai, currentBetXiu) {
  const isPeak = isPeakHourActive();
  const minMoney = isPeak ? 50000000 : 1000000;
  const maxMoney = isPeak ? 300000000 : 100000000;
  const step = isPeak ? 500000 : 100000;

  const diff = currentBetTai - currentBetXiu;
  const baseMoney = isPeak
    ? (Math.floor(Math.random() * 210) + 60) * 1000000 + Math.floor(Math.random() * 10) * 100000
    : (Math.floor(Math.random() * 85) + 6) * 1000000 + Math.floor(Math.random() * 10) * 100000;

  const pull = Math.round((diff * 0.35) / step) * step;
  const jitter = (Math.floor(Math.random() * 11) - 5) * (isPeak ? 1000000 : 500000);

  let addTai = baseMoney - Math.round(pull / 2) - jitter;
  let addXiu = baseMoney + Math.round(pull / 2) + jitter;

  addTai = Math.max(minMoney, Math.min(maxMoney, Math.round(addTai / step) * step));
  addXiu = Math.max(minMoney, Math.min(maxMoney, Math.round(addXiu / step) * step));

  return { addBetTai: addTai, addBetXiu: addXiu };
}

// Hàm tăng chỉ số phòng cược ngẫu nhiên nhưng giữ 2 bên ngang nhau
function stepRoomStats() {
  const { addTai, addXiu } = generateBalancedPlayers(playersTai, playersXiu);
  const { addBetTai, addBetXiu } = generateBalancedMoney(roomBetTai, roomBetXiu);
  playersTai += addTai;
  playersXiu += addXiu;
  roomBetTai += addBetTai;
  roomBetXiu += addBetXiu;
}

// Tạo chuỗi MD5 ngẫu nhiên 36 ký tự
function generateMd5String() {
  const chars = "0123456789abcdef";
  let hash = "";
  for (let i = 0; i < 36; i++) {
    hash += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return hash;
}

// Sao chép chuỗi MD5
function copyMd5() {
  const hashText = md5HashEl ? md5HashEl.textContent.trim() : "";
  if (!hashText) return;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(hashText).then(() => {
      showToast("Đã sao chép chuỗi MD5 thành công!");
    }).catch(() => {
      fallbackCopy(hashText);
    });
  } else {
    fallbackCopy(hashText);
  }
}

function fallbackCopy(text) {
  const ta = document.createElement("textarea");
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand("copy");
    showToast("Đã sao chép chuỗi MD5 thành công!");
  } catch (e) {
    showToast("Không thể sao chép chuỗi MD5!");
  }
  ta.remove();
}

// Nút bàn tay nặn đĩa: chuyển đổi qua lại giữa 2 trạng thái và đổi icon ảnh
function updateNanUI() {
  const handBtn = document.querySelector(".btn-hand");
  const handImg = document.getElementById("handImg") || (handBtn ? handBtn.querySelector("img") : null);
  if (handBtn) {
    handBtn.classList.toggle("active", isNanMode);
    handBtn.title = isNanMode ? "Chế độ Nặn: ĐANG BẬT (bấm để tắt)" : "Chế độ Nặn: ĐANG TẮT (bấm để bật)";
  }
  if (handImg) {
    handImg.src = isNanMode ? "../image/image-game/hand.png" : "../image/image-game/hand-delete.png";
  }
}

function toggleNan() {
  isNanMode = !isNanMode;
  try {
    localStorage.setItem("tx_isNanMode", isNanMode ? "true" : "false");
  } catch (e) {}
  updateNanUI();
  showToast(isNanMode ? "Chế độ Nặn Bát: ĐÃ BẬT" : "Chế độ Nặn Bát: ĐÃ TẮT");
}
updateNanUI();

// Lưu trạng thái ván vào localStorage để khi F5 / reload không bao giờ bị mất tiền hoặc reset về 60s
function saveRoundState() {
  if (!currentRound) return;
  try {
    currentRound.roomBetTai = roomBetTai;
    currentRound.roomBetXiu = roomBetXiu;
    currentRound.playersTai = playersTai;
    currentRound.playersXiu = playersXiu;
    currentRound.confirmedBetLeft = confirmedBetLeft;
    currentRound.confirmedBetRight = confirmedBetRight;
    currentRound.tempBetLeft = tempBetLeft;
    currentRound.tempBetRight = tempBetRight;
    currentRound.currentBetSide = currentBetSide;
    currentRound.lastSavedTime = Date.now();
    localStorage.setItem("tx_active_round", JSON.stringify(currentRound));
  } catch (e) {
    console.error("Lỗi khi lưu tx_active_round:", e);
  }
}

// Tạo một ván cược mới hoàn toàn (tiền và người chơi bắt đầu từ 0 và tăng dần độc lập)
function createNewRound(startTime = Date.now()) {
  const d1 = Math.floor(Math.random() * 6) + 1;
  const d2 = Math.floor(Math.random() * 6) + 1;
  const d3 = Math.floor(Math.random() * 6) + 1;
  const newRoundId = `#XOSO66-${Math.floor(2610220000 + Math.random() * 99999)}`;
  const newMd5 = generateMd5String();

  currentRound = {
    roundId: newRoundId,
    md5Hash: newMd5,
    startTime: startTime,
    dices: [d1, d2, d3],
    roomBetTai: 0,
    roomBetXiu: 0,
    playersTai: 0,
    playersXiu: 0,
    confirmedBetLeft: 0,
    confirmedBetRight: 0,
    tempBetLeft: 0,
    tempBetRight: 0,
    currentBetSide: null,
    isSettled: false
  };

  roomBetTai = 0;
  roomBetXiu = 0;
  playersTai = 0;
  playersXiu = 0;
  confirmedBetLeft = 0;
  confirmedBetRight = 0;
  tempBetLeft = 0;
  tempBetRight = 0;
  currentBetSide = null;
  isRolling = false;
  isBettingLocked = false;

  saveRoundState();
}

// Chọn cửa TÀI (Left)
function showInputBetLeft() {
  if (isBettingLocked || timeLeft <= 5) {
    showToast("Đã khóa cược (5 giây cuối), vui lòng chờ kết quả!");
    return;
  }
  currentBetSide = "left";
  elEven.classList.add("active");
  elOdd.classList.remove("active");

  elBetMoneyLeft.innerHTML = `
    <img src="../image/image-game/money.png">
    <span>${tempBetLeft > 0 ? tempBetLeft.toLocaleString() : ""}</span>
  `;
  if (tempBetRight === 0) {
    elBetMoneyRight.innerHTML = `<img src="../image/image-game/cuoc.png"><span></span>`;
  }
  saveRoundState();
}

// Chọn cửa XỈU (Right)
function showInputBetRight() {
  if (isBettingLocked || timeLeft <= 5) {
    showToast("Đã khóa cược (5 giây cuối), vui lòng chờ kết quả!");
    return;
  }
  currentBetSide = "right";
  elOdd.classList.add("active");
  elEven.classList.remove("active");

  elBetMoneyRight.innerHTML = `
    <img src="../image/image-game/money.png">
    <span>${tempBetRight > 0 ? tempBetRight.toLocaleString() : ""}</span>
  `;
  if (tempBetLeft === 0) {
    elBetMoneyLeft.innerHTML = `<img src="../image/image-game/cuoc.png"><span></span>`;
  }
  saveRoundState();
}

// Chọn mệnh giá phỉnh tiền
const amountButtons = document.querySelectorAll("[data-amount]");
amountButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    if (isBettingLocked || timeLeft <= 5) {
      showToast("Đã khóa cược (5 giây cuối), không thể đặt cược!");
      return;
    }
    if (!currentBetSide) {
      showToast("Vui lòng nhấp chọn cửa TÀI hoặc XỈU trước!");
      return;
    }

    const amount = parseInt(btn.dataset.amount);
    if (userLogin.assets < amount) {
      showToast("Số dư tài khoản không đủ!");
      return;
    }

    userLogin.assets -= amount;
    saveUserBalance();
    updateBalanceDisplay();

    if (currentBetSide === "left") {
      tempBetLeft += amount;
      const span = elBetMoneyLeft.querySelector("span");
      if (span) span.textContent = tempBetLeft.toLocaleString();
    } else {
      tempBetRight += amount;
      const span = elBetMoneyRight.querySelector("span");
      if (span) span.textContent = tempBetRight.toLocaleString();
    }
    saveRoundState();
  });
});

// Nút nhân đôi cược (X2)
function doubleBet() {
  if (isBettingLocked || timeLeft <= 5) {
    showToast("Đã khóa cược (5 giây cuối)!");
    return;
  }
  if (!currentBetSide) return;
  const currentTemp = currentBetSide === "left" ? tempBetLeft : tempBetRight;
  if (currentTemp === 0) {
    showToast("Vui lòng chọn tiền cược trước khi nhân đôi!");
    return;
  }
  if (userLogin.assets < currentTemp) {
    showToast("Số dư không đủ để nhân đôi!");
    return;
  }

  userLogin.assets -= currentTemp;
  saveUserBalance();
  updateBalanceDisplay();

  if (currentBetSide === "left") {
    tempBetLeft += currentTemp;
    const span = elBetMoneyLeft.querySelector("span");
    if (span) span.textContent = tempBetLeft.toLocaleString();
  } else {
    tempBetRight += currentTemp;
    const span = elBetMoneyRight.querySelector("span");
    if (span) span.textContent = tempBetRight.toLocaleString();
  }
  saveRoundState();
}

// Nút xác nhận Đặt cược (.btn-bet)
function confirmBet() {
  if (isBettingLocked || timeLeft <= 5) {
    showToast("Đã khóa cược (5 giây cuối), vui lòng chờ kết quả!");
    return;
  }
  if (tempBetLeft === 0 && tempBetRight === 0) {
    showToast("Bạn chưa chọn số tiền cược!");
    return;
  }

  // Animation phỉnh tiền bay lên bàn cược TÀI
  if (tempBetLeft > 0) {
    const spanLeft = elBetMoneyLeft.querySelector("span");
    if (spanLeft) {
      animateChipFly(elBetMoneyLeft, spanLeft, () => {
        confirmedBetLeft += tempBetLeft;
        if (userBetLeftEl) userBetLeftEl.textContent = confirmedBetLeft.toLocaleString();
        if (elBetMainLeft) elBetMainLeft.textContent = confirmedBetLeft.toLocaleString();
        tempBetLeft = 0;
        elBetMoneyLeft.innerHTML = `<img src="../image/image-game/cuoc.png"><span></span>`;
        saveRoundState();
      });
    } else {
      confirmedBetLeft += tempBetLeft;
      if (userBetLeftEl) userBetLeftEl.textContent = confirmedBetLeft.toLocaleString();
      if (elBetMainLeft) elBetMainLeft.textContent = confirmedBetLeft.toLocaleString();
      tempBetLeft = 0;
      elBetMoneyLeft.innerHTML = `<img src="../image/image-game/cuoc.png"><span></span>`;
      saveRoundState();
    }
    roomBetTai += tempBetLeft;
    if (confirmedBetLeft === 0) playersTai += 1;
  }

  // Animation phỉnh tiền bay lên bàn cược XỈU
  if (tempBetRight > 0) {
    const spanRight = elBetMoneyRight.querySelector("span");
    if (spanRight) {
      animateChipFly(elBetMoneyRight, spanRight, () => {
        confirmedBetRight += tempBetRight;
        if (userBetRightEl) userBetRightEl.textContent = confirmedBetRight.toLocaleString();
        if (elBetMainRight) elBetMainRight.textContent = confirmedBetRight.toLocaleString();
        tempBetRight = 0;
        elBetMoneyRight.innerHTML = `<img src="../image/image-game/cuoc.png"><span></span>`;
        saveRoundState();
      });
    } else {
      confirmedBetRight += tempBetRight;
      if (userBetRightEl) userBetRightEl.textContent = confirmedBetRight.toLocaleString();
      if (elBetMainRight) elBetMainRight.textContent = confirmedBetRight.toLocaleString();
      tempBetRight = 0;
      elBetMoneyRight.innerHTML = `<img src="../image/image-game/cuoc.png"><span></span>`;
      saveRoundState();
    }
    roomBetXiu += tempBetRight;
    if (confirmedBetRight === 0) playersXiu += 1;
  }

  updateRoomStats();
  saveUserBalance();
  currentBetSide = null;
  elEven.classList.remove("active");
  elOdd.classList.remove("active");
  saveRoundState();
  showToast("Đặt cược thành công!");
}

function animateChipFly(container, spanElem, callback) {
  let clone = spanElem.cloneNode(true);
  clone.style.position = "absolute";
  clone.style.top = "0";
  clone.style.left = "50%";
  clone.style.transform = "translateX(-50%)";
  clone.style.transition = "top 0.4s ease, opacity 0.4s ease";
  clone.style.zIndex = "20";
  container.appendChild(clone);

  setTimeout(() => {
    clone.style.top = "-70px";
    clone.style.opacity = "0.7";
  }, 10);

  setTimeout(() => {
    clone.remove();
    if (callback) callback();
  }, 420);
}

// Nút Hủy cược (.btn-cancel hoặc .btn-hand-delete)
function cancelBet() {
  if (isBettingLocked || timeLeft <= 5) {
    showToast("Đã khóa cược (5 giây cuối), không thể hủy lúc này!");
    return;
  }
  if (tempBetLeft === 0 && tempBetRight === 0) {
    if (confirmedBetLeft > 0 || confirmedBetRight > 0) {
      showToast("Tiền cược đã vào bàn, không thể hủy khi ván đang diễn ra!");
    } else {
      showToast("Không có tiền cược tạm nào để hủy!");
    }
    return;
  }

  const refund = tempBetLeft + tempBetRight;
  userLogin.assets += refund;
  saveUserBalance();
  updateBalanceDisplay();

  tempBetLeft = 0;
  tempBetRight = 0;
  currentBetSide = null;
  saveRoundState();

  elBetMoneyLeft.innerHTML = `<img src="../image/image-game/cuoc.png"><span></span>`;
  elBetMoneyRight.innerHTML = `<img src="../image/image-game/cuoc.png"><span></span>`;
  elEven.classList.remove("active");
  elOdd.classList.remove("active");

  showToast(`Đã hủy cược và hoàn lại ${refund.toLocaleString()} đ!`);
}

// Tự động gom tiền cược tạm nếu người chơi quên bấm xác nhận khi hết giờ
function autoConfirmTempBets() {
  if (tempBetLeft > 0 || tempBetRight > 0) {
    if (tempBetLeft > 0) {
      roomBetTai += tempBetLeft;
      if (confirmedBetLeft === 0) playersTai += 1;
      confirmedBetLeft += tempBetLeft;
      tempBetLeft = 0;
    }
    if (tempBetRight > 0) {
      roomBetXiu += tempBetRight;
      if (confirmedBetRight === 0) playersXiu += 1;
      confirmedBetRight += tempBetRight;
      tempBetRight = 0;
    }
    updateRoomStats();

    if (userBetLeftEl) userBetLeftEl.textContent = confirmedBetLeft.toLocaleString();
    if (userBetRightEl) userBetRightEl.textContent = confirmedBetRight.toLocaleString();
    if (elBetMainLeft) elBetMainLeft.textContent = confirmedBetLeft.toLocaleString();
    if (elBetMainRight) elBetMainRight.textContent = confirmedBetRight.toLocaleString();
    elBetMoneyLeft.innerHTML = `<img src="../image/image-game/cuoc.png"><span></span>`;
    elBetMoneyRight.innerHTML = `<img src="../image/image-game/cuoc.png"><span></span>`;

    saveUserBalance();
    saveRoundState();
  }
}

// Xử lý tính thưởng và lưu lịch sử cho một ván cược
function settleRound(round) {
  if (!round || round.isSettled) return;
  round.isSettled = true;

  // Tự động gom tiền cược tạm nếu còn sót
  if (round.tempBetLeft > 0) {
    round.confirmedBetLeft = (round.confirmedBetLeft || 0) + round.tempBetLeft;
    round.tempBetLeft = 0;
  }
  if (round.tempBetRight > 0) {
    round.confirmedBetRight = (round.confirmedBetRight || 0) + round.tempBetRight;
    round.tempBetRight = 0;
  }

  const [d1, d2, d3] = round.dices;
  const totalScore = d1 + d2 + d3;
  const isTai = totalScore >= 11;
  const resultGateName = isTai ? "TÀI" : "XỈU";

  // Thêm vào rãnh hạt nút nhỏ đen trắng & lịch sử
  beadHistory.push(isTai ? "tai" : "xiu");
  if (beadHistory.length > 18) beadHistory.shift();
  renderBeads();
  saveBeadHistory();

  gameHistory.unshift({
    score: totalScore,
    gate: resultGateName,
    dices: [d1, d2, d3],
    time: new Date().toLocaleTimeString()
  });
  if (gameHistory.length > 30) gameHistory.pop();
  saveGameHistory();

  // Tính tiền thắng cược (Tỷ lệ 1 ăn 2)
  let winAmount = 0;
  if (isTai && (round.confirmedBetLeft > 0 || confirmedBetLeft > 0)) {
    const bet = Math.max(round.confirmedBetLeft || 0, confirmedBetLeft || 0);
    winAmount = bet * 2;
  } else if (!isTai && (round.confirmedBetRight > 0 || confirmedBetRight > 0)) {
    const bet = Math.max(round.confirmedBetRight || 0, confirmedBetRight || 0);
    winAmount = bet * 2;
  }

  if (winAmount > 0) {
    userLogin.assets += winAmount;
    saveUserBalance();
    updateBalanceDisplay();
    if (floatingWin) {
      floatingWin.textContent = `+${winAmount.toLocaleString()} đ`;
      floatingWin.style.display = "block";
      floatingWin.classList.remove("floating-anim");
      void floatingWin.offsetWidth;
      floatingWin.classList.add("floating-anim");
    }
    showToast(`Chúc mừng! Bạn cược ${resultGateName} đã thắng +${winAmount.toLocaleString()} đ!`);
  }

  addChatMessage(
    "HỆ THỐNG",
    `Ván ${round.roundId}: ${resultGateName} (${totalScore} nút: ${d1}-${d2}-${d3}).`,
    "system"
  );

  saveRoundState();
}

// Bắt đầu quá trình xóc đĩa
function startRollDiceProcess() {
  if (isRolling) return;
  isRolling = true;
  isBettingLocked = true;

  if (countdownElement) {
    countdownElement.classList.remove("time-end", "pop-in");
    countdownElement.style.display = "none"; // Ẩn số đếm ngược khi xóc bát
  }
  if (gameStatusBadge) gameStatusBadge.textContent = "ĐÃ KHÓA CƯỢC - ĐANG XÓC BÁT";

  autoConfirmTempBets();

  // Dĩa trắng xuất hiện và rung lắc mạnh
  bowlElement.classList.remove("open", "covering");
  bowlElement.classList.add("shaking");

  // Hiện khung xúc xắc và bắt đầu xoay chuyển
  if (diceContainerEl) diceContainerEl.style.display = "flex";
  const diceItems = document.querySelectorAll(".dice-item");
  diceItems.forEach((d) => d.classList.add("rolling"));

  // Hiệu ứng đổi mặt xúc xắc ngẫu nhiên liên tục lúc đang xóc
  let shuffleInterval = setInterval(() => {
    let r1 = Math.floor(Math.random() * 6) + 1;
    let r2 = Math.floor(Math.random() * 6) + 1;
    let r3 = Math.floor(Math.random() * 6) + 1;
    dice1El.src = `../image/image-game/dor${r1}.png`;
    dice2El.src = `../image/image-game/dor${r2}.png`;
    dice3El.src = `../image/image-game/dor${r3}.png`;
  }, 90);

  setTimeout(() => {
    clearInterval(shuffleInterval);
    revealResult(true);
  }, ROLL_DURATION * 1000);
}

// Mở bát và hiển thị kết quả xúc xắc
function revealResult(scheduleNext = true) {
  bowlElement.classList.remove("shaking", "covering");
  bowlElement.classList.add("open");
  const diceItems = document.querySelectorAll(".dice-item");
  diceItems.forEach((d) => d.classList.remove("rolling"));

  const [d1, d2, d3] = currentRound.dices;
  dice1El.src = `../image/image-game/dor${d1}.png`;
  dice2El.src = `../image/image-game/dor${d2}.png`;
  dice3El.src = `../image/image-game/dor${d3}.png`;

  if (gameStatusBadge) gameStatusBadge.textContent = "KẾT QUẢ VÁN ĐẤU";

  const totalScore = d1 + d2 + d3;
  const isTai = totalScore >= 11;
  if (isTai) {
    elEven.classList.add("winner");
    elOdd.classList.remove("winner");
  } else {
    elOdd.classList.add("winner");
    elEven.classList.remove("winner");
  }

  settleRound(currentRound);

  if (scheduleNext) {
    setTimeout(() => {
      startNextRound();
    }, RESULT_DURATION * 1000);
  }
}

// Bắt đầu ván mới sau khi ván cũ kết thúc: dĩa trắng úp lên trên che xúc xắc và bắt đầu đếm số
function startNextRound() {
  // 1. Dọn dẹp trạng thái kết quả cũ
  if (floatingWin) floatingWin.style.display = "none";
  elEven.classList.remove("winner", "active");
  elOdd.classList.remove("winner", "active");

  // 2. Dĩa trắng úp xuống trên mặt đĩa đen che 3 viên xúc xắc lại (xúc xắc vẫn giữ display flex để dĩa úp tự nhiên che đi)
  bowlElement.classList.remove("open", "shaking");
  bowlElement.classList.add("covering");

  // Ẩn số đếm ngược trong thời gian dĩa đang di chuyển úp xuống
  if (countdownElement) {
    countdownElement.style.display = "none";
    countdownElement.classList.remove("time-end", "pop-in");
  }

  // 3. Sau khi dĩa trắng úp hoàn toàn xuống (khoảng 500ms):
  setTimeout(() => {
    // Ẩn xúc xắc bên dưới dĩa
    if (diceContainerEl) diceContainerEl.style.display = "none";
    bowlElement.classList.remove("covering");

    // Tạo ván cược mới
    createNewRound(Date.now());

    if (sessionIdBadgeEl) {
      sessionIdBadgeEl.textContent = currentRound.roundId;
    }
    if (md5HashEl) {
      md5HashEl.textContent = currentRound.md5Hash;
    }

    // Reset số tiền cược người chơi trên bàn
    confirmedBetLeft = 0;
    confirmedBetRight = 0;
    tempBetLeft = 0;
    tempBetRight = 0;
    if (userBetLeftEl) userBetLeftEl.textContent = "0";
    if (userBetRightEl) userBetRightEl.textContent = "0";
    if (elBetMainLeft) elBetMainLeft.textContent = "0";
    if (elBetMainRight) elBetMainRight.textContent = "0";
    elBetMoneyLeft.innerHTML = `<img src="../image/image-game/cuoc.png"><span></span>`;
    elBetMoneyRight.innerHTML = `<img src="../image/image-game/cuoc.png"><span></span>`;

    isBettingLocked = false;
    isRolling = false;
    if (containerBet) containerBet.classList.remove("locked");
    updateRoomStats();
    if (gameStatusBadge) gameStatusBadge.textContent = `ĐANG NHẬN CƯỢC (${BET_DURATION}s)`;

    // 4. Bắt đầu đếm số: Hiện số đếm ngược 60 giây ngay trên mặt dĩa trắng
    if (countdownElement) {
      countdownElement.textContent = BET_DURATION;
      countdownElement.style.display = "";
      countdownElement.classList.add("pop-in");
      setTimeout(() => countdownElement.classList.remove("pop-in"), 400);
    }
  }, 500);
}

// Vòng lặp đếm ngược mỗi giây theo thời gian thực (Real-time sync)
function updateCountdown() {
  updatePeakHourUI();
  if (!currentRound || isRolling) return;

  const now = Date.now();
  const elapsed = (now - currentRound.startTime) / 1000;

  if (elapsed < BET_DURATION) {
    timeLeft = Math.max(0, Math.ceil(BET_DURATION - elapsed));
    if (countdownElement) {
      countdownElement.textContent = timeLeft;
    }

    if (timeLeft <= 5) {
      // Còn 5 giây cuối: Khóa cược hoàn toàn không cho người chơi cược
      isBettingLocked = true;
      if (countdownElement) countdownElement.classList.add("time-end");
      if (gameStatusBadge) gameStatusBadge.textContent = `ĐÃ KHÓA CƯỢC (${timeLeft}s)`;
      if (containerBet) containerBet.classList.add("locked");

      // Tự động gom tiền cược tạm nếu người chơi đã chọn nhưng chưa bấm xác nhận
      autoConfirmTempBets();
    } else {
      isBettingLocked = false;
      if (countdownElement) countdownElement.classList.remove("time-end");
      if (gameStatusBadge) gameStatusBadge.textContent = `ĐANG NHẬN CƯỢC (${timeLeft}s)`;
      if (containerBet) containerBet.classList.remove("locked");

      // Tiền cược cả phòng và người chơi hai bên tăng ngẫu nhiên từ 1 đến 100 người và 1.000.000 đến 100.000.000 đ
      // Luôn giữ hai bên cân bằng ngang ngửa nhau (ngay ngay nhau)
      stepRoomStats();
      updateRoomStats();
      saveRoundState();
    }
  } else {
    // Hết 60 giây đặt cược -> Khóa cược và xóc bát
    isBettingLocked = true;
    if (countdownElement) countdownElement.textContent = "0";
    startRollDiceProcess();
  }
}

// Khôi phục giao diện theo giai đoạn đặt cược
function setupBettingPhaseUI(remainingTime) {
  timeLeft = remainingTime;
  isRolling = false;

  bowlElement.classList.remove("open", "shaking", "covering");
  if (diceContainerEl) diceContainerEl.style.display = "none";

  if (countdownElement) {
    countdownElement.textContent = timeLeft;
    countdownElement.style.display = "";
  }

  if (timeLeft <= 5) {
    isBettingLocked = true;
    if (countdownElement) countdownElement.classList.add("time-end");
    if (gameStatusBadge) gameStatusBadge.textContent = `ĐÃ KHÓA CƯỢC (${timeLeft}s)`;
    if (containerBet) containerBet.classList.add("locked");
    autoConfirmTempBets();
  } else {
    isBettingLocked = false;
    if (countdownElement) countdownElement.classList.remove("time-end");
    if (gameStatusBadge) gameStatusBadge.textContent = `ĐANG NHẬN CƯỢC (${timeLeft}s)`;
    if (containerBet) containerBet.classList.remove("locked");
  }

  if (sessionIdBadgeEl) sessionIdBadgeEl.textContent = currentRound.roundId;
  if (md5HashEl) md5HashEl.textContent = currentRound.md5Hash;

  if (userBetLeftEl) userBetLeftEl.textContent = confirmedBetLeft.toLocaleString();
  if (userBetRightEl) userBetRightEl.textContent = confirmedBetRight.toLocaleString();
  if (elBetMainLeft) elBetMainLeft.textContent = confirmedBetLeft.toLocaleString();
  if (elBetMainRight) elBetMainRight.textContent = confirmedBetRight.toLocaleString();

  if (tempBetLeft > 0) {
    elBetMoneyLeft.innerHTML = `
      <img src="../image/image-game/money.png">
      <span>${tempBetLeft.toLocaleString()}</span>
    `;
  }
  if (tempBetRight > 0) {
    elBetMoneyRight.innerHTML = `
      <img src="../image/image-game/money.png">
      <span>${tempBetRight.toLocaleString()}</span>
    `;
  }

  if (currentBetSide === "left") elEven.classList.add("active");
  else if (currentBetSide === "right") elOdd.classList.add("active");

  updateRoomStats();
}

// Khôi phục giao diện nếu người dùng reload trúng lúc đang xóc bát
function setupRollingPhaseUI(elapsed) {
  timeLeft = 0;
  isRolling = true;
  isBettingLocked = true;

  autoConfirmTempBets();

  if (countdownElement) countdownElement.style.display = "none";
  if (gameStatusBadge) gameStatusBadge.textContent = "ĐÃ KHÓA CƯỢC - ĐANG XÓC BÁT";
  if (sessionIdBadgeEl) sessionIdBadgeEl.textContent = currentRound.roundId;
  if (md5HashEl) md5HashEl.textContent = currentRound.md5Hash;

  bowlElement.classList.remove("open", "covering");
  bowlElement.classList.add("shaking");

  if (diceContainerEl) diceContainerEl.style.display = "flex";
  const diceItems = document.querySelectorAll(".dice-item");
  diceItems.forEach((d) => d.classList.add("rolling"));

  let shuffleInterval = setInterval(() => {
    let r1 = Math.floor(Math.random() * 6) + 1;
    let r2 = Math.floor(Math.random() * 6) + 1;
    let r3 = Math.floor(Math.random() * 6) + 1;
    dice1El.src = `../image/image-game/dor${r1}.png`;
    dice2El.src = `../image/image-game/dor${r2}.png`;
    dice3El.src = `../image/image-game/dor${r3}.png`;
  }, 90);

  updateRoomStats();

  const remainMs = Math.max(200, Math.round((BET_DURATION + ROLL_DURATION - elapsed) * 1000));
  setTimeout(() => {
    clearInterval(shuffleInterval);
    revealResult(true);
  }, remainMs);
}

// Khôi phục giao diện nếu người dùng reload trúng lúc đang hiển thị kết quả
function setupResultPhaseUI(elapsed) {
  timeLeft = 0;
  isRolling = true;
  isBettingLocked = true;

  autoConfirmTempBets();

  if (countdownElement) countdownElement.style.display = "none";
  if (sessionIdBadgeEl) sessionIdBadgeEl.textContent = currentRound.roundId;
  if (md5HashEl) md5HashEl.textContent = currentRound.md5Hash;

  if (diceContainerEl) diceContainerEl.style.display = "flex";

  updateRoomStats();
  revealResult(false);

  const remainMs = Math.max(500, Math.round((CYCLE_DURATION - elapsed) * 1000));
  setTimeout(() => {
    startNextRound();
  }, remainMs);
}

// Khởi tạo phiên trò chơi khi vừa mở trang hoặc khi F5 / Reload
function initGameSession() {
  let savedRound = null;
  try {
    const raw = localStorage.getItem("tx_active_round");
    if (raw) savedRound = JSON.parse(raw);
  } catch (e) {
    savedRound = null;
  }

  const now = Date.now();

  if (!savedRound || !savedRound.startTime || !Array.isArray(savedRound.dices)) {
    // Chưa có ván lưu hợp lệ -> Khởi tạo ván mới bắt đầu ngay bây giờ
    createNewRound(now);
    setupBettingPhaseUI(BET_DURATION);
  } else {
    currentRound = savedRound;
    roomBetTai = currentRound.roomBetTai || 0;
    roomBetXiu = currentRound.roomBetXiu || 0;
    playersTai = currentRound.playersTai || 0;
    playersXiu = currentRound.playersXiu || 0;
    confirmedBetLeft = currentRound.confirmedBetLeft || 0;
    confirmedBetRight = currentRound.confirmedBetRight || 0;
    tempBetLeft = currentRound.tempBetLeft || 0;
    tempBetRight = currentRound.tempBetRight || 0;
    currentBetSide = currentRound.currentBetSide || null;

    const elapsed = (now - currentRound.startTime) / 1000;

    // Bù đắp số người và tiền cược bị gián đoạn nếu người dùng đóng tab/rời trang trong giai đoạn cược
    if (savedRound.lastSavedTime && elapsed < BET_DURATION - 5) {
      const missedSeconds = Math.min(
        Math.floor(BET_DURATION - 5 - (savedRound.lastSavedTime - currentRound.startTime) / 1000),
        Math.floor((now - savedRound.lastSavedTime) / 1000)
      );
      for (let i = 0; i < missedSeconds; i++) {
        stepRoomStats();
      }
    }

    if (elapsed >= CYCLE_DURATION) {
      // Ván cũ đã kết thúc trong lúc người dùng rời trang -> tính kết quả trả thưởng đầy đủ nếu chưa trả
      settleRound(currentRound);
      // Bắt đầu ván mới
      createNewRound(now);
      setupBettingPhaseUI(BET_DURATION);
    } else if (elapsed >= BET_DURATION + ROLL_DURATION) {
      // Đang trong giai đoạn hiển thị kết quả ván hiện tại (62s - 68s)
      setupResultPhaseUI(elapsed);
    } else if (elapsed >= BET_DURATION) {
      // Đang trong giai đoạn xóc bát ván hiện tại (60s - 62s)
      setupRollingPhaseUI(elapsed);
    } else {
      // Đang trong 60 giây đặt cược ván hiện tại
      const remaining = Math.max(1, Math.ceil(BET_DURATION - elapsed));
      setupBettingPhaseUI(remaining);
    }
  }
}

// Khởi chạy phiên game và vòng lặp thời gian
initGameSession();
updatePeakHourUI();
setInterval(updateCountdown, 1000);

// 4. PHÒNG CHAT TRỰC TUYẾN SÔI ĐỘNG
const chatBox = document.getElementById("chatBox");
const chatMessagesEl = document.getElementById("chatMessages");
const chatInput = document.getElementById("chatInput");
const chatBadge = document.getElementById("chatBadge");
let unreadChatCount = 0;

function toggleChat() {
  if (chatBox.classList.contains("show")) {
    chatBox.classList.remove("show");
  } else {
    chatBox.classList.add("show");
    unreadChatCount = 0;
    if (chatBadge) {
      chatBadge.textContent = "";
      chatBadge.style.display = "none";
      chatBadge.classList.remove("pop");
    }
    if (chatInput) chatInput.focus();
    scrollChatBottom();
  }
}

function handleChatKey(event) {
  if (event.key === "Enter") {
    sendChatMessage();
  }
}

function sendChatMessage() {
  if (!chatInput) return;
  const message = chatInput.value.trim();
  if (!message) return;

  addChatMessage(userLogin.name, message, "me");
  chatInput.value = "";
  scrollChatBottom();

  // Mô phỏng người chơi khác tương tác lại ngẫu nhiên
  if (Math.random() > 0.4) {
    setTimeout(() => {
      const botReplies = [
        "Đồng quan điểm với bác!",
        "Tay này mình cũng vào giống thế!",
        "Uy tín luôn người anh em!",
        "Cầu này căng phết đấy",
        "Chúc bác may mắn rực rỡ nhé!"
      ];
      const randomReply = botReplies[Math.floor(Math.random() * botReplies.length)];
      const botNames = ["ThầnBài_SG", "Tuấn_Pro", "HảiPhòng68", "Minh_VIP", "ĐạiBàngĐêm"];
      const randomBot = botNames[Math.floor(Math.random() * botNames.length)];
      addChatMessage(randomBot, randomReply, "other");
    }, 1500);
  }
}

function addChatMessage(sender, text, type = "other", isInitial = false) {
  if (!chatMessagesEl) return;
  const item = document.createElement("div");
  item.className = `chat-item ${type}`;

  const senderSpan = document.createElement("span");
  senderSpan.className = `chat-sender ${type}`;
  senderSpan.textContent = sender + ": ";

  const textSpan = document.createElement("span");
  textSpan.className = "chat-text";
  textSpan.textContent = text;

  item.appendChild(senderSpan);
  item.appendChild(textSpan);
  chatMessagesEl.appendChild(item);

  scrollChatBottom();

  // Nếu khung chat đang đóng và không phải tin nhắn khởi tạo ban đầu -> Hiển thị số lượng tin nhắn mới
  if (!chatBox.classList.contains("show") && !isInitial) {
    unreadChatCount++;
    if (chatBadge) {
      chatBadge.textContent = unreadChatCount > 99 ? "99+" : String(unreadChatCount);
      chatBadge.style.display = "flex";
      chatBadge.classList.remove("pop");
      void chatBadge.offsetWidth;
      chatBadge.classList.add("pop");
    }
  }
}

function scrollChatBottom() {
  if (chatMessagesEl) {
    chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
  }
}

// Khởi tạo một số tin nhắn chat mẫu khi vào game
const sampleChats = [
  { sender: "Hệ thống", text: "Chào mừng bạn đến với sảnh Tài Xỉu trực tuyến!", type: "system" },
  { sender: "Tuấn_Pro", text: "Chào cả nhà, hôm nay cầu Tài chạy mượt quá!", type: "other" },
  { sender: "ThầnBài_SG", text: "Vừa húp 2 củ xong, anh em theo Xỉu đi!", type: "other" },
  { sender: "ĐạiBàngĐêm", text: "Tay này tất tay Tài nhé các bác", type: "other" }
];
sampleChats.forEach((c) => addChatMessage(c.sender, c.text, c.type, true));

// Danh sách 50+ người chơi ảo đa dạng, sống động
const fakePlayers = [
  "Bá_Chủ_TàiXỉu", "ĐạiGia_HàThành", "QuânSư_CầuKèo", "BéMèo_99", "VuaLìĐòn",
  "ThánhSoiCầu", "Khánh_Sky", "Tuấn_Hưng_Yên", "BáchPhátBáchTrúng", "HảiPhòng68",
  "BoyPhốCổ", "LongCa", "Hưng_VIP", "Bảo_Bảo", "ĐạiGia_BN", "Thắng_88",
  "Cường_Seven", "TiểuBảo", "KiếmTiềnDễ", "ĐạiBàngĐêm", "Nam_Định_Pro", "Minh_GiaLai",
  "Lộc_Phát_68", "ThầnTài_GõCửa", "Trùm_BẻCầu", "Chiến_Binh_TX", "SátThủ_BànCược",
  "Tùng_Vip_99", "Hoàng_Tử_Gió", "Bình_Dương_Boy", "Hà_Nội_Về_Đêm", "Phú_Ông_MiềnTây",
  "Anh_Ba_SàiGòn", "Bé_Heo_Kute", "CaoThủ_ẨnDanh", "CậuÚt_HọLê", "Dũng_CầuVồng",
  "GiaCátLượng", "LýBạch_UốngRượu", "TiêuPhong", "LâmXung", "ĐoànDự", "HưTrúc",
  "Trần_Dần_Vip", "Sơn_Tùng_MTP", "Jack_BếnTre", "Đạt_GiaLai", "Phan_Thiết_Boy"
];

// Kho câu chat phong phú theo ngữ cảnh (Hô cầu, Khen cầu, Thắng lớn, Cay cú, Không khí giờ vàng)
const fakeMessages = [
  "Cầu này về Tài chắc luôn anh em",
  "Bẻ cầu Xỉu tay này thôi",
  "All in ván này ăn nghỉ sớm!",
  "Bác nào theo tôi ván này không?",
  "Xỉu thơm quá húp trọn vẹn!",
  "Đang dây đỏ, đánh đâu thắng đó",
  "Tài 14 điểm quá nét luôn",
  "Ae bình tĩnh quản lý vốn nhé",
  "Tay này nhẹ nhàng 5 củ",
  "Húp trọn 50 củ thơm phức anh em ơi!",
  "Ăn thông 5 tay rồi cả nhà ơi, rực rỡ quá!",
  "Đẳng cấp là mãi mãi, theo tôi là có lộc!",
  "Vừa gỡ lại được vốn ván trước rồi, cảm ơn bác Quân Sư!",
  "Lại lụm lúa rồi các bác ơi 🎉",
  "Cay thế nhờ, bẻ cầu xịt mất 15m 😭",
  "Đang ăn bệt đẹp tự nhiên nhảy cầu, đen thế",
  "Ván sau tất tay gỡ lại gấp đôi!",
  "Tài 10 với chả 11, suýt nữa thì ăn",
  "Tay này anh em vào Tài cùng tôi nhé, cầu bệt 4 tay rồi!",
  "Cầu này 1-1 rõ như ban ngày, vào Xỉu đi anh em",
  "Ai chung thuyền Tài giơ cánh tay lên nào!",
  "Tôi vừa vào 20m Xỉu, anh em vững tay chèo",
  "Ván này theo trực giác mách bảo: TÀI về 13 điểm",
  "Bác nào chung máu Xỉu tay này không?",
  "Tiền cược nhảy kinh thật, toàn đại gia vào tiền trăm củ",
  "Giờ này phòng đông vui thế anh em",
  "Giờ vàng có khác, người cược nhảy ầm ầm!",
  "Phòng xôm tụ quá, đánh cùng anh em cho vui",
  "Chúc toàn thể anh em tối nay rực rỡ nhé!",
  "Nay đánh ca này đông vui phết, cầu chạy mượt",
  "Đang dây đỏ, ai bám càng tôi không?",
  "Tài đê anh em ơi, không phải nghĩ nhiều!",
  "Chuẩn vị Xỉu 8 nút không lệch đi đâu được"
];

// Các cặp hội thoại tương tác phản hồi qua lại tạo cảm giác chân thật
const pairedConversations = [
  { p1: "Ai chung thuyền Tài tay này không?", p2: "Có tôi theo bác 10m Tài nhé!" },
  { p1: "Cầu bệt hay bẻ đây các bác ơi?", p2: "Bệt chắc luôn, đừng bẻ mà toang!" },
  { p1: "Vừa húp 30 củ thơm lừng!", p2: "Chúc mừng bác nhé, vía đỏ cho xin ít lộc" },
  { p1: "Tay này tất tay Xỉu được không anh em?", p2: "Tất tay đi bác, tôi cũng vừa vào 50m Xỉu rồi" }
];

// Bộ phát tin nhắn chat thông minh: tự động tăng tần suất và mức độ sôi động trong giờ vàng
function scheduleNextFakeChat() {
  const isPeak = isPeakHourActive();
  // Giờ vàng: 1.2s - 2.5s có tin nhắn mới | Giờ thường: 4.5s - 7.5s
  const delay = isPeak
    ? Math.floor(Math.random() * 1300) + 1200
    : Math.floor(Math.random() * 3000) + 4500;

  setTimeout(() => {
    // 15% xác suất giờ vàng có thông báo hệ thống nổ hũ / đại gia thắng lớn
    if (isPeak && Math.random() < 0.15) {
      const winner = fakePlayers[Math.floor(Math.random() * fakePlayers.length)];
      const winGate = Math.random() > 0.5 ? "TÀI" : "XỈU";
      const winMoney = (Math.floor(Math.random() * 150) + 50) * 1000000;
      addChatMessage(
        "🎉 HỆ THỐNG",
        `Đại gia [${winner}] vừa thắng lớn +${winMoney.toLocaleString()} đ cửa ${winGate}!`,
        "jackpot"
      );
    } else if (isPeak && Math.random() < 0.25) {
      // 25% xác suất giờ vàng có 2 người chơi trò chuyện phản hồi nhau
      const convo = pairedConversations[Math.floor(Math.random() * pairedConversations.length)];
      const p1 = fakePlayers[Math.floor(Math.random() * fakePlayers.length)];
      let p2 = fakePlayers[Math.floor(Math.random() * fakePlayers.length)];
      while (p2 === p1) p2 = fakePlayers[Math.floor(Math.random() * fakePlayers.length)];

      addChatMessage(p1, convo.p1, "other");
      setTimeout(() => {
        addChatMessage(p2, convo.p2, "other");
      }, 500);
    } else {
      // Tin nhắn người chơi bình thường
      const p = fakePlayers[Math.floor(Math.random() * fakePlayers.length)];
      const m = fakeMessages[Math.floor(Math.random() * fakeMessages.length)];
      addChatMessage(p, m, "other");
    }

    scheduleNextFakeChat();
  }, delay);
}
scheduleNextFakeChat();

// 5. CÁC MODAL & TIỆN ÍCH PHỤ
function showHistory() {
  const modal = document.getElementById("historyModal");
  const list = document.getElementById("historyList");
  if (!modal || !list) return;

  if (gameHistory.length === 0) {
    list.innerHTML = `<div class="text-center text-muted py-3">Chưa có kết quả ván nào!</div>`;
  } else {
    list.innerHTML = gameHistory
      .map(
        (h) => `
      <div class="history-item">
        <span>⏰ ${h.time}</span>
        <span>Xúc xắc: <b>${h.dices.join(" - ")}</b></span>
        <span class="history-tag ${h.gate === "TÀI" ? "tai" : "xiu"}">${h.gate} (${h.score})</span>
      </div>
    `
      )
      .join("");
  }
  modal.style.display = "block";
}

function closeHistory() {
  const modal = document.getElementById("historyModal");
  if (modal) modal.style.display = "none";
}

function showHelp() {
  alert(
    "🎲 LUẬT CHƠI TÀI XỈU (SIC BO):\n\n" +
    "- Kết quả dựa trên tổng điểm của 3 viên xúc xắc (1 - 6 điểm).\n" +
    "- Cửa TÀI (bên trái): Tổng điểm từ 11 đến 17.\n" +
    "- Cửa XỈU (bên phải): Tổng điểm từ 4 đến 10.\n" +
    "- Tỷ lệ trả thưởng: 1 : 2 (Đặt 1 ăn 2).\n\n" +
    "👉 Chọn cửa cược -> Chọn mệnh giá phỉnh -> Bấm Đặt cược -> Chờ mở bát!"
  );
}

function showRank() {
  alert(
    "🏆 BẢNG XẾP HẠNG ĐẠI GIA HÔM NAY:\n\n" +
    "1. 🥇 ĐạiGia_HàThành: 250,000,000 đ\n" +
    "2. 🥈 ThầnBài_SàiGòn: 180,000,000 đ\n" +
    "3. 🥉 PhúÔng_BắcNinh: 125,000,000 đ\n" +
    `4. ⭐ ${userLogin.name}: ${userLogin.assets.toLocaleString()} đ`
  );
}

function logout() {
  if (confirm("Bạn có chắc chắn muốn quay về trang chủ?")) {
    window.location.href = "../index.html";
  }
}

// Hàm hiển thị thông báo popup mini
function showToast(message) {
  let toast = document.createElement("div");
  toast.textContent = message;
  toast.style.position = "fixed";
  toast.style.top = "20px";
  toast.style.left = "50%";
  toast.style.transform = "translateX(-50%)";
  toast.style.background = "linear-gradient(135deg, rgba(30, 20, 5, 0.95), rgba(60, 30, 10, 0.95))";
  toast.style.color = "#ffd700";
  toast.style.border = "1.5px solid #ffb700";
  toast.style.borderRadius = "25px";
  toast.style.padding = "10px 24px";
  toast.style.fontSize = "14px";
  toast.style.fontWeight = "700";
  toast.style.boxShadow = "0 8px 25px rgba(0,0,0,0.8), 0 0 15px rgba(255, 183, 0, 0.4)";
  toast.style.zIndex = "9999";
  toast.style.transition = "opacity 0.3s ease";
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, 2200);
}
