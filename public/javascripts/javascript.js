function validate() {
  if (
    nameValidate() == true &&
    emailValidate() == true &&
    mobileValidate() == true &&
    passwordValidate() == true
  ) {
    return true;
  } else {
    alert("Please Enter Correct details");
    return false;
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
  var mobilePattern = /^[0-9]{10}$/;

  if (varMobile == "") {
    $("#errormsg2").html("Mobile Number is mandatory");
    return false;
  } else if (varMobile.length < 10 || varMobile.length > 10) {
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
  } else if (
    (password.length < 8 || password.length > 16) &&
    (confirmPassword.length < 8 || confirmPassword.length > 16)
  ) {
    $("#errormsg6").html("Password Should be in between 8 and 16 characters");
    return false;
  } else if (confirmPassword != password) {
    $("#errormsg6").html("Password doesn't matches");
    return false;
  } else {
    $("#errormsg3").html("");
    $("#errormsg6").html("");
    $("#successmsg").html("Password Matches");
    return true;
  }
}

//Click Div in Profile Section

function myFunction() {
  var element = document.getElementById("section-A");
  element.classList.toggle("d-block");
}

//Admin-Product-Validate

function proValidate() {
  if (
    proNameValidate() == true &&
    priceValidate() == true && 
    maxPriceValidate() == true &&
    stockValidate() == true &&
    selectCat() == true &&
    fileValidation() == true &&
    checkColor()==true &&
    selectSubCat()==true &&
    checkSize()==true
  ) {
    return true;
  } else {
    alert("Please Enter Correct details");
    return false;
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
  var pricePattern = /(\-?\d*\.?\d+)/;

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

function maxPriceValidate() {
  var maxprice = $("#maxprice").val();
  var maxpricePattern = /(\-?\d*\.?\d+)/;

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

  if (stock == "") {
    $("#errormsg2").html("Stock is mandatory");
    return false;
  } else if (stock.match(stockPattern)) {
    $("#errormsg2").html("");
    return true;
  } else {
    $("#errormsg2").html("Enter correct stock");
    return false;
  }
}

function fileValidation() {
  if ($("#id_image1").val() == "" ||  $("#id_image2").val() == "" ) {
    return false;
  } else {
    return true;
  }
}

function selectCat() {
  select = document.getElementById("Category"); // or in jQuery use: select = this;
  if (select.value) {
    return true;
  }
  return false;
}

function selectSubCat() {
  select = document.getElementById("subCat"); // or in jQuery use: select = this;
  if (select.value) {
    return true;
  }
  return false;
}

function checkColor()
{
    var form_data = new FormData(document.querySelector("form"));
    if(!form_data.has("Colour"))
    {
      return false;      
    }
    else
    {
      return true;
    }
}

function checkSize()
{
    var form_data = new FormData(document.querySelector("form"));
    if(!form_data.has("Size"))
    {
      return false;      
    }
    else
    {
      return true;
    }
}

//Delete-Product

function deleteProduct(cartId, prodId, size, color) {
  const swalWithBootstrapButtons = Swal.mixin({
    customClass: {
      confirmButton: 'btn btn-success',
      cancelButton: 'btn btn-danger'
    },
    buttonsStyling: false
  })
  
  swalWithBootstrapButtons.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'No, cancel!',
    reverseButtons: true
  }).then((result) => {
    if (result.isConfirmed) {
      $.ajax({
        url: "/delete-cart-product",
        data: {
          size: size,
          color: color,
          cart: cartId,
          product: prodId,
        },
        method: "post",
        success: (response) => {
          if (response.removeProduct) {
            swalWithBootstrapButtons.fire(
              'Deleted!',
              'Your file has been deleted.',
              'success'
            ).then(()=>{
              location.reload();
            })  
          }
        },
      })
    } else if (
      /* Read more about handling dismissals below */
      result.dismiss === Swal.DismissReason.cancel
    ) {
     
    }
  })
}

//Delete-SubCategory

function delete_sub(subcat, catId) {
  $.ajax({
    url: "/admin/delete-subcategory",
    method: "get",
    data: {
      subcat: subcat,
      catId: catId,
    },
    success: (response) => {
      if (response.status) {
        location.reload();
      } else {
        alert("Error");
      }
    },
  });
}

//Pincode API

function pinSearch(pinCode) {
  document.getElementById("pin_button").style.visibility = "hidden";
  document.getElementById("spinner").style.visibility = "visible";
  $.ajax({
    url: "/pinsearch?pin=" + pinCode,
    method: "get",
    success: (response) => {
      if(response.name=='Error'){
        document.getElementById("pin_button").style.visibility = "visible";
        document.getElementById("spinner").style.visibility = "hidden";
        Swal.fire({
          toast: true,
          title: "Sorry Invalid Input",
          icon: "error",
          animation: false,
          position: "bottom",
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener("mouseenter", Swal.stopTimer);
            toast.addEventListener("mouseleave", Swal.resumeTimer);
          },
        });
      }else{
      console.log(response);
      document.getElementById("pin_button").style.visibility = "visible";
      document.getElementById("spinner").style.visibility = "hidden";
      document.getElementById("state").value = response.circle;
      document.getElementById("city").value = response.district;
      document.getElementById("office").value = response.office;
      }
    },
  });
}

