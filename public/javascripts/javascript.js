function validate() {
  if (nameValidate() == true  && emailValidate() == true && mobileValidate() == true && passwordValidate() == true)
  {
    return true;
  } 
  else {
    alert("Please Enter Correct details")
    return false
  }
}

function nameValidate() {
  var varname = $("#name").val();
  var pattern = /^[a-zA-Z\\s]/;

  if (varname == "") {
    $("#errormsg4").html("Name is mandatory");
    return false;
  } else if (varname.match(pattern)) {
    $("#errormsg4").html("");
    return true;
  } else {
    $("#errormsg4").html("Enter correct name");
    return false;
  }
}

function emailValidate() {
  var varEmail = $("#email").val();
  var emailPattern = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;

  if (varEmail == "") {
    $("#errormsg1").html("Email is mandatory");
    return false;
  } else if (varEmail.match(emailPattern)) {
    $("#errormsg1").html("");
    return true;
  } else {
    $("#errormsg1").html("Enter correct Email");
    return false;
  }
}

function mobileValidate() {
  var varMobile = $("#number").val();
  var mobilePattern = /^[0-9]{10}$/
  
  if(varMobile == ""){
    $("#errormsg2").html("Mobile Number is mandatory");
    return false;
  }
  else if (varMobile.length < 10 || varMobile.length > 10) {
    $("#errormsg2").html("Number should be 10 digits");
  } else if (varMobile.match(mobilePattern)) {
    $("#errormsg2").html("");
    return true;
  } else {
    $("#errormsg2").html("");
    return false;
  }
}

function passwordValidate() {
  var password = $("#password1").val();
  var confirmPassword = $("#password2").val();

  if (password == "") {
    $("#errormsg3").html("Password is mandatory");
    return false;
  } 
  else if ((password.length < 8 || password.length >16) && (confirmPassword.length < 8 || confirmPassword.length > 16)) {
    $("#errormsg6").html("Password Should be in between 8 and 16 characters");
    return false;
  } 
  else if (confirmPassword != password) {
    $("#errormsg6").html("Password doesn't matches");
    return false;
  } 
  else {
    $("#errormsg3").html("");
    $("#errormsg6").html("")
    $("#successmsg").html("Password Matches");
    return true;
  }
}


// function addToCart(proId){
//   $.ajax({
//     url:'/add-to-cart'+proId
//   })
// }


//Admin-Product-Validate

function proValidate() {
  if (proNameValidate() == true  && priceValidate() == true  && maxPriceValidate() == true && stockValidate() == true )
  {
    return true;
  } 
  else {
    alert("Please Enter Correct details")
    return false
  }
}

function proNameValidate() {
  var varname = $(".proname").val();
  var pattern = /^[a-zA-Z\\s]/;

  if (varname == "") {
    $(".errormsg4").html("This field is mandatory");
    return false;
  } else if (varname.match(pattern)) {
    $(".errormsg4").html("");
    return true;
  } else {
    $(".errormsg4").html("Enter correct name");
    return false;
  }
}

function priceValidate() {
  var price = $("#price").val();
  var pricePattern =  /(\-?\d*\.?\d+)/;

  if (price == "") {
    $("#errormsg3").html("Price is mandatory");
    return false;
  } else if (price.match(pricePattern)) {
    $("#errormsg3").html("");
    return true;
  } else {
    $("#errormsg3").html("Enter correct Price");
    return false;
  }
}


function maxPriceValidate(){
  var maxprice = $("#maxprice").val();
  var maxpricePattern =  /(\-?\d*\.?\d+)/;

  if (price == "") {
    $("#errormsg1").html("Price is mandatory");
    return false;
  } else if (maxprice.match(maxpricePattern)) {
    $("#errormsg1").html("");
    return true;
  } else {
    $("#errormsg1").html("Enter correct Price");
    return false;
  }
}

function stockValidate() {
  var stock = $("#stock").val();
  var stockPattern = /^\d+$/;
  
  if(stock == ""){
    $("#errormsg2").html("Stock is mandatory");
    return false;
  }
  else if (stock.match(stockPattern)) {
    $("#errormsg2").html("");
    return true;
  } else {
    $("#errormsg2").html("Enter correct stock");
    return false;
  }
}

//Add-to-Cart

function addCart(id,size){
  $.ajax({
      url:'/add-to-cart?id='+id+'&size='+size,
      method: 'get',
      success:(response)=>{
        if(response.status){
         let count=$('#cart-count').html()
         count=parseInt(count)+1
         $('#cart-count').html(count)
        }
       
      }
  })

  return false;
}


//Delete-Product

function deleteProduct(cartId,prodId){
  if(confirm("Are you sure you want to delete")){
    $.ajax({
      url:'/delete-cart-product',
      data:{
        cart:cartId,
        product:prodId
      },
      method:'post',
      success:(response)=>{
        if(response.removeProduct){
          location.reload()
        }
      }
    })
  }
  
}


  //Delete-SubCategory

  function delete_sub(subcat,catId){
      $.ajax({
          url: '/admin/delete-subcategory',
          method:'get',
          data:{
            subcat: subcat,
            catId: catId
          },
          success:(response)=>{
              if(response.status){
                  location.reload()
              }else{
                  alert('Error')
              }
           }

      })
  }
  
    //Pincode Api

    function pinSearch(pinCode) {
        document.getElementById('pin_button').style.visibility = 'hidden'
        document.getElementById('spinner').style.visibility = 'visible'
        $.ajax({
            url: '/pinsearch?pin=' + pinCode,
            method: 'get',
            success: (response) => {
                console.log(response)
                document.getElementById('pin_button').style.visibility = 'visible'
                document.getElementById('spinner').style.visibility = 'hidden'
                document.getElementById("state").value = response.circle
                document.getElementById("city").value = response.district
                document.getElementById("office").value = response.office
            }
        })

    }

   //Profile-Card

    $(document).ready(function () {
      $("ul li").on("click", function () {
          $("ul li").removeClass("active");
          $(this).addClass("active");
          $("#list > div").removeClass("d-block , d-none");
          $("#list > div").addClass("d-none");
          $('#' + $(this).attr('value')).removeClass("d-none");
          $('#' + $(this).attr('value')).addClass("d-block");
          $('.nice-select').remove()

      });
      $('ul li p').on('click', function () {
          var val = $(this).html()
          $('#myInput').val(val)
      })
  });



