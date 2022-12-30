let bookingArea = document.getElementById('bookingArea');
let noBookingArea = document.getElementById('noBookingArea');
let userName = document.getElementById('userName');
let bookingImg = document.getElementById('bookingImg');
let bookingName = document.getElementById('bookingName');
let bookingDate = document.getElementById('bookingDate');
let bookingTime = document.getElementById('bookingTime');
let bookingFee = document.getElementById('bookingFee');
let bookingLocation = document.getElementById('bookingLocation');

let fee = document.getElementById('fee');
let noticeMsg = document.getElementById('noticeMsg');

let memberName;
let oderPrice;
let oderDate;
let oderTime;
let attractionId;
let attractionName;
let attractionAddress;
let attractionImage;


//抓取身份
fetch("/api/user/auth",{
    method: "GET",
    credentials: "include",
}).then(resp=>resp.json())
    .then(function(data){
    if(data.data){
        memberName = userName.textContent = data.data.name;
        userNameInput.value = data.data.name;
        userEmailInput.value = data.data.email;
    }else{
        console.log(data)
    }
    return fetch("/api/booking")
})
.then(resp=>resp.json())
.then(function(bookingData){
    //console.log(bookingData)
    if(bookingData.data){
        //console.log(bookingData)
        bookingArea.style.display = "block";
        noBookingArea.style.display = "none";
        if(bookingData.data.time==="morning"){
            timeTxt = "早上 9 點到下午 4 點";
        }else{
            timeTxt = "下午 2 點到晚上 9 點";
        };
        bookingTime.textContent = timeTxt; //文字化
        fee.textContent = bookingData.data.price;

        attractionId = bookingData.data.attraction.id;
        attractionImage = bookingImg.src = bookingData.data.attraction.images;
        attractionName = bookingName.textContent = bookingData.data.attraction.name;
        attractionAddress = bookingLocation.textContent = bookingData.data.attraction.address;
        oderDate = bookingDate.textContent = bookingData.data.date;
        oderTime = bookingData.data.time;
        oderPrice = bookingFee.textContent = bookingData.data.price;

    }else{
        bookingArea.style.display = "none";
        noBookingArea.style.display = "block";
        if(bookingData.error === true){
            //noticeMsg.textContent = bookingData.message;
            location.href="/";
        }
    }
}).catch(function(e){
    console.log(e);
})

const deleteBtn = document.getElementById('bookingDelete')
deleteBtn.addEventListener("click", function(){
    fetch("/api/booking",{
        method: "DELETE",
    }).then(function(resp){ 
        return resp.json();
    }).then(function(resp){
        if(resp.ok){
            bookingArea.style.display = "none";
            noBookingArea.style.display = "block";
            location.reload()
        }
    }).catch(function(e){
        console.log(e);
    })
})


/*-------------------------------------------
 the card of Tappay
--------------------------------------------- */
// 初始化金鑰
TPDirect.setupSDK(127073, 'app_6rGMcfuTokwmXujStMrxgUOdxOw22McHmTHPLv6BkUOEmvvJnzJ07mwJw4ZF', 'sandbox')

let userNameInput = document.getElementById('userNameInput');
let userEmailInput = document.getElementById('userEmailInput');
let userPhoneInput = document.getElementById('userPhoneInput');
let confrimBtn = document.getElementById('confrimBtn');

let fields = {
    // Display ccv field
    number: {
        // css selector
        element: '#card-number',
        placeholder: '**** **** **** ****'
    },
    expirationDate: {
        // DOM object
        element: document.getElementById('card-expiration-date'),
        placeholder: 'MM / YY'
    },
    ccv: {
        element: '#card-ccv',
        placeholder: 'ccv'
    }
}

// 植入輸入卡號表單
TPDirect.card.setup({
    fields: fields,
    styles: {
        // Style all elements
        'input': {
            'color': 'gray'
        },
        // Styling ccv field
        'input.ccv': {
            // 'font-size': '16px'
        },
        // Styling expiration-date field
        'input.expiration-date': {
            // 'font-size': '16px'
        },
        // Styling card-number field
        'input.card-number': {
            // 'font-size': '16px'
        },
        // style focus state
        ':focus': {
            // 'color': 'black'
        },
        // style valid state
        '.valid': {
            'color': 'green'
        },
        // style invalid state
        '.invalid': {
            'color': 'red'
        },
        // Media queries
        // Note that these apply to the iframe, not the root window.
        '@media screen and (max-width: 400px)': {
            'input': {
                'color': 'orange'
            }
        }
    },
    // 此設定會顯示卡號輸入正確後，會顯示前六後四碼信用卡卡號
    isMaskCreditCardNumber: true,
    maskCreditCardNumberRange: {
        beginIndex: 6,
        endIndex: 11
    }
})