//Profile-Card

$(document).ready(function () {
  $("ul li").on("click", function () {
    $("ul li").removeClass("active");
    $(this).addClass("active");
    $("#list > div").removeClass("d-block , d-none");
    $("#list > div").addClass("d-none");
    $("#" + $(this).attr("value")).removeClass("d-none");
    $("#" + $(this).attr("value")).addClass("d-block");
    $(".nice-select").remove();
  });
  $("ul li p").on("click", function () {
    var val = $(this).html();
    $("#myInput").val(val);
  });
});

// Price Filter Low to High

$("#low-to-high").on("change", function () {
  var val = $(this).find(":selected").val();
  $.ajax({
    url: "/low-to-high?val=" + val,
    method: "get",
    success: (res) => {
      html = "";
      for (i = 0; i < res.length; i++) {
        if (res.length == 0) {
          $("#filter-products").html(`<img src='/images/no_result.png'>`);
        }
        html =
          html +
          `<div class="col-lg-4 col-md-6 col-sm-6 hide-div">
                 <div class="product__item">
                     <a href="/product?id=${res[i]._id}" target="_blank">
                         <div class="product__item__pic set-bg"
                             data-setbg="/product-images/${res[i].Imageid[0]}" style="background-image :url('/product-images/${res[i].Imageid[0]}')">

                         </div>

                     </a>
                     <div class="product__item__text">
                         <h6 class="brand">${res[i].Name}</h6>
                         <h6 class=" text-truncate">${res[i].Title}</h6>
                        
                        
                         <div class="rating">
                             
                         </div>
                         <h5>₹ ${res[i].Price}</h5> 
                         <span
                             style="color: #b7b7b7;font-size: 15px;font-weight: 400;text-decoration: line-through;">₹
                             ${res[i].Maxprice}</span>
                         <div class="product__color__select">
                             for(i=0;i<${res[i].Colour}.length;i++){
                                  <label class="${this}" for="pc-6">
                                 <input type="radio" id="">
                                 </label>
                             }
                         </div>
                     </div>
                 </div>
             </div>`;

        $("#filter-products").html(html);
      }
    },
  });
});

//Get Price Filter

function onclickFunction(val1, val2, cat) {
  $.ajax({
    url: "/price-filter?val1=" + val1 + "&val2=" + val2 + "&cat=" + cat,
    method: "get",
    success: (res) => {
      console.log(res);
      if (res.length == 0) {
        $("#filter-products").html(`<img src='/images/no_result.png'>`);
      }
      html = "";
      for (i = 0; i < res.length; i++) {
        html =
          html +
          `<div class="col-lg-4 col-md-6 col-sm-6 hide-div">
                    <div class="product__item">
                        <a href="/product?id=${res[i]._id}" target="_blank">
                            <div class="product__item__pic set-bg"
                                data-setbg="/product-images/${res[i].Imageid[0]}" style="background-image :url('/product-images/${res[i].Imageid[0]}')">

                            </div>

                        </a>
                        <div class="product__item__text">
                            <h6 class="brand">${res[i].Name}</h6>
                            <h6 class=" text-truncate">${res[i].Title}</h6>
                            <ul class="product__hover">
                                <li><a href="#"><img style="padding-left: 13rem !important;"
                                            src="img/icon/heart.png" alt=""></a></li>

                            </ul>
                           
                            <div class="rating">
                              
                            </div>
                            <h5>₹ ${res[i].Price}</h5> 
                            <span
                                style="color: #b7b7b7;font-size: 15px;font-weight: 400;text-decoration: line-through;">₹
                                ${res[i].Maxprice}</span>
                            <div class="product__color__select">
                                
                             
                            </div>
                        </div>
                    </div>
                </div>`;

        $("#filter-products").html(html);
      }
    },
  });
}

