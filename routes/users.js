const express = require('express');
const router = express.Router();
const userHelpers=require('../helpers/userHelpers')
const prodHelpers=require('../helpers/productHelpers')
const createReferal=require('referral-code-generator')
const axios = require("axios").default;
require('dotenv').config()
const ObjectId = require("mongodb").ObjectId;
const paypal=require('paypal-rest-sdk')

const accountSid = process.env.TWILIO_accountSid;
const authToken = process.env.TWILIO_authToken;
const client = require('twilio')(accountSid, authToken);

paypal.configure({
  mode: "sandbox",
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_CLIENT_SECRET,
});




function verifyLogin(req, res, next) {
  if (req.session.loggedIn) {
    next();
  } else {
    res.redirect("/");
  }
}

function verifyCart(req, res, next) {
  if (req.session.loggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
}

/* GET Index Page . */

router.get('/',async function(req, res) {
  let user=req.session.user
  let cartCount=null
  let limited=await userHelpers.getLimitedPro()
  if(req.session.loggedIn){
    cartCount= await userHelpers.getCartCount(req.session.user._id)
  }
  userHelpers.getAllProducts().then((product)=>{
    prodHelpers.getAllCategories().then((cat)=>{
      req.session.cat=cat
      res.render('user/index',{user, head:true, product, cat,limited, footer:true, cartCount});
    })
  })
});

/* GET Signup Page . */

router.get('/signup',(req,res)=>{
  let cat=req.session.cat
  let refer=req.query.refer?req.query.refer:null
  res.render('user/signup',{'signUpErr':req.session.signUpErr,refer, 'referErr':req.session.referErr, head:true, footer:true, cat})
  req.session.signUpErr=false
  req.session.referErr=false
})

router.post('/signup',async(req,res)=>{
  let refer=createReferal.alphaNumeric('uppercase', 2, 3)
  req.body.refer=refer
  if(req.body.referedBy!=''){
    userHelpers.checkReferal(req.body.referedBy).then((data)=>{
      req.body.referedBy=data[0]._id
      req.body.wallet=100
      userHelpers.doSignUp(req.body).then((response)=>{
        req.session.loggedIn=true
        req.session.user=response.user
        res.redirect('/')
      })
    }).catch(()=>{
      req.session.referErr="Sorry No such Code Exists"
      res.redirect('/signup')
    })
  }
  else{
    userHelpers.doSignUp(req.body).then((response)=>{
      req.session.loggedIn=response.status
      req.session.user=response.user
      res.redirect('/') 
    }).catch((err)=>{
      req.session.signUpErr=err
      res.redirect('/signup')
    })
  }
})

/* GET Signup Page End. */

/* User Login Page . */

router.get('/login',(req,res)=>{
    if(req.session.loggedIn){
      res.redirect('/')
    }
    else{
      let cat=req.session.cat
      res.render('user/login',{'error':req.session.loginErr, head:true, footer:true, cat})
      req.session.loginErr=false
    }
})

router.post('/login',(req,res)=>{
  userHelpers.doLogin(req.body).then((response)=>{
    if(response.user.status){
      req.session.user=response.user
      req.session.loggedIn=true
      req.session.loginErr=null
      res.redirect('/')
    }
    else{
      req.session.loginErr="Sorry this account is Blocked"
      res.redirect('/login')
    }
  }).catch((err)=>{
    req.session.loginErr="Invalid Email or Password"
    res.redirect('/login')
  })
})

router.get('/login/verify',(req,res)=>{
  res.render('user/verify',{'error':req.session.verifyErr,head:true,footer:true})
  req.session.verifyErr=false
})

let random=Math.floor(1000 + Math.random() * 9000)

router.post('/login/verify',(req,res)=>{
  userHelpers.mobileCheck(req.body).then((user)=>{
    let number=req.body.number
    req.session.user=user
    // client.verify
    // .services(serviceSID)
    // .verifications.create({
    //     to: '+91'+ number,
    //     body: random+' is your OTP number',
    //     channel: "sms",
    //     from: '+19036183839'
    // })
    client.messages
    .create({
    body: random+' is your OTP number',
    to: '+91'+number, 
    from: '+19036183839', 
    })
   .then((message) => console.log(message));
    res.render('user/otp',{number,head:true,footer:true})
  }).catch(()=>{
    req.session.verifyErr="Mobile Number Doesn't Exists"
    res.redirect('/login/verify')
  })
})

router.post('/login/otp',(req,res)=>{
  if(random==req.body.otp){
    req.session.loggedIn=true
    res.redirect('/')
  }
  else{
    let otpErr='Invalid OTP'
    res.render('user/otp',{otpErr})
    otpErr=null
  }
})

/* User Login section End */


/* Get a product on Click . */

router.get('/product',async(req,res)=>{
  let cat=req.session.cat 
  let user=req.session.user
  let prodId=req.query.id
  cartCount=null
  if(req.session.loggedIn){
    cartCount= await userHelpers.getCartCount(req.session.user._id)
  }
  userHelpers.getAProduct(prodId).then(async(product)=>{
    let related=await userHelpers.getRelatedPro(product.Category,product.Subcategory)
    res.render('user/product',{product, head:true, user, cat, footer:true, cartCount, related})
  }).catch(async(product)=>{
    let err=true
    let related=await userHelpers.getRelatedPro(product.Category,product.Subcategory)
    res.render('user/product',{product,err, head:true, user, cat, footer:true, cartCount, related})
  })
})


/* Get Category wise Products */

router.get('/category',async(req,res)=>{
  let cat1=req.query.cat
  let user=req.session.user
  let cat=req.session.cat
  cartCount=null
  if(req.session.loggedIn){
    cartCount= await userHelpers.getCartCount(req.session.user._id)
  }
  userHelpers.getCatProd(cat1,user).then((products)=>{ 
    res.render('user/category',{products, head:true, footer:true, user, cat, cat1, cartCount })
  })
})


/* Get Sub Category wise Products  */

router.get('/subcat',async(req,res)=>{
  let subcat=req.query.subcat
  let cat1=req.query.cat
  let cat=req.session.cat
  let user=req.session.user
  cartCount=null
  if(req.session.loggedIn){
    cartCount= await userHelpers.getCartCount(req.session.user._id)
  }
  userHelpers.getSubCatProd(cat1,subcat).then((prod)=>{
    res.render('user/subcategory',{prod,head:true,footer:true,user,cat,cat1,subcat,cartCount})
  })
})

/* Get User Cart  */

router.get('/cart',verifyCart,async(req,res)=>{
  let products=await userHelpers.getCartProducts(req.session.user._id)
  cartCount=null
  if(req.session.loggedIn){
    cartCount=await userHelpers.getCartCount(req.session.user._id)
  }
  let totalValue=await userHelpers.getTotalAmount(req.session.user._id)
  let user=req.session.user
  let cat=req.session.cat
  res.render('user/cart',{products, user, cat, head:true,footer:true, cartCount, totalValue})
})

/* Use Add to Cart */

router.get('/add-to-cart/',verifyCart,(req,res)=>{
  let id=req.query.id
  let size=req.query.size
  let color=req.query.color
  let user=req.session.user._id
  userHelpers.addToCart(id,user,size,color).then(()=>{
    res.redirect('/cart')
  }).catch((err)=>{
    res.redirect('/')
  })
})

/* Add to Bag on Click */

router.get('/add-to-bag',(req,res)=>{
  let id=req.query.id
  let size=req.query.size
  let color=req.query.color
  let user=req.session.user._id
  userHelpers.addToCart(id,user,size,color).then(()=>{
    res.json({status:true})
  })
})


/* Change Product Quantity in Cart Section */

router.post('/change-product-quantity',(req,res,next)=>{
    userHelpers.changeProQuantity(req.body).then(async(response)=>{
      response.total=await userHelpers.getTotalAmount(req.body.user)
      res.json(response)
    })
})

/* Add to Wishlist */

router.get('/add-to-wishlet',(req,res)=>{
  let proId=req.query.proId;
  let userId=req.query.userId;
  userHelpers.addToWishlist(proId,userId).then((response)=>{
    res.json(response)
  })
})


router.get('/wishlist',async(req,res)=>{
  let userId=req.session.user._id
  let user=req.session.user
  let cat=req.session.cat
  carCount=null
  cartCount= await userHelpers.getCartCount(req.session.user._id)
  userHelpers.getWishlist(userId).then((prod)=>{
    res.render('user/wishlist',{head:true,cat,footer:true,prod,user,cartCount})
  })
})

router.get('/remove-wishlist',(req,res)=>{
  let user=req.session.user._id
  userHelpers.deleteWishlist(req.query.proId,user).then(()=>{
    res.redirect('/wishlist')
  })
})


/* Add to Wishlist End */

/* Delete Cart Product in Cart Page */

router.post('/delete-cart-product',(req,res,next)=>{
    userHelpers.deleteCartProduct(req.body).then((response)=>{
      res.json(response)
    })
})


/* Get Checkout Page */

router.get('/place-orders',verifyLogin, async(req,res)=>{
  let totalValue=await userHelpers.getTotalAmount(req.session.user._id)
  let products=await userHelpers.getCartProducts(req.session.user._id)
  let address=await userHelpers.getAllAddress(req.session.user._id)
  let coupon=await userHelpers.getAllCoupons()
  let user=await userHelpers.getUserDetails(req.session.user._id)
  let userCart=await userHelpers.getCart(req.session.user._id)
  if(userCart.wallet){
    var isWallet=true
    let val=parseInt(totalValue.total)
    totalValue.final=val-userCart.wallet
    await userHelpers.updateCartWallet(req.session.user._id,totalValue.final)
  }
  if(userCart.coupon){
    var isCheck=true
    let val=parseInt(totalValue.total)
    totalValue.final=val-(userCart.discount*val)/100
    totalValue.discount=(userCart.discount*val)/100
    await userHelpers.updateCart(req.session.user._id,totalValue.final,totalValue.discount)
  }
  let amount=await userHelpers.getCart(req.session.user._id)
  totalValue.tot=amount.finalPrice?amount.finalPrice:amount.walletFinal?amount.walletFinal:totalValue.total
  totalValue.dis=amount.discount?amount.discount:amount.wallet?amount.wallet:0
  let cat=req.session.cat
  res.render('user/checkout',{head:true,totalValue,isWallet,coupon,products,footer:true,userCart,isCheck,address, cat, user})
})

/* Get Checkout Page End */


/* Place an Order */

router.post('/place-orders',verifyLogin,async(req,res)=>{
  let userId=req.session.user._id
  let products=await userHelpers.getCartProductsList(req.session.user._id)
  let total=await userHelpers.getTotalAmount(req.session.user._id)
  let address=await userHelpers.getAddress(req.session.user._id,req.body.address)
  let tot=parseFloat(total.total)
  let userCart = await userHelpers.getCart(userId)
  let totalPrice=userCart.coupon?userCart.finalPrice:userCart.walletFinal?userCart.walletFinal:tot
  if(userCart.coupon)req.body.coupon=userCart.coupon
  if(userCart.wallet)req.body.wallet=userCart.wallet
  userHelpers.placeOrder(userId,req.body,address,products,totalPrice).then((order)=>{
    let orderId=order.response.insertedId.toString()
    req.session.orderId=orderId
    if(req.body['payment-method']==='COD'){
      //Cash on Delivery

      res.json(order)
     }
    else if(req.body['payment-method']==='Razorpay'){
      //Razor Pay order Create
      userHelpers.generateRazorpay(orderId,totalPrice).then((response)=>{
        res.json(response)
      })
    }
    else{
      //Paypal Create an Order

      let total=parseInt(totalPrice)
      const create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:3000/success?orderId="+orderId+"&tot="+total,
            "cancel_url": "http://localhost:3000/cancel"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": orderId,
                    "sku": "001",
                    "price": total,
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "USD",
                "total": total
            },
            "description": "Order for Milana"
        }]
    };
    
    paypal.payment.create(create_payment_json, function (error, payment) {
      if (error) {
          throw error;
      } else {
          for(let i = 0; i < payment.links.length;i++){
            if(payment.links[i].rel === 'approval_url'){
              res.json({'val':payment.links[i].href});
            }
          }
      }
    });
    
    }
  })
})

