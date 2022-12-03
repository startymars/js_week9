let api_path="cream21";
let token="OnFkkZGjWxcQwpPZ8GqmHqUvuUA2";

console.log(api_path,token);





/* 初始化*/
function init(){
    productList()
    carsListData()
}
init()

/* html列表 */
function htmlList(item){
    let listStr="";
    listStr=`<li class="productCard">
    <h4 class="productType">新品</h4>
    <img src="${item.images}" alt="">
    <a href="#" class="addCardBtn" data-id="${item.id}">加入購物車</a>
    <h3>${item.title}</h3>
    <del class="originPrice">NT${item.origin_price}</del>
    <p class="nowPrice">NT${item.price}</p>
    </li>`;
    return listStr;
} 


let productData;
const productLister=document.querySelector(".productWrap");

/* 列出產品列表*/
function productList(){
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`)
        .then(function(response){
            productData=response.data.products;
            // console.log(productData);
            let productListStr="";

            productData.forEach(function(item){
                productListStr+=htmlList(item);;
            });
            productLister.innerHTML=productListStr;
        })
}

/* 篩選產品*/
const productSelect=document.querySelector(".productSelect");
// console.log(productSelect);

productSelect.addEventListener("change",function(e){
   
    const selectItem=e.target.value;
    if(selectItem=="全部"){
        init();
        return;
    }else{
        let selectData="";
        productData.forEach(function(item){
            if(item.category==selectItem){
                
                selectData+=htmlList(item);
            }
        
        });
        productLister.innerHTML=selectData;
    }

});





 /*取得我的購物車列表*/
 const cardBodyList=document.querySelector(".card-bodyList");

 /*取得購物車列表*/ 
let carData;
function carsListData(){
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
        .then(function(response){
            carData=(response.data.carts);
            
            console.log(carData);

               /*總金額 */
            const finalTotal=response.data.finalTotal;
           
            document.querySelector(".finalTotal").textContent=finalTotal;

            let carStr="";
            carData.forEach(function(item){
                carStr+=`<tr>
                    <td>
                        <div class="cardItem-title">
                            <img src="${item.product.images}" alt="">
                            <p>${item.product.title}</p>
                        </div>
                    </td>
                    <td>NT$${item.product.price}</td>
                    <td>${item.quantity}</td>
                    <td>NT$${item.product.price*item.quantity}</td>
                    <td class="discardBtn">
                        <a href="#" class="material-icons" data-id=${item.id}>
                            clear
                        </a>
                    </td>
                </tr>`;
            });

            cardBodyList.innerHTML=carStr;
           
        })
}


/*點擊加入購物車*/ 
productLister.addEventListener("click",function(e){
    e.preventDefault();
    console.log(e.target);
    let selectScope=e.target.getAttribute("class");
 //    console.log(selectScope);
    if(selectScope!="addCardBtn"){
        alert("不要亂按");
         return;
    }
 
     const selectScopeId=e.target.getAttribute("data-id");
     console.log(selectScopeId);

    let cartNum=1;
     carData.forEach(function(item){
         /*檢查購物車是否已經有該項產品 */
        if(item.product.id==selectScopeId){
            cartNum=item.quantity+1;
        }
     });

     console.log(cartNum);
    
    /*對應至購物車列表 */
    axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`,{
     "data": {
       "productId": selectScopeId,
       "quantity": cartNum
     }
   }).then(function(response){
     console.log(response.data);
     alert("加入購物車");
     carsListData();
   });
 

 });


 /*刪除購物車部分產品 */

 cardBodyList.addEventListener("click",function(e){
     e.preventDefault();
     const cardId=e.target.getAttribute("data-id");
     if(cardId==null){
         alert("點擊到其他位置");
         return;
     }
     
     axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${cardId}`)
        .then(function(response){
            alert("成功刪除");
            carsListData();
        });

 })

  /*刪除購物車全部產品 */

const carFooterBtn=document.querySelector(".car_footerBtn");
carFooterBtn.addEventListener("click",function(e){
    e.preventDefault();
    console.log(e.target);
    let discardAllBtn=e.target.getAttribute("class");
    console.log(discardAllBtn);
    if(discardAllBtn==null){
        console.log("我不是按鈕");
        return;
    }

    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
    .then(function(response){
        alert("購物車已清空");
        carsListData();
    })
    .catch(function(response){
        alert("購物車已清空，請勿重新點擊");
    })

});


 /*點擊送出預定資料 */
const orderBtn=document.querySelector(".orderInfo-btn");
orderBtn.addEventListener("click",function(e){
    e.preventDefault();
   if(carData.length==0){
       alert("請先將商品加入購物車");
       return;
   }else{
    console.log("太綁了購物車有商品");
   }

   const ordername=document.querySelector("#customerName").value;
   const orderPhone=document.querySelector("#customerPhone").value;
   const orderEmail=document.querySelector("#customerEmail").value;
   const orderaddress=document.querySelector("#customerAddress").value;
   const orderPay=document.querySelector(".orderInfo-input").value;

     /*檢查是否空值 */
   if(ordername==""||orderPhone==""||orderEmail==""||orderaddress==""||orderPay==""){
       alert("請完整填寫訂單資訊");
       return;
   }

   axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`,{
    "data": {
      "user": {
        "name": ordername,
        "tel": orderPhone,
        "email": orderEmail,
        "address": orderaddress,
        "payment": orderPay
      }
    }
  })
    .then(function(response){
        alert("成功傳送");
        document.querySelector("#customerName").value="";
        document.querySelector("#customerPhone").value="";
        document.querySelector("#customerEmail").value="";
        document.querySelector("#customerAddress").value="";
        document.querySelector(".orderInfo-input").value="ATM";

        carsListData();

    });
});


















    