//Coupon Search

$("#coupon-search").submit((e) => {
  e.preventDefault();
  $.ajax({
    url: "/coupon-search",
    method: "post",
    data: $("#coupon-search").serialize(),
    success: (response) => {
      console.log(response);
      if (response.timeout) {
        Swal.fire({
          toast: true,
          title: "Sorry this Coupon is Expired!",
          icon: "error",
          animation: false,
          position: "bottom",
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener("mouseenter", Swal.stopTimer);
            toast.addEventListener("mouseleave", Swal.resumeTimer);
          },
        });
      } else if (response.used) {
        Swal.fire({
          toast: true,
          title: "Sorry this Coupon already Used",
          icon: "error",
          animation: false,
          position: "bottom",
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener("mouseenter", Swal.stopTimer);
            toast.addEventListener("mouseleave", Swal.resumeTimer);
          },
        });
      } else {
        Swal.fire({
          toast: true,
          icon: "success",
          title: "Coupon Applied Successfully",
          animation: false,
          position: "bottom",
          showConfirmButton: false,
          timer: 500,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener("mouseenter", Swal.stopTimer);
            toast.addEventListener("mouseleave", Swal.resumeTimer);
          },
        }).then(() => {
          location.reload();
        });
      }
    },
  });
});


//Delete Coupon

function delete_coupon() {
  $.ajax({
    url: "/delete-coupon",
    method: "get",
    success: (res) => {
      Swal.fire({
        toast: true,
        title: "Coupon Removed",
        icon: "error",
        animation: false,
        position: "bottom",
        showConfirmButton: false,
        timer: 500,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.addEventListener("mouseenter", Swal.stopTimer);
          toast.addEventListener("mouseleave", Swal.resumeTimer);
        },
      }).then(() => {
        location.reload();
      });
    },
  });
}

//Add to Wishlist

function addToWishlet(proId, userId) {
  if (userId == "") {
    swal("Please Login to Wishlist").then(() => {
      return false;
    });
  } else {
    $("#" + proId).hide();
    $("#heart-" + proId).show();
    $.ajax({
      url: "/add-to-wishlet?proId=" + proId + "&userId=" + userId,
      method: "get",
      success: (res) => {
        if (res.status) {
          Swal.fire({
            toast: true,
            icon: "success",
            title: "Added to Wishlist",
            animation: false,
            position: "bottom",
            showConfirmButton: false,
            timer: 1000,
            timerProgressBar: true,
            didOpen: (toast) => {
              toast.addEventListener("mouseenter", Swal.stopTimer);
              toast.addEventListener("mouseleave", Swal.resumeTimer);
            },
          });
        } else {
          $("#" + proId).show();
          $("#heart-" + proId).hide();
        }
        if (res.already) {
          $("#" + proId).show();
          $("#heart-" + proId).hide();
          Swal.fire({
            toast: true,
            title: "Removed from Wishlist",
            icon: "error",
            animation: false,
            position: "bottom",
            showConfirmButton: false,
            timer: 1000,
            timerProgressBar: true,
            didOpen: (toast) => {
              toast.addEventListener("mouseenter", Swal.stopTimer);
              toast.addEventListener("mouseleave", Swal.resumeTimer);
            },
          });
        }
      },
    });
  }
}

//Apply Wallet

function apply_wallet(id,val){
  $.ajax({
      url:'/apply-wallet?id='+id+'&val='+val,
      method:'get',
      success:(response)=>{
          location.reload()
      }
  })
}

//Delete Wallet

function delete_wallet(id,val){
  $.ajax({
      url:'/delete-wallet?id='+id+'&val='+val,
      method:'get',
      success:(res)=>{
          location.reload()
      }
  })
}


//Pagination Javascript

var items = $(".list-wrapper .list-item");
var numItems = items.length;
var perPage = 6;
items.slice(perPage).hide();

$("#pagination-container").pagination({
  items: numItems,
  itemsOnPage: perPage,
  prevText: "&laquo;",
  nextText: "&raquo;",
  onPageClick: function (pageNumber) {
    var showFrom = perPage * (pageNumber - 1);
    var showTo = showFrom + perPage;
    items.hide().slice(showFrom, showTo).show();
  },
});

//Get Ordered Products

