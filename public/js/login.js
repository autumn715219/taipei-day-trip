/*-----------------
 * 會員註冊/登入/登出
 -----------------*/
let input = document.querySelectorAll('input');

let loginForm = document.getElementById('loginForm');
let loginEmail = document.getElementById('loginEmail');
let loginPassword = document.getElementById('loginPassword');
let loginAlert= document.getElementById('loginAlert');

let signupForm = document.getElementById('signupForm');
let signupName = document.getElementById('signupName');
let signupEmail = document.getElementById('signupEmail');
let signupPassword = document.getElementById('signupPassword');
let signupAlert = document.getElementById('signupAlert');
let clickBooking = document.getElementById('clickBooking');

//註冊帳戶
function signupSubmit() {
    signupAlert.value = "";
    signupAlert.textContent='';
    signupAlert.classList.remove("error","success");
    for (let i=0; i < input.length; i++){
        input[i].classList.remove("error","success");
    }
    //檢查是否有輸入資料
    if (signupName.value == ''){
        signupName.classList.add('error');
        signupName.focus();
        signupAlert.classList.add('error');
        signupAlert.textContent='請輸入姓名';
        return false;
    }
    if (signupEmail.value == ''){
        signupEmail.classList.add('error');
        signupEmail.focus();
        signupAlert.classList.add('error');
        signupAlert.textContent='請輸入電子信箱'
        return false;
    }
    if (signupPassword.value == ''){
        signupPassword.classList.add('error');
        signupPassword.focus();
        signupAlert.classList.add('error');
        signupAlert.textContent='請輸入密碼'
        return false;
    }
    else{
        console.log('開始註冊')
        if (signupName.value.length != 0 && signupEmail.value.length != 0 && signupPassword.value.length != 0) {
            if (!validateEmail(signupEmail.value) && !validatePassword(signupPassword.value)) {
                console.log('a');
                signupEmail.classList.add('error');
                signupEmail.focus();
                signupPassword.classList.add('error');
                signupPassword.focus();
                signupAlert.classList.add('error');
                signupAlert.textContent = '密碼與信箱格式錯誤';
                signupEmail.value = '';
                signupPassword.value = '';
            }else if (!validateEmail(signupEmail.value)) {
                signupEmail.classList.add('error');
                signupEmail.focus();
                signupAlert.classList.add('error');
                signupAlert.textContent = '信箱格式錯誤';
                signupEmail.value = '';
            }else if (!validatePassword(signupPassword.value)) {
                signupAlert.classList.add('error');
                signupAlert.textContent = '密碼至少為8位，包括至少大寫字母和數字';
                signupPassword.classList.add('error');
                signupPassword.value = '';
            }else {
                signupAlert.classList.replace('error', 'success');
                signupAlert.textContent = "註冊成功";
                let accountData = {
                    "name": signupName.value,
                    "email": signupEmail.value,
                    "password": signupPassword.value
                };
              //console.log(accountData);
              signupAccount(accountData);
            }
        }else{
            signupAlert.textContent = "請輸入姓名、電子郵件與密碼"
        }
    }
}
async function signupAccount(data) {
    let url = '/api/user';
    let options = {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            "Content-type": "application/json",
        }
    };
    try {
        let resp = await fetch(url, options);
        let result = await resp.json();
        if (result[1] === 200) {
            //console.log(result)
            signupAlert.classList.add('success');
            signupAlert.textContent = "註冊成功請登入系統"
        } else if (result[1] === 400) {
            signupAlert.classList.add('error');
            signupAlert.textContent = result[0].message;
            signupEmail.value = ""
            return false;
        }
    }
    catch (err) {
        console.log({ "error": err.message });
    }
}
//登入帳戶
function loginSubmit() {
    loginAlert.value = "";
    loginAlert.textContent='';
    loginAlert.classList.remove("error","success");
    for (let i=0; i < input.length; i++){
        input[i].classList.remove("error","success");
    }
    if (loginEmail.value == ''){
        loginEmail.classList.add('error');
        loginEmail.focus();
        loginAlert.classList.add('error');
        loginAlert.textContent='請輸入電子信箱'
        return false;
    }
    if (loginPassword.value == ''){
        loginPassword.classList.add('error');
        loginPassword.focus();
        loginAlert.classList.add('error');
        loginAlert.textContent='請輸入密碼'
        return false;
    }
    else{
        loginAlert.classList.replace('error', 'success');
        let accountData = {
            "email": loginEmail.value,
            "password": loginPassword.value
        };
        //console.log(accountData);
        loginAccount(accountData);
    }
}
async function loginAccount(data) {
    let url = "/api/user/auth"
    let options = {
      method: "PUT",
      body: JSON.stringify(data),
      headers: {
        "Content-type": "application/json",
      }
    }
    try {
      //console.log(data)
      let resp = await fetch(url, options);
      let result = await resp.json();
      if (result.ok) {
        loginAlert.classList.add('error');
        window.location.reload(); //重整
      }else {
        loginAlert.classList.add('error');
        loginAlert.textContent = result.message;
      }
    } catch (err) {
      console.log({ "error": err.message });
    }
}
//登出帳戶
async function deleteAccount() {
    let url = "/api/user/auth"
    let options = {
      method: "DELETE",
    }
    try {
      let resp = await fetch(url, options);
      let result = await resp.json();
      if (result.ok) {
        window.location.reload(); //重整
      }
    } catch (err) {
      console.log({ "error": err.message }); 
    }
}