//Paypal Success

router.get('/success', (req, res) => {
  let orderId=req.query.orderId;
  let total=req.query.tot;
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;
  const execute_payment_json = {
    "payer_id": payerId,
    "transactions": [{
        "amount": {
            "currency": "USD",
            "total": total
        }
    }]
  };

  paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
    if (error) {
        throw error;
    } else {
        userHelpers.changePaymentStatus(orderId).then(()=>{
          res.redirect('/order-success');
        })
    }
});
});

//Verify Payment for COD, Razor and Paypal

router.post('/verify-payment', (req, res) => {
    userHelpers.changePaymentStatus(req.body.order.receipt).then(() => {
      res.json({ status: true })
    })
})

/* Place an Order End */

//Order Success page

router.get('/order-success',verifyLogin,async(req,res)=>{
  let order=await userHelpers.orderDetails(req.session.orderId,req.session.user._id)
  if(order.coupon){
    await userHelpers.useCoupon(req.session.user._id,order.coupon)
  }
  let pro=order.products
  let sum = pro.map( el=> el.quantity).reduce( (a,b) => a+b);
  order.sum=sum
  // order.deliveryDate=dt
  res.render('user/order-success',{order})
})

/* Address Add, Update and Delete */

router.get('/edit-address',async(req,res)=>{
  let address=await userHelpers.getAddress(req.query.id,req.query.addId)
  res.json(address)
})