function getProducts(orderId, userId) {
  $.ajax({
    url: "/get-order-products",
    method: "get",
    data: {
      orderId: orderId,
      userId: userId,
    },
    success: (response) => {
      location.href = "/my-order-products";
    },
  });
}

//Razor

$("#checkout-form").submit((e) => {
  e.preventDefault();
  $.ajax({
    url: "/place-orders",
    method: "post",
    data: $("#checkout-form").serialize(),
    success: (response) => {
      if (response.status) {
        location.href = "/order-success";
      } else if (response.val) {
        location.href = response.val;
      } else {
        razorpayPayment(response.order);
      }
    },
  });
});

function razorpayPayment(order) {
  var amount = parseFloat(order.amount);
  var options = {
    key: "rzp_test_hNaTYcR7AgE7ZH",
    amount: amount,
    currency: "INR",
    name: "Milana",
    description: "Order for Milana",
    image: "",
    order_id: order.id,
    handler: function (response) {
      // alert(response.razorpay_payment_id);
      // alert(response.razorpay_order_id);
      // alert(response.razorpay_signature)

      verifyPayment(response, order);
    },
    prefill: {
      name: "Sreejith R S",
      email: "sreejithrs001@gmail.com",
      contact: "9744276104",
    },
    notes: {
      address: "Razorpay Corporate Office",
    },
    theme: {
      color: "#3399cc",
    },
  };

  var rzp1 = new Razorpay(options);
  rzp1.open();
}

function verifyPayment(payment, order) {
  console.log(payment);
  $.ajax({
    url: "/verify-payment",
    data: {
      payment,
      order,
    },
    method: "post",
    success: (response) => {
      if (response.status) {
        location.href = "/order-success";
      } else {
        alert("payment failed");
      }
    },
  });
}


//Product Image Input In Admin Section


const imagebox1 = document.getElementById('image-box1')
const crop_btn1 = document.getElementById('crop-btn1')
const input1 = document.getElementById('id_image1')
 function viewImage1(event){
      document.getElementById('imgView1').src=URL.createObjectURL(event.target.files[0])
  }
// When user uploads the image this event will get triggered
input1.addEventListener('change', () => {
  // Getting image file object from the input variable
  const img_data1 = input1.files[0]
  // createObjectURL() static method creates a DOMString containing a URL representing the object given in the parameter.
  // The new object URL represents the specified File object or Blob object.
  const url1 = URL.createObjectURL(img_data1)
  // Creating a image tag inside imagebox which will hold the cropping view image(uploaded file) to it using the url created before.
  imagebox1.innerHTML = `<img src="${url1}" id="image1" style="width:100%;">`
  // Storing that cropping view image in a variable
  const image1 = document.getElementById('image1')
  
  // Displaying the image box
  document.getElementById('image-box1').style.display = 'block'
  // Displaying the Crop buttton
  document.getElementById('crop-btn1').style.display = 'block'
  // Hiding the Post button
  const cropper1 = new Cropper(image1, {
    autoCropArea: 1,
    viewMode: 1,
    scalable: false,
    zoomable: false,
    movable: false,
    minCropBoxWidth: 200,
    minCropBoxHeight: 200,
  })
  // When crop button is clicked this event will get triggered
  crop_btn1.addEventListener('click', () => {
    // This method coverts the selected cropped image on the cropper canvas into a blob object
    cropper1.getCroppedCanvas().toBlob((blob) => {
      // Gets the original image data
      let fileInputElement1 = document.getElementById('id_image1');
      // Make a new cropped image file using that blob object, image_data.name will make the new file name same as original image
      let file1 = new File([blob], img_data1.name, { type: "image/*", lastModified: new Date().getTime() });
      // Create a new container
      let container1 = new DataTransfer();
      // Add the cropped image file to the container
      container1.items.add(file1);
      // Replace the original image file with the new cropped image file
      fileInputElement1.files = container1.files;
      document.getElementById('imgView1').src= URL.createObjectURL(fileInputElement1.files[0])
      // Hide the cropper box
      document.getElementById('image-box1').style.display = 'none'
      // Hide the crop button
      document.getElementById('crop-btn1').style.display = 'none'
    })
  })
})

//2

const imagebox2 = document.getElementById('image-box2')
const crop_btn2 = document.getElementById('crop-btn2')
const input2 = document.getElementById('id_image2')
 function viewImage2(event){
      document.getElementById('imgView2').src=URL.createObjectURL(event.target.files[0])
  }
