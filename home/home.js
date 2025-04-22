let userLogin = null;
function checkAuthen() {
  userLogin = JSON.parse(localStorage.getItem("userLogin"));
}

checkAuthen()

function renderHeader() {
  let featureNav = document.querySelector(".feature-support");
  console.log(userLogin)
  if (userLogin) {
    /* đã login */
    featureNav.innerHTML = `
            <div class="d-flex justify-content-end gap-2">
              <div class="buttonAbove">
                <i class="el-icon-video-camera-solid"></i>
                <button>Thương hiệu</button>
              </div>
              <div class="buttonAbove">
                <i class="fa-brands fa-rocketchat"></i>
                <button>Phòng chat</button>
              </div>
              <div class="buttonAboveColor">
                <i class="fa-solid fa-bell"></i>
                <button>Tin nhắn</button>
              </div>
              <div class="buttonAboveColor">
                <i class="fa-solid fa-list"></i>
                <button>Lịch sử</button>
              </div>
              <div style="border-radius: 15px" id="clock"></div>
            </div>
            <div class="d-flex justify-content-end gap-2">
              ${userLogin.role=="ADMIN"
                ?`
                  <button id="btn-admin">
                    <i class="fa-solid fa-house-user"></i>
                    <a href="./admin/admin.html">Move to several owners</a>
                  </button>
                `
                :`
                  <div class="rounded p-2 d-flex gap-3" style="background-color: #1e222c; color: #8491a5">
                    <div class="list-money">
                      <i class="fa-solid fa-coins"></i>
                      <span>Nạp tiền</span>
                    </div>
                    <div class="list-money">
                      <i class="fa-solid fa-wallet"></i>
                      <span>Chuyển quỹ</span>
                    </div>
                    <div class="list-money">
                      <i class="fas fa-university"></i>
                      <span>Rút tiền</span>
                    </div>
                  </div> 
                `
              }
              <div class="account-user d-flex gap-2">
                <div class="rounded-circle">
                  <img src="./image/1455615063-than-bai-1.webp" />
                </div>
                <div class="d-flex flex-column">
                  <span>${userLogin.name}</span>
                  <div class="d-flex justify-content-between align-items-center">
                    <span class="money">${userLogin.role!="ADMIN"?`${userLogin.assets}`:`+&infin;`}</span>
                    <i class="fas fa-chevron-down" onclick="toggleMenu()"></i>
                  </div>

                  <!-- Dropdown Menu -->
                  <div class="dropdown-menu" id="dropdownMenu">
                    <div class="dropdown-item">
                      <i class="fas fa-user"></i>
                      Thông tin cá nhân
                    </div>
                    <div class="dropdown-item">
                      <i class="fas fa-wallet"></i>
                      Quỹ tiền
                    </div>
                    <div class="dropdown-item">
                      <i class="fas fa-layer-group"></i>
                      Lịch sử
                    </div>
                    <div class="dropdown-item">
                      <i class="fas fa-inbox"></i>
                      Hòm thư
                    </div>
                    <div class="dropdown-item">
                      <i class="fas fa-question-circle"></i>
                      Trung tâm trợ giúp
                    </div>
                    <div class="dropdown-item">
                      <i class="fas fa-eraser"></i>
                      Xoá bộ nhớ cache
                    </div>
                    <div class="dropdown-item"  onclick="logout()">
                      <i class="fas fa-sign-out-alt"></i>
                      Đăng xuất
                    </div>
                  </div>
                </div>
              </div>
            </div>
        `;
  } else {
    /* chưa login */
    featureNav.innerHTML = `
            <div class="d-flex justify-content-end gap-2">
              <div class="buttonAbove">
                <i class="el-icon-video-camera-solid"></i>
                <button>Thương hiệu</button>
              </div>
              <div class="buttonAbove">
                <i class="iconfont icon-icon_chat"></i>
                <button>Phòng chat</button>
              </div>
              <div style="border-radius: 15px" id="clock"></div>
            </div>
            <div class="d-flex justify-content-end gap-2">
              <form onsubmit="login(event)" class="d-flex gap-2">
                <input type="text" name="name" placeholder="Tài khoản" class="border border-1" />
                <input type="password" name="password" placeholder="6-15 ký tự chữ và số " class="border border-1" />
                <div class="buttonOver">
                  <i class="fa-solid fa-user"></i>
                  <button type="submit">Đăng nhập</button>
                </div>
              </form>
              <div class="buttonOver">
                <i class="fa-solid fa-user-plus"></i>
                <button><a href="./auth/authen.html" target="_parent">Đăng ký</a></button>
              </div>
              <div class="google-login-button">
                <img src="https://www.google.com/s2/favicons?domain=google.com" />
                Đăng nhập Google
              </div>
              <div class="game">
                <i class="fa-solid fa-gamepad"></i>
                <button>Chơi thử</button>
              </div>
            </div> 
        `;
  }
}

function logout() {
  if (!confirm("bạn thật sự muốn đăng xuất?")) return
  window.location.reload()
  localStorage.removeItem("userLogin")
}

renderHeader();

let play_btn=document.querySelectorAll(".play-btn")[12]
let carouselItem=document.querySelectorAll(".carouselItem")[12]
carouselItem.addEventListener('click',()=>{
  if(userLogin){
    play_btn.innerHTML=`
      <a href="./console/game.html">Vào trò chơi</a>
    `
  }else{
    play_btn.innerHTML=`
      <a href="./auth/authen.html" target="_parent">Vào trò chơi</a>
    `
  }
})