TPDirect.card.onUpdate(function (update) {
    // update.canGetPrime === true
    // --> you can call TPDirect.card.getPrime()
    if (update.canGetPrime) {
        // Enable submit Button to get prime.
        confrimBtn.removeAttribute('disabled')
    } else {
        // Disable submit Button to get prime.
        confrimBtn.setAttribute('disabled', true)
    }

    // cardTypes = ['mastercard', 'visa', 'jcb', 'amex', 'unionpay','unknown']
    if (update.cardType === 'visa') {
        // Handle card type visa.
    }

    // number 欄位是錯誤的
    if (update.status.number === 2) {
        // setNumberFormGroupToError()
    } else if (update.status.number === 0) {
        // setNumberFormGroupToSuccess()
    } else {
        // setNumberFormGroupToNormal()
    }

    if (update.status.expiry === 2) {
        // setNumberFormGroupToError()
    } else if (update.status.expiry === 0) {
        // setNumberFormGroupToSuccess()
    } else {
        // setNumberFormGroupToNormal()
    }

    if (update.status.ccv === 2) {
        // setNumberFormGroupToError()
    } else if (update.status.ccv === 0) {
        // setNumberFormGroupToSuccess()
    } else {
        // setNumberFormGroupToNormal()
    }
})

// 觸發 getPrime 方法
confrimBtn.addEventListener('click', function (event) {
    console.log(typeof (userPhoneInput.value))
    if (userNameInput.value == "" || userEmailInput.value == "" || userPhoneInput.value == "") {
        if(userNameInput.value == "" ){
            noticeMsg.textContent = '請填寫聯絡姓名';
            document.getElementById('notice').style.display = 'block'; 
        }else if(userEmailInput.value == "" ){
            noticeMsg.textContent = '請填寫聯絡email';
            document.getElementById('notice').style.display = 'block'; 
        }else if(userPhoneInput.value == "" ){
            noticeMsg.textContent = '請填寫聯絡手機號碼';
            document.getElementById('notice').style.display = 'block'; 
        }  
    }else if(!validateEmail(userEmailInput.value)) {
        noticeMsg.textContent = '信箱格式錯誤';
        document.getElementById('notice').style.display = 'block'; 
    }else {
        TPDirect.card.getPrime(function (result) {
            // 取得 TapPay Fields 的 status
            const tappayStatus = TPDirect.card.getTappayFieldsStatus()

            // 確認是否可以 getPrime
            if (tappayStatus.canGetPrime === false) {
                noticeMsg.textContent = '請填寫完整信用卡資訊';
                document.getElementById('notice').style.display = 'block'; 
                return;
            }

            // Get prime: tappay 會將客戶敏感的卡片轉為一個不具敏感資訊, 得到的值稱為prime token, 需再將此值給後端
            TPDirect.card.getPrime((result) => {
                if (result.status !== 0) {
                    alert('get prime error ' + result.msg);
                    return;
                }
                //alert('get prime 成功，prime: ' + result.card.prime);
                // 連線至後端，帶上所有訂購資訊
                let postData = {
                    "prime": result.card.prime,
                    "order": {
                        "price": oderPrice,
                        "trip": {
                            "attraction": {
                                "id": attractionId,
                                "name": attractionName,
                                "address": attractionAddress,
                                "image": attractionImage
                            },
                            "date": oderDate,
                            "time": oderTime
                        },
                        "contact": {
                            "name": userNameInput.value,
                            "email": userEmailInput.value,
                            "phone": userPhoneInput.value
                        }
                    }
                }
                console.log(postData);
                fetch('/api/orders', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
                    body: JSON.stringify(postData)
                }).then(response => {
                    return response.json();
                }).then(function (data) {
                    console.log(data)
                    if (data.data.payment.status === 0) {
                        console.log("成功");
                        location.href = "/thankyou?number=" + data.data.number
                        //location.href = "/thankyou";
                    }
                    else {
                        //alert("很抱歉，伺服器內部錯誤，請再試一次");
                        console.log("伺服器內部錯誤，請再試一次");
                    }
                })
                // send prime to your server, to pay with Pay by Prime API .
                // Pay By Prime Docs: https://docs.tappaysdk.com/tutorial/zh/back.html#pay-by-prime-api
            })
        })
    }
})

