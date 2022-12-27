let bookingArea = document.getElementById('bookingArea');
let noBookingArea = document.getElementById('noBookingArea');
let userName = document.getElementById('userName');
let bookingImg = document.getElementById('bookingImg');
let bookingName = document.getElementById('bookingName');
let bookingDate = document.getElementById('bookingDate');
let bookingTime = document.getElementById('bookingTime');
let bookingFee = document.getElementById('bookingFee');
let bookingLocation = document.getElementById('bookingLocation');
let userNameInput = document.getElementById('userNameInput');
let userEmailInput = document.getElementById('userEmailInput');
let userPhoneInput = document.getElementById('userPhoneInput');
let fee = document.getElementById('fee');
let noticeMsg = document.getElementById('noticeMsg');

//抓取身份
fetch("/api/user/auth",{
    method: "GET",
    credentials: "include",
}).then(resp=>resp.json())
    .then(function(data){
    if(data.data){
       userName.textContent = data.data.name;
       userNameInput.value = data.data.name;
       userEmailInput.value = data.data.email;
    }else{
        console.log(data)
    }
    return fetch("/api/booking")
})
.then(resp=>resp.json())
.then(function(bookingData){
    console.log(bookingData)
    if(bookingData.data){
        //console.log(bookingData)
        bookingArea.style.display = "block";
        noBookingArea.style.display = "none";
        if(bookingData.data.time==="morning"){
            timeTxt = "早上 9 點到下午 4 點";
        }else{
            timeTxt = "下午 2 點到晚上 9 點";
        };

        bookingImg.src = bookingData.data.attraction.images;
        bookingName.textContent = bookingData.data.attraction.name;
        bookingDate.textContent = bookingData.data.date;
        bookingTime.textContent = timeTxt;
        bookingFee.textContent = bookingData.data.price;
        bookingLocation.textContent = bookingData.data.attraction.address;
        fee.textContent = bookingData.data.price;

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