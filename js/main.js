let userList=[
  {name:"admin6868",password:"09042006",role:"ADMIN",accountNumber:"0867422301",accountUser:"HOANG DINH TUNG",assets:"99999999999999"},

];

//Khởi tạo vào localStorage

if(localStorage.getItem("userList")) {
  userList = JSON.parse(localStorage.getItem("userList"))
}else {
  localStorage.setItem("userList", JSON.stringify(userList))
}

// làm lấy dữ liệu từ form (cụ thể hơn là lấy thông tin từ input)
function getFormData(formEL) {
  let data = {}
  for(element of formEL.elements) {
      if(element.name != "") {
          data[element.name] = element.value
      }
  }
  return data;
}

function saveUserListToLocal(userList) {
  localStorage.setItem("userList", JSON.stringify(userList))
}

function getUserLoginData() {
  let userData = JSON.parse(localStorage.getItem("userLogin"))
  return userData
}

function validateEmail(email) {
  var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}
