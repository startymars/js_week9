let api_path="cream21";
let token="OnFkkZGjWxcQwpPZ8GqmHqUvuUA2";

const orderTableData=document.querySelector(".orderData");
console.log(orderTableData);

let orderData=[];
// console.log(orderData);

function init(){

    orderList()
    chartC3()
}

init()



/*取得訂單資料*/
function orderList(){

    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,{
        headers:{
            'Authorization':token,
        }
    })
    .then(function(response){

        orderData=response.data.orders;
        // console.log(orderData);

        let orderStr="";
        orderData.forEach(function(item){

        
            /*組合產品字串 */
            let productStr=""
          
            item.products.forEach(function(productItem){

                productStr+=`<p>${productItem.title}x${productItem.quantity}</p>`
              
            })
            /*判斷訂單狀態 */
            let orderStatus="";
            if(item.paid==false){
                
                orderStatus="未處理";
            }else{
                
                orderStatus="已處理";
            }

            /*更改日期格式 */
            const datatine=new Date(item.createdAt*1000); //  輸入 timestamp（毫秒），回傳設定的時間物件
            console.log(datatine);
            const orderYear=datatine.getFullYear(); //回傳年
            const orderMonth=datatine.getMonth()+1; //回傳月
            const orderDay=datatine.getDate(); //回傳日
            let orderDate=`${orderYear}/${orderMonth}/${orderDay}`;
            console.log(orderYear,orderMonth,orderDay);

            orderStr+=` <tr>
            <td>${item.id}</td>
            <td>
            <p>${item.user.name}</p>
            <p>${item.user.tel}</p>
            </td>
            <td>${item.user.address}</td>
            <td>${item.user.email}</td>
            <td>
                ${productStr}
            </td>
            <td>${orderDate}</td>
            <td class="orderStatus">
            <a href="#" class="orderStatus" data-id=${item.id} data-status=${item.paid}>${orderStatus}</a>
            </td>
            <td>
            <input type="button" class="delSingleOrder-Btn" data-id=${item.id} value="刪除">
            </td>
        </tr>`;
        });
    
        orderTableData.innerHTML=orderStr;
    })
}


orderTableData.addEventListener("click",function(e){
    e.preventDefault();
   
     /*判斷點擊是否為訂單狀態 */
    let clickTarget=e.target.getAttribute("class");
    let orderId=e.target.getAttribute("data-id");
    let dataStatus=e.target.getAttribute("data-status");
    // console.log(orderId);
   
    // console.log(dataStatus);
   
    
    if(clickTarget=="orderStatus"){
        console.log(dataStatus);
        changeOrderStatus(orderId,dataStatus);
       
        return;

    
    }else if(clickTarget=="delSingleOrder-Btn"){

        console.log("刪除");
        deleteOrder(orderId);
      
    }else{
        console.log("你點擊到其他地方");
        return;
    }
})

 /*改變訂單狀態 */
function changeOrderStatus(orderId,dataStatus){
    console.log(orderId);
    console.log(typeof(orderId));
    console.log(dataStatus);

    let newStatus="";
    if(dataStatus==="false"){
        
        newStatus=true;
        console.log(newStatus);
    }else{
        newStatus=false;
        console.log(newStatus);
    }

    axios.put(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,{
        "data":{
            "id":orderId,
            "paid":newStatus
        }
    },{
        headers:{
            'Authorization':token,
        }
    })
    .then(function(response){
        alert("更改成功");
        orderList()
    })
    .catch(function(error){
        console.log(error);
    });
}

 /*刪除某筆訂單 */
function deleteOrder(orderId){
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/${orderId}`,{
        headers:{
            'Authorization':token,
        }
    })
    .then(function(response){
        alert("刪除成功");
        orderList();
        chartC3();
    })
}

 /*刪除全部訂單 */
const discardAllBtn=document.querySelector(".discardAllBtn");
discardAllBtn.addEventListener("click",function(e){
   e.preventDefault();

   axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,{
        headers:{
            'Authorization':token,
        }
    })
    .then(function(response){
        alert("刪除成功");
        orderList();
        chartC3();
    })

});


function chartC3(){
   
    let chartProduct={};
    
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,{
        headers:{
            'Authorization':token,
        }
    })
    .then(function(response){

        orderData=response.data.orders;
        // console.log(orderData);

        orderData.forEach(function(item){
            item.products.forEach(function(chartItem){
    
                /*圖表取得品項*/
                if(chartProduct[chartItem.title]==null){
                    chartProduct[chartItem.title]=chartItem.quantity*chartItem.price;
                }else{
                    chartProduct[chartItem.title]+=chartItem.quantity*chartItem.price;
                }
    
            })
        })   

        console.log(chartProduct);

        let rankAry=[];
         /*把名稱統一用成陣列*/
        let originAry=Object.keys(chartProduct);
        console.log(originAry);
         /*用成c3格式*/
         originAry.forEach(function(item){
            let newAry=[]
            newAry.push(item);
            newAry.push(chartProduct[item]);
            rankAry.push(newAry);
         })
        
        //排序比大小 只列出前前三高當主色塊，其餘加總為其他
        rankAry.sort(function(a,b){
            return b[1]-a[1];
        });

        if(rankAry.length>3){
            let otherTotal=0;
            rankAry.forEach(function(item,index){
                //如果陣列排序為3以上，將金額合併至otherTotal
                if(index>2){
                    otherTotal+=rankAry[index][1];
                }
            });
           //切除第3個索引值後的陣列資料
            rankAry.splice(3,rankAry.length); 
            //把剩餘的用其他統整
            rankAry.push(["其他",otherTotal]);
           
        };

        console.log(rankAry);

        
        // C3.js
        let chart = c3.generate({
            bindto: '#chart', // HTML 元素綁定
            data: {
                type: "pie",
                columns:  rankAry,
                // colors:{
                //     "Louvre 雙人床架／雙人加大":"#DACBFF",
                //     "Jordan 雙人床架／雙人加大":"#9D7FEA",
                //     "Charles 系列儲物組合": "#5434A7",
                //     "其他": "#301E5F",
                // }
            },
        });
    

    })

}








    