let loginSignupLink = document.getElementById('loginSignupLink');
let logoutLink = document.getElementById('logoutLink');


logoutLink.addEventListener('click', function (e) {
    deleteAccount();
    location.href="/";
});

//重整執行函式與狀態顯示
function reload() {
    fetch("/api/user/auth").then(function (resp) {
      return resp.json();
    }).then(function (data) {
      if ( data.error === true) { 
        //未登入狀態
        loginSignupLink.style.display = 'block';
        signupForm.style.display = 'none';
          clickBooking.addEventListener('click',function(){
            document.getElementById('loginNout').style.display = 'block';
          })
      } else { 
        //登入狀態
        logoutLink.style.display = 'block';
        loginForm.style.display = 'none';
        if(clickBooking){
          clickBooking.addEventListener('click',function(){
            location.href="/booking";
          })
        }

      }
    })
}
reload();


/*-----------------
 * 點擊登入登出事件
 -----------------*/
const clickSignup = document.getElementById('clickSignup');
const clickLogin = document.getElementById('clickLogin');

//點擊註冊按鈕
clickSignup.addEventListener('click', function (e) {
    signupForm.style.display = 'block';
    loginForm.style.display = 'none';//登出
});
//點擊登入按鈕
clickLogin.addEventListener('click', function (e) {
    signupForm.style.display = 'none';
    loginForm.style.display = 'block';//登出
});


// Regular Expression驗證
function validatePassword(password) {
    // 密碼必須由 8 個字符組成
    if (password.length < 8) { return false;  }
    // 密碼必須包含至少一個數字
    const hasNumber = /\d/;
    if (!hasNumber.test(password)) { return false; }
    // 密碼必須包含至少一個小寫字母
    const hasLowerCase = /[a-z]/;
    if (!hasLowerCase.test(password)) { return false;}
    // 密碼必須包含至少一個大寫字母
    const hasUpperCase = /[A-Z]/;
    if (!hasUpperCase.test(password)) { return false; }
    // 密碼合法
    return true;
}
function validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}


/*-----------------
 * 彈出視窗函式
 -----------------*/
let popupBtns = document.querySelectorAll('.popup-btn');
window.addEventListener("load", (event) => {
  //點擊 Btn 打開對應 popup 視窗
  popupBtns.forEach(function(btn) {
    btn.onclick = function() {
      let popup = btn.getAttribute('data-popup'); //html-->data-modal="modal2"
      document.getElementById(popup).style.display = 'block';
    };
  });
  //關閉按鈕
  let closeBtns = document.querySelectorAll('.popup-close');
  closeBtns.forEach(function(btn) {
    btn.onclick = function() {
      btn.closest('.popup').style.display = 'none';
    }
  });

  //點灰處關閉
  window.onclick = function(e) {
    if(e.target.className === 'popup') {
      e.target.style.display = 'none';  
    }
  }
});