// When user uploads the image this event will get triggered
input2.addEventListener('change', () => {
  // Getting image file object from the input variable
  const img_data2 = input2.files[0]
  // createObjectURL() static method creates a DOMString containing a URL representing the object given in the parameter.
  // The new object URL represents the specified File object or Blob object.
  const url2 = URL.createObjectURL(img_data2)
  // Creating a image tag inside imagebox which will hold the cropping view image(uploaded file) to it using the url created before.
  imagebox2.innerHTML = `<img src="${url2}" id="image2" style="width:100%;">`
  // Storing that cropping view image in a variable
  const image2 = document.getElementById('image2')
  
  // Displaying the image box
  document.getElementById('image-box2').style.display = 'block'
  // Displaying the Crop buttton
  document.getElementById('crop-btn2').style.display = 'block'
  // Hiding the Post button
  const cropper2 = new Cropper(image2, {
    autoCropArea: 1,
    viewMode: 1,
    scalable: false,
    zoomable: false,
    movable: false,
    minCropBoxWidth: 200,
    minCropBoxHeight: 200,
  })
  // When crop button is clicked this event will get triggered
  crop_btn2.addEventListener('click', () => {
    // This method coverts the selected cropped image on the cropper canvas into a blob object
    cropper2.getCroppedCanvas().toBlob((blob) => {
      // Gets the original image data
      let fileInputElement2 = document.getElementById('id_image2');
      // Make a new cropped image file using that blob object, image_data.name will make the new file name same as original image
      let file2 = new File([blob], img_data2.name, { type: "image/*", lastModified: new Date().getTime() });
      // Create a new container
      let container2 = new DataTransfer();
      // Add the cropped image file to the container
      container2.items.add(file2);
      // Replace the original image file with the new cropped image file
      fileInputElement2.files = container2.files;
      document.getElementById('imgView2').src= URL.createObjectURL(fileInputElement2.files[0])
      // Hide the cropper box
      document.getElementById('image-box2').style.display = 'none'
      // Hide the crop button
      document.getElementById('crop-btn2').style.display = 'none'
    })
  })
})

//3

const imagebox3 = document.getElementById('image-box3')
const crop_btn3 = document.getElementById('crop-btn3')
const input3 = document.getElementById('id_image3')
 function viewImage3(event){
      document.getElementById('imgView3').src=URL.createObjectURL(event.target.files[0])
  }
// When user uploads the image this event will get triggered
input3.addEventListener('change', () => {
  // Getting image file object from the input variable
  const img_data3 = input3.files[0]
  // createObjectURL() static method creates a DOMString containing a URL representing the object given in the parameter.
  // The new object URL represents the specified File object or Blob object.
  const url3 = URL.createObjectURL(img_data3)
  // Creating a image tag inside imagebox which will hold the cropping view image(uploaded file) to it using the url created before.
  imagebox3.innerHTML = `<img src="${url3}" id="image3" style="width:100%;">`
  // Storing that cropping view image in a variable
  const image3 = document.getElementById('image3')
  
  // Displaying the image box
  document.getElementById('image-box3').style.display = 'block'
  // Displaying the Crop buttton
  document.getElementById('crop-btn3').style.display = 'block'
  // Hiding the Post button
  const cropper3 = new Cropper(image3, {
    autoCropArea: 1,
    viewMode: 1,
    scalable: false,
    zoomable: false,
    movable: false,
    minCropBoxWidth: 200,
    minCropBoxHeight: 200,
  })
  // When crop button is clicked this event will get triggered
  crop_btn3.addEventListener('click', () => {
    // This method coverts the selected cropped image on the cropper canvas into a blob object
    cropper3.getCroppedCanvas().toBlob((blob) => {
      // Gets the original image data
      let fileInputElement3 = document.getElementById('id_image3');
      // Make a new cropped image file using that blob object, image_data.name will make the new file name same as original image
      let file3 = new File([blob], img_data3.name, { type: "image/*", lastModified: new Date().getTime() });
      // Create a new container
      let container3 = new DataTransfer();
      // Add the cropped image file to the container
      container3.items.add(file3);
      // Replace the original image file with the new cropped image file
      fileInputElement3.files = container3.files;
      document.getElementById('imgView3').src= URL.createObjectURL(fileInputElement3.files[0])
      // Hide the cropper box
      document.getElementById('image-box3').style.display = 'none'
      // Hide the crop button
      document.getElementById('crop-btn3').style.display = 'none'
    })
  })
})


