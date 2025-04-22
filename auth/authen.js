const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');

signUpButton.addEventListener('click', () => {
	container.classList.add("right-panel-active");
});

signInButton.addEventListener('click', () => {
	container.classList.remove("right-panel-active");
});


function authenCheck() {
    if(localStorage.getItem("userLogin")) {
        window.location.href = "/"
    }
}
authenCheck()



function register(event) {
    event.preventDefault()
    // if(!confirm("Bạn xác nhận các thông tin là chính xác chưa?"))  return

    let formRegisterEL = event.target
    /* lấy dữ liệu của form đăng ký */
    let data = getFormData(formRegisterEL)

    if(!validateEmail(data.email)) {
        alert("email chưa đúng định dạng")
        return
    }
    /* validate name */
    /* tài khoản đã tồn tại hay chưa */
    if(userList.find((userF) => userF.name == data.name)) {
        alert("Tên tài khoản đã tồn tại")
        return
    }
    if(data.password!=data.passwordConfirm){
        alert("Mật khẩu không khớp")
        return
    }
    /* thêm dữ liệu vừa đăng ký vào danh sách */
    data.role = "USER"
    data.assets = "1000000"
    userList.push(data)

    /* lưu dữ liệu lên local */
    saveUserListToLocal(userList)
    alert("Đăng ký thành công")
    /* chuyển qua trang đăng nhập */
    container.classList.remove("right-panel-active");

    /* xoá hết dữ liệu trong form đăng ký */
    formRegisterEL.reset()
}


function login(event) {
    event.preventDefault()

    /* lấy element của form login */
    let formLoginEL = event.target 

    /* lấy dữ liệu của form */
    let data = getFormData(formLoginEL)


    let userData = userList.find(userF => userF.name == data.name)

    if(!userData) {
        alert("Người dùng không tồn tại")
        return
    }

    if(userData.password != data.password) {
        alert("mật khẩu không chính xác")
        return
    }

    localStorage.setItem("userLogin", JSON.stringify(userData))
    window.location.href = "/"
}

