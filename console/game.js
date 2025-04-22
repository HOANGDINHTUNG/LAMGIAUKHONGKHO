let elBetMoneyRight=document.querySelector(".el-bet-money-right")
let elBetMoneyLeft=document.querySelector(".el-bet-money-left")
let containerBet=document.querySelector(".container-bet")
function showInputBetRight(){
    elBetMoneyRight.innerHTML=`
        <img src="../image/image-game/money.png" class="position-absolute">
        <span>0</span>
        
    `
    elBetMoneyLeft.innerHTML=`
        <img src="../image/image-game/cuoc.png" class="position-absolute">
    `
    containerBet.style.visibility="visible"
}

function showInputBetLeft(){
    elBetMoneyLeft.innerHTML=`
        <img src="../image/image-game/money.png" class="position-absolute">
        <span>0</span>
    `
    elBetMoneyRight.innerHTML=`
        <img src="../image/image-game/cuoc.png" class="position-absolute">
    `
    containerBet.style.visibility="visible"
}