//4

const imagebox4 = document.getElementById('image-box4')
const crop_btn4 = document.getElementById('crop-btn4')
const input4 = document.getElementById('id_image4')
 function viewImage4(event){
      document.getElementById('imgView4').src=URL.createObjectURL(event.target.files[0])
  }
// When user uploads the image this event will get triggered
input4.addEventListener('change', () => {
  // Getting image file object from the input variable
  const img_data4 = input4.files[0]
  // createObjectURL() static method creates a DOMString containing a URL representing the object given in the parameter.
  // The new object URL represents the specified File object or Blob object.
  const url4 = URL.createObjectURL(img_data4)
  // Creating a image tag inside imagebox which will hold the cropping view image(uploaded file) to it using the url created before.
  imagebox4.innerHTML = `<img src="${url4}" id="image4" style="width:100%;">`
  // Storing that cropping view image in a variable
  const image4 = document.getElementById('image4')
  
  // Displaying the image box
  document.getElementById('image-box4').style.display = 'block'
  // Displaying the Crop buttton
  document.getElementById('crop-btn4').style.display = 'block'
  // Hiding the Post button
  const cropper4 = new Cropper(image4, {
    autoCropArea: 1,
    viewMode: 1,
    scalable: false,
    zoomable: false,
    movable: false,
    minCropBoxWidth: 200,
    minCropBoxHeight: 200,
  })
  // When crop button is clicked this event will get triggered
  crop_btn4.addEventListener('click', () => {
    // This method coverts the selected cropped image on the cropper canvas into a blob object
    cropper4.getCroppedCanvas().toBlob((blob) => {
      // Gets the original image data
      let fileInputElement4 = document.getElementById('id_image4');
      // Make a new cropped image file using that blob object, image_data.name will make the new file name same as original image
      let file4 = new File([blob], img_data4.name, { type: "image/*", lastModified: new Date().getTime() });
      // Create a new container
      let container4 = new DataTransfer();
      // Add the cropped image file to the container
      container4.items.add(file4);
      // Replace the original image file with the new cropped image file
      fileInputElement4.files = container4.files;
      document.getElementById('imgView4').src= URL.createObjectURL(fileInputElement4.files[0])
      // Hide the cropper box
      document.getElementById('image-box4').style.display = 'none'
      // Hide the crop button
      document.getElementById('crop-btn4').style.display = 'none'
    })
  })
})

//Delete Address

function delete_address(userId,addId){
  $.ajax({
    url:'/delete-address?userId='+userId+'&addId='+addId,
    method:'get',
    success:(res)=>{
      location.reload()
    }
  })
}


//Checkout-Address-Validation

function addressValidate() {
  if (
    FNameValidate() == true &&
    LNameValidate() == true &&
    add1Validate() == true &&
    add2Validate() == true &&
    EmailValidate() == true &&
    MobileValidate() == true &&
    pinValidate() == true &&
    stateValidate() == true &&
    cityValidate() == true
  ) {
    return true;
  } else {
    alert("Please Enter Correct details");
    return false;
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
  var mobilePattern = /^[0-9]{10}$/;

  if (varMobile == "") {
    $("#errormsg2").html("Mobile Number is mandatory");
    return false;
  } else if (varMobile.length < 10 || varMobile.length > 10) {
    $("#errormsg2").html("Number should be 10 digits");
  } else if (varMobile.match(mobilePattern)) {
    $("#errormsg2").html("");
    return true;
  } else {
    $("#errormsg2").html("");
    return false;
  }
}

function stateValidate() {
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

function cityValidate() {
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

  if (stock == "") {
    $("#errormsg6").html("Pincode is mandatory");
    return false;
  } else if (stock.match(stockPattern)) {
    $("#errormsg6").html("");
    return true;
  } else {
    $("#errormsg6").html("Enter correct Pincode");
    return false;
  }
}

function add1Validate() {
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

function add2Validate() {
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

//Validate Checkout Form

function placeOrderValidate() {
  if (checkBoxvalidate() == true && checkboxAddress() == true) {
    return true;
  } else {
    return false;
  }
}

function checkBoxvalidate() {
  if ($("input[name=payment-method]:checked").length > 0) {
    return true;
  } else {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Payment not selected!",
    });
    return false;
  }
}

function checkboxAddress() {
  if ($("input[name=address]:checked").length > 0) {
    return true;
  } else {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Address not Selected!",
    });
    return false;
  }
}
