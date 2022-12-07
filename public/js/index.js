/*------------------------------
 2022/11/25 - v1.0 載入景點 
 -------------------------------*/
let isLoading = false; 
let page = 0;
let keyword = '';
let url="api/attractions?page=0"; //初次載入的url
const attractionContainer = document.querySelector("#attractionList");

//清除js
const clearHTML = (name) => { name.innerHTML = "";};

// 載入時的 icon
const loadingEle = document.querySelector("#loading");
const toggleLoading = (isLoading) => {loadingEle.classList.toggle("show", isLoading)};

async function fetchAPI(url) {
    const resp = await fetch(url);
    const data = await resp.json();
    return data;
}

// 組出 DOM fn
const renderAttraction = (item) => {
    let itemTitle=item.name,
        itemCat=item.category,
        itemLink=item.id,
        itemMrt=item.mrt,
        itemImg=item.images[0];
    const htmlStr =`<li class="card">
                        <a class="card-link" href="/attraction/${itemLink}">
                            <div class="card-img"><img src="${itemImg}" alt=""></div>
                            <div class="card-title">${itemTitle}</div>
                        </a>
                        <div class="card-detail">
                            <div class="card-mrt">${itemMrt}</div>
                            <div class="card-cat">${itemCat}</div>
                        </div>
                    </li>`;
    attractionContainer.insertAdjacentHTML("beforeend",htmlStr);
};

// 偵測觸發fn
let infScrollCallback=(entries, observer)=>{ 
    const entry = entries[0];
    //console.log(entry)
    if (!entry.isIntersecting) return; 
    if ( page !== null && isLoading === false){  
        isLoading=true;  // 可以發出請求就把請求狀態改為 true
        toggleLoading(true);
        fetchAPI(url)
        .then((data)=>{
            data.data.forEach((item) => renderAttraction(item));
            page=data['nextPage'];
            url="api/attractions?page="+page;
            isLoading=false;
            toggleLoading(false);
        }).catch((error)=>{
            console.log("連線失敗", error);
            isLoading=false; 
            toggleLoading(false);
        })
    }else{
        observer.unobserve(footer);  // 取消觀察目標
    }
}; 

// 視窗偵測觸發 IntersectionObserver API 
let options={}
let observer = new IntersectionObserver(infScrollCallback, options);  
// 如果用footer就可以不用一開始先載入一次東西
const footer=document.querySelector("footer");  
observer.observe(footer);  



/*------------------------------
 2022/11/25 - v1.0 查詢景點 
 -------------------------------*/
 const txtSearchInput = document.querySelector('#txtSearchInput');
 const txtSearchBtn = document.querySelector('#txtSearchBtn');
 const attractionWrp = document.querySelector(".attraction");  
 const attractionErr = document.querySelector('#attractionErr');

 function keywordSearch(keyword){
    url=`api/attractions?page=0&keyword=${keyword}`;
    clearHTML(attractionContainer);
    clearHTML(attractionErr);
    if( isLoading === false ){
        isLoading == true;
        fetchAPI(url)
        .then((data)=>{
            clearHTML(attractionContainer);
            clearHTML(attractionErr);
            if( data['error'] === true){
                errorMsg(data['message']);
                observer.unobserve(footer);
            }else{
                data.data.forEach((item) => renderAttraction(item));
                observer.observe(footer); 
                page=data['nextPage'];
                url=`api/attractions?page=${page}&keyword=${keyword}`;
                isLoading===false;
                toggleLoading(false);
            }
        }).catch(error=>{
            console.log(error);
            //clearHTML(attractionErr);

            attractionErr.innerHTML="很抱歉找不到資料"
            isLoading===false;
            toggleLoading(false);
        })
    }
 }

// 查詢景點名稱
txtSearchBtn.addEventListener("click", (e)=>{
    const txtSearchInputVal = txtSearchInput.value;
    keywordSearch(txtSearchInputVal);
})


// 查詢景點 input 鍵盤 Enter 和 查詢按鈕連結
txtSearchInput.addEventListener("keyup", (e)=>{
    const txtSearchInputVal = txtSearchInput.value;
    if(e.keyCode === 13){
        e.preventDefault();
        txtSearchBtn.click();
    }
})

// 搜尋分類關鍵字categories

// const catList = document.querySelector('#catList > ul');
const catListContainer = document.querySelector('#catList');
const catListUl = document.querySelector('#catList > ul');
const toggleCatList = (isShow) => {catListContainer.classList.toggle("show", isShow)};
const fillValue = (value) => { txtSearchInput.value = value ; toggleCatList(false); };

txtSearchInput.addEventListener("click",(e)=> {
    toggleCatList(true);
    clearHTML(catListUl);
    fetchAPI('/api/categories')
    .then((data)=>{
        clearHTML(catListUl);
        let catList = data.data;
        for (let i = 0; i < catList.length; i++) {
            const htmlStr =`<li><a class="cat-link" onclick="javascript:fillValue('${catList[i]}')">${catList[i]}</a></li>`;
            catListUl.insertAdjacentHTML("beforeend",htmlStr);
        }
    }).catch(error=>{
        console.log(error);
    })

  });

document.addEventListener('click', function (e) {
    //e.preventDefault() //打開下面連結都會不能按
    if (txtSearchInput !== (e.target)) {
        clearHTML(catListUl);
        toggleCatList(false);
    }
  }, false);

// gotop 回上面
const goTop = document.querySelector('#gotop');
goTop.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' })
window.addEventListener('scroll', function(e){
    if( this.scrollY > 300){
        goTop.classList.add("open");
    }else{
        goTop.classList.remove("open");
    }
})