// $('#checkout-frm').submit((e)=>{
//   e.preventDefault()
//   $.ajax({
//     url:'/place-order',
//     method:'post',
//     data:$('#checkout-frm').serialize,
//     success:(response)=>{
//       console.log(response);
//       if(response.status){
//         location.href='/order-success'
//       }
//     }
//   })
// })

function getProducts(orderId,userId){
  $.ajax({
    url:'/get-order-products',
    method:'get',
    data:{
      orderId:orderId,
      userId:userId
    },
    success:(response)=>{
      location.href='/my-order-products'
    }
  })
}



//Checkout-Address-Validation

function addressValidate() {
  if (FNameValidate() == true && LNameValidate()==true &&  add1Validate()==true &&  add2Validate()==true  && EmailValidate() == true && MobileValidate() == true && pinValidate()== true && stateValidate()==true &&  cityValidate()==true && checkBoxvalidate()==true)
  {
    return true;
  } 
  else {
    alert("Please Enter Correct details")
    return false
  }
}

function FNameValidate() {
  var varname = $("#name1").val();
  var pattern = /^[a-zA-Z\\s]/;

  if (varname == "") {
    $("#errormsg4").html("First Name is mandatory");
    return false;
  } else if (varname.match(pattern)) {
    $("#errormsg4").html("");
    return true;
  } else {
    $("#errormsg4").html("Enter correct name");
    return false;
  }
}

function LNameValidate() {
  var varname = $("#name2").val();
  var pattern = /^[a-zA-Z\\s]/;

  if (varname == "") {
    $("#errormsg10").html("Last Name is mandatory");
    return false;
  } else if (varname.match(pattern)) {
    $("#errormsg10").html("");
    return true;
  } else {
    $("#errormsg10").html("Enter correct name");
    return false;
  }
}

function EmailValidate() {
  var varEmail = $("#email").val();
  var emailPattern = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;

  if (varEmail == "") {
    $("#errormsg1").html("Email is mandatory");
    return false;
  } else if (varEmail.match(emailPattern)) {
    $("#errormsg1").html("");
    return true;
  } else {
    $("#errormsg1").html("Enter correct Email");
    return false;
  }
}

function MobileValidate() {
  var varMobile = $("#number").val();
  var mobilePattern = /^[0-9]{10}$/
  
  if(varMobile == ""){
    $("#errormsg2").html("Mobile Number is mandatory");
    return false;
  }
  else if (varMobile.length < 10 || varMobile.length > 10) {
    $("#errormsg2").html("Number should be 10 digits");
  } else if (varMobile.match(mobilePattern)) {
    $("#errormsg2").html("");
    return true;
  } else {
    $("#errormsg2").html("");
    return false;
  }
}


function stateValidate(){
  var varname = $("#state").val();
  var pattern = /^[a-zA-Z\\s]/;

  if (varname == "") {
    $("#errormsg3").html("State is mandatory");
    return false;
  } else if (varname.match(pattern)) {
    $("#errormsg3").html("");
    return true;
  } else {
    $("#errormsg3").html("Enter correct State Name");
    return false;
  }
}


function cityValidate(){
  var varname = $("#city").val();
  var pattern = /^[a-zA-Z\\s]/;

  if (varname == "") {
    $("#errormsg5").html("City is mandatory");
    return false;
  } else if (varname.match(pattern)) {
    $("#errormsg5").html("");
    return true;
  } else {
    $("#errormsg5").html("Enter correct City Name");
    return false;
  }
}


function pinValidate() {
  var stock = $("#zip").val();
  var stockPattern = /^\d+$/;
  
  if(stock == ""){
    $("#errormsg6").html("Pincode is mandatory");
    return false;
  }
  else if (stock.match(stockPattern)) {
    $("#errormsg6").html("");
    return true;
  } else {
    $("#errormsg6").html("Enter correct Pincode");
    return false;
  }
}


function add1Validate(){
  var varname = $("#add1").val();
  var pattern = /^[a-zA-Z\\s]/;

  if (varname == "") {
    $("#errormsg8").html("Address 1 is mandatory");
    return false;
  } else if (varname.match(pattern)) {
    $("#errormsg8").html("");
    return true;
  } else {
    $("#errormsg8").html("Enter correct Address");
    return false;
  }
}


function add2Validate(){
  var varname = $("#add2").val();
  var pattern = /^[a-zA-Z\\s]/;

  if (varname == "") {
    $("#errormsg9").html("Address 2 is mandatory");
    return false;
  } else if (varname.match(pattern)) {
    $("#errormsg9").html("");
    return true;
  } else {
    $("#errormsg9").html("Enter correct Address");
    return false;
  }
}


function checkBoxvalidate(){
  let selectBox= document.getElementById('payment').checked
  if(selectBox){
    return true;
  }else{
    return false;
  }
}
