
/*------------------------------
 2022/12/01 - v1.0 載入景點內容
 -------------------------------*/

//解析網址
const href = window.location.href;
const id = href.toString().split("/")[4];
let slideIndex = 0; //初始輪播在第 1 cut

async function fetchAPI(url) {
    const resp = await fetch(url);
    const data = await resp.json();
    return data;
}
const renderItem = (id) => {
    fetchAPI('/api/attraction/'+ id)
    .then((data)=>{
        //內容
        renderContent(data.data);
        //輪播圖片
        let images = data.data["images"];
        images.forEach((img,i) => renderSlide(img,i));
        showSlides(slideIndex);

    }).catch((error)=>{
        console.log("404查無此頁", error);
    })
};

// 初始化
renderItem(id);


//組出內容
const productWrp = document.querySelector(".item-product");
const detailsWrp = document.querySelector(".item-details");

const renderContent = (item) => {
const titleStr = `<h3 class="item-title">${item.name}</h3>
                  <div class="item-mrt">
                    <span class="category">${item.category}</span>
                    at
                    <span class="mrt">${item.mrt}</span>
                  </div>`
const htmlStr = `<div class="description">${item.description}</div>
                 <div class="title">景點地址：</div>
                 <div class="address">${item.address}</div>
                 <div class="title">交通方式：</div>
                 <div class="transport">${item.transport}</div>`

productWrp.insertAdjacentHTML("afterbegin",titleStr);
detailsWrp.insertAdjacentHTML("afterbegin",htmlStr);

};




// 組出 DOM fn
const swiperWrp = document.querySelector("ul.slides");
const dotWrp = document.querySelector(".dot-wrp");
const renderSlide = (img,i) => {
    const imgStr =`<li class="slide"><img class="lazy" src="${img}" alt=""></li>`
    swiperWrp.insertAdjacentHTML("beforeend",imgStr);
    const imgDot =`<span class="dot" onclick="currentSlide(${i})"></span>`
    dotWrp.insertAdjacentHTML("beforeend",imgDot);
};

function plusSlides(n) {
    showSlides(slideIndex += n);
}
function currentSlide(n) {
    showSlides(slideIndex = n);
}
function showSlides(n) {
    let slides = document.getElementsByClassName("slide");
    let dots = document.getElementsByClassName("dot");
    let len = slides.length; //總cut數
    // 超過卡數回到 1 cut
    if (n >= len) { 
        slideIndex = 0; 
    } 
    // 小於卡數回到最後 1 cut
    if (n < 0) { 
        slideIndex = len - 1; 
    }
    for (let i = 0; i < len; i++) {
        slides[i].classList.remove("active");
        dots[i].classList.remove("active");
    }
    slides[slideIndex].classList.add("active");
    dots[slideIndex].classList.add("active");
}


// 價格變動
const tripRadioList = document.getElementsByName('radio');
const dollar = document.querySelector('#dollar');
let tripRadioValue = "";
function getRadioButtonValue() {
    for( let i=0 ; i<tripRadioList.length ; i++){
        if(tripRadioList[i].checked){
            if (tripRadioList[i].value == "morning"){
                dollar.textContent = 2000 ;
            }
            if (tripRadioList[i].value == "afternoon"){
                dollar.textContent = 2500 ;
            }
            tripRadioValue = tripRadioList[i].value;
            return tripRadioValue
            //break;
        }
    }
}
tripRadioList.forEach(function(radio) {
    radio.addEventListener("change", getRadioButtonValue);
});

//按下預定按鈕
let bookingButton = document.getElementById("submit");
let tripDate = document.getElementById("tripDate");
let noticeMsg = document.getElementById("noticeMsg");

//設定日期選取器最小值為今天
tripDate.min = new Date().toISOString().split("T")[0];
bookingButton.addEventListener('click',function(){
    fetchAPI('/api/user/auth')
    .then(function(data){
        if(data.data != undefined){
            //console.log(data.data)
            let bookingData = {
                "attractionId": id,
                "date": tripDate.value,
                "time": getRadioButtonValue(),
                "price": dollar.textContent
            };
            //console.log(bookingData);
            scheduleNewBooking(bookingData);
        }else{
            //console.log(data);
            noticeMsg.textContent = '請先登入會員';
            document.getElementById('notice').style.display = 'block';        
        }
    })
});


async function scheduleNewBooking(data) {
    let url = "/api/booking"
    let options = {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-type": "application/json",
      }
    }
    try {
      let resp = await fetch(url, options);
      let result = await resp.json();
      if (result.ok) {
        console.log(result);
        console.log("成功新增");
        document.location.href = '/booking';
      } else {
        console.log(result.message)
        noticeMsg.textContent = result.message;
        document.getElementById('notice').style.display = 'block';

      }
    } catch (err) {
        console.log({ "error": err.message });
    } 
  }