router.post('/update-address',(req,res)=>{
  let userId=req.session.user._id
  userHelpers.updateAddress(userId,req.body).then(()=>{
    res.redirect('/my-profile')
  })
})

router.post('/add-address',verifyLogin,(req,res)=>{
  let user=req.session.user._id
  userHelpers.addAddress(user,req.body).then(()=>{
    res.redirect('/my-profile')
  })
})


router.post('/add-address-checkout',verifyLogin,(req,res)=>{
  let user=req.session.user._id
  userHelpers.addAddress(user,req.body).then(()=>{
    res.redirect('/place-orders')
  })
})

router.get('/delete-address',(req,res)=>{
  console.log(req.query.userId+""+req.query.addId);
  userHelpers.deleteAddress(req.query.userId,req.query.addId).then(()=>{
    res.json({status:true})
  })
})

/* Address Add, Update and Delete End*/

/* Profile Section */

router.get('/my-profile',verifyLogin,async(req,res)=>{
  let userId=req.session.user._id
  let cat=req.session.cat
  cartCount=null
  if(req.session.loggedIn){
    cartCount=await userHelpers.getCartCount(userId)
  }
  let user=await userHelpers.getUserDetails(req.session.user._id)
  let refer=user.refer
  let wallet=user.wallet
  let referalLink='http://localhost:3000/signup?refer='+refer
  let data=await userHelpers.getAllAddress(userId)
  res.render('user/my-profile',{head:true,user,wallet,cat,referalLink,cartCount,data})

})

router.post('/edit-profile',(req,res)=>{
  userHelpers.editProfile(req.session.user._id,req.body).then((response)=>{
    res.json(response)
  })
})

/* Profile Section */

//Pin Search API to get Post Office & State

router.get('/pinsearch',(req,res)=>{
  let pincode=req.query.pin
  var options = {
    method: 'POST',
    url: 'https://pincode.p.rapidapi.com/',
    headers: {
      'content-type': 'application/json',
      'x-rapidapi-host': 'pincode.p.rapidapi.com',
      'x-rapidapi-key': process.env.RAPID_X_KEY
    },
    data: {searchBy: 'pincode', value: pincode}
  };
  
  axios.request(options).then(function (response) {
    let data=response.data[0]
    res.json(data)
  }).catch(function (error) {
     res.json(error)
  });
  
})

//Get my Orders in User Side

router.get('/my-orders',verifyLogin,async(req,res)=>{
  let user=req.session.user
  let cat=req.session.cat
  cartCount=null
  if(req.session.loggedIn){
    cartCount=await userHelpers.getCartCount(user._id)
  }
  let orders=await userHelpers.getOrderDetails(req.session.user._id)
  for(i=0;i<orders.length;i++){
    var date = orders[i].date.getDate();
    var month = orders[i].date.getMonth() + 1; 
    var year = orders[i].date.getFullYear();
    var dateStr = date + "/" + month + "/" + year;
    orders[i].date=dateStr
  }
  res.render('user/my-orders',{orders,head:true,footer:true,user,cat,cartCount})
})

//Order Filter in My Orders 

router.get('/order-filter',verifyLogin,async(req,res)=>{
  let user=req.session.user
  let cat=req.session.cat
  cartCount=null
  if(req.session.loggedIn){
    cartCount=await userHelpers.getCartCount(user._id)
  }
  userHelpers.filterbyOrders(req.query.val).then((orders)=>{
    for(i=0;i<orders.length;i++){
      var date = orders[i].date.getDate();
      var month = orders[i].date.getMonth() + 1; 
      var year = orders[i].date.getFullYear();
      var dateStr = date + "/" + month + "/" + year;
      orders[i].date=dateStr
    }
    res.render('user/my-orders',{orders,head:true,user,cat,cartCount})
  })
})

//Get Ordered Products

router.get('/get-order-products',verifyLogin,(req,res)=>{
  req.session.orderId=req.query.orderId
  userHelpers.getOrderProducts(req.query.userId,req.query.orderId).then((products)=>{
    res.json(products)
  })
})

//Get each Ordered products in an Order

router.get('/my-order-products',verifyLogin,async(req,res)=>{
  let user=req.session.user
  let cat=req.session.cat
  cartCount=null
  if(req.session.loggedIn){
    cartCount=await userHelpers.getCartCount(user._id)
  }
  let orderId=req.session.orderId
  userHelpers.getOrderProducts(req.session.user._id,orderId).then((products)=>{
    res.render('user/ordered-products',{user,cat,cartCount,footer:true,head:true,products})
  })
})


/* Price Filters in Category and Subcategory Pages */

router.get('/low-to-high',(req,res)=>{
  let val=req.query.val
  let val1=val.slice(0,3) 
  let val2=val.slice(4,7)
  let val3=val.slice(8)
  userHelpers.getLowToHigh(val1,val2,val3).then((pro)=>{
    res.json(pro)
  }).catch(()=>{
    res.json({status:false})
  })
})

router.get('/low-to-high1',(req,res)=>{
  let val=req.query.val
  let str = val.split(",")
  let val1=str[0];
  let val2=str[1];
  let cat=str[2];
  let subcat=str[3];
  userHelpers.getLowToHighSub(val1,val2,cat,subcat).then((pro)=>{
    res.json(pro)
  }).catch(()=>{
    res.json({status:false})
  })
})

router.get('/price-filter',(req,res)=>{
  let val1=parseInt(req.query.val1)
  let val2=parseInt(req.query.val2)
  userHelpers.getPriceFilter(val1,val2,req.query.cat).then((pro)=>{
    res.json(pro)
  })
})

router.get('/price-filter1',(req,res)=>{
  let val1=parseInt(req.query.val1)
  let val2=parseInt(req.query.val2)
  let cat=req.query.cat
  let subcat=req.query.subcat
  userHelpers.getPriceFilterSub(val1,val2,cat,subcat).then((pro)=>{
    res.json(pro)
  })
})

/* Price Filters in Category and Subcategory Pages End */


/* Coupon Search in Checkout Page */

router.post('/coupon-search',(req,res)=>{
  userHelpers.checkCoupon(req.body,req.session.user._id).then((response)=>{
    res.json(response)
  })
})

router.get('/delete-coupon',(req,res)=>{
  userHelpers.deleteCoupon(req.session.user._id).then(()=>{
    res.json({status:true})
  })
})

/* Coupon Search in Checkout Page End */

/* Apply Wallet in Checkout Page  */

router.get('/apply-wallet',async(req,res)=>{
  let wallet=parseInt(req.query.val)
  let userId=req.query.id
  await userHelpers.updatewallet(userId,wallet).then(()=>{
    res.json({status:true})
  })
})

router.get('/delete-wallet',(req,res)=>{
  userHelpers.deleteWallet(req.query.id).then(()=>{
    res.json({status:true})
  })
})

router.get('/remove_wallet',(req,res)=>{
  userHelpers.removeWallet(req.session.user._id).then((response)=>{
    res.json(response)
  })
})

/* Apply Wallet in Checkout Page End */


//Contact US

router.get('/contact-us',async(req,res)=>{
  let user=req.session.user;
  let cat=req.session.cat;
  cartCount=null
  if(req.session.loggedIn){
    cartCount=await userHelpers.getCartCount(user._id)
  }
  res.render('user/contact',{head:true,footer:true,cartCount,user,cat})
})

//About US

router.get('/about',async(req,res)=>{
  let user=req.session.user;
  let cat=req.session.cat;
  let totUsers=await prodHelpers.getTotUsers()
  let pro=await userHelpers.getTotalProCount()
  let category=await userHelpers.getCatTotal()
  cartCount=null
  if(req.session.loggedIn){
    cartCount=await userHelpers.getCartCount(user._id)
  }
  res.render('user/about',{head:true,footer:true,cartCount,user,cat,category,pro,totUsers})
})

//Logout Section

router.get('/logout',(req,res)=>{
  req.session.destroy()
  res.redirect('/')
})


module.exports = router;
