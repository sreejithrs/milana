const express = require('express');
const router = express.Router();
const userHelpers=require('../helpers/userHelpers')
const prodHelpers=require('../helpers/productHelpers')
var axios = require("axios").default;

const accountSid = 'ACe491d00a4fdcdd4926340ea664642290';
const authToken = '967412cfb46c7f79fc45237f2081658a';
const client = require('twilio')(accountSid, authToken);

// var instance = new Razorpay({
//   key_id: 'rzp_test_hNaTYcR7AgE7ZH',
//   key_secret: 'mlCObs8xPcarP5JCC8RWXQhA',
// });





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
/* GET users listing. */
router.get('/',async function(req, res) {
  let user=req.session.user
  let cartCount=null
  if(req.session.loggedIn){
    cartCount= await userHelpers.getCartCount(req.session.user._id)
    req.session.cartCount=cartCount
  }
  userHelpers.getAllProducts().then((product)=>{
    prodHelpers.getAllCategories().then((cat)=>{
      req.session.cat=cat
      res.render('user/index',{user, head:true, product, cat, footer:true, cartCount});
    })
  })
});

router.get('/signup',(req,res)=>{
  let cat=req.session.cat
  res.render('user/signup',{'signUpErr':req.session.signUpErr, head:true, footer:true, cat})
  req.session.signUpErr=false
})

router.post('/signup',(req,res)=>{
  userHelpers.doSignUp(req.body).then((data)=>{
    req.session.loggedIn=true
    req.session.user=response
    res.redirect('/')
  }).catch((err)=>{
     req.session.signUpErr=err
     res.redirect('/signup')
  })
})

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
  res.render('user/verify',{'error':req.session.verifyErr})
  req.session.verifyErr=false
})

let random=Math.floor(1000 + Math.random() * 9000)

router.post('/login/verify',(req,res)=>{
  userHelpers.mobileCheck(req.body).then((user)=>{
    let number=req.body.number
    req.session.user=user

    client.messages
    .create({
    body: random+' is your OTP number',
    to: '+91'+number, 
    from: '+19036183839', 
    })
   .then((message) => console.log(message));
    res.render('user/otp',{number})
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

router.get('/product/:id',(req,res)=>{
  let prodId=req.params.id
  userHelpers.getAProduct(prodId).then((product)=>{
    let cat=req.session.cat
    let user=req.session.user
    let cartCount=req.session.cartCount
    res.render('user/product',{product, head:true, user, cat, cartCount})
  })
})

router.get('/category',(req,res)=>{
  let cat1=req.query.cat
  let user=req.session.user
  let cat=req.session.cat
  let cartCount=req.session.cartCount
  userHelpers.getCatProd(cat1).then((products)=>{
    res.render('user/category',{products, head:true, user, cat, cartCount})
  })
})

router.get('/subcat',(req,res)=>{
  let subcat=req.query.subcat
  let cat=req.query.cat
  userHelpers.getSubCatProd(subcat).then((prod)=>{
    res.render('user/subcategory',{prod})
  })
})

router.get('/cart',verifyCart,async(req,res)=>{
  let products=await userHelpers.getCartProducts(req.session.user._id)
  let cartCount=await userHelpers.getCartCount(req.session.user._id)
  let totalValue=await userHelpers.getTotalAmount(req.session.user._id)
  let user=req.session.user
  let cat=req.session.cat
  res.render('user/cart',{products, user, cat, head:true, cartCount, totalValue})
})

router.get('/add-to-cart/',verifyCart,(req,res)=>{
  let id=req.query.id
  let size=req.query.size
  // console.log(id);
  // console.log(size);
  userHelpers.addToCart(id,req.session.user._id).then(()=>{
    res.redirect('/cart')
  })
})

router.post('/change-product-quantity',(req,res,next)=>{
    userHelpers.changeProQuantity(req.body).then(async(response)=>{
      response.total=await userHelpers.getTotalAmount(req.body.user)
      res.json(response)
    })
})


router.post('/delete-cart-product',(req,res,next)=>{
    userHelpers.deleteCartProduct(req.body).then((response)=>{
      res.json(response)
    })
})


router.get('/place-orders',verifyLogin, async(req,res)=>{
  let totalValue=await userHelpers.getTotalAmount(req.session.user._id)
  let products=await userHelpers.getCartProducts(req.session.user._id)
  let user=req.session.user
  let cat=req.session.cat
  res.render('user/checkout',{head:true,totalValue,products, cat, user})
})


router.post('/place-orders',verifyLogin,async(req,res)=>{
  let products=await userHelpers.getCartProductsList(req.session.user._id)
  let totalPrice=await userHelpers.getTotalAmount(req.session.user._id)
  userHelpers.placeOrder(req.body,products,totalPrice).then((response)=>{
    let orderId=response.orderObj._id
    req.session.orderId=orderId
    res.redirect('/order-success')
  })
})


router.get('/order-success',verifyLogin,async(req,res)=>{
  let order=await userHelpers.orderDetails(req.session.orderId)
  let pro=order.products
  let sum = pro.map( el=> el.quantity).reduce( (a,b) => a+b);
  order.sum=sum
  // order.deliveryDate=dt
  res.render('user/order-success',{order})
})




router.get('/my-profile',verifyLogin,async(req,res)=>{
  let user=req.session.user
  let userId=req.session.user._id
  let cat=req.session.cat
  let cartCount=req.session.cartCount
  let data=await userHelpers.getAddress(userId)
  res.render('user/my-profile',{head:true,user,cat,cartCount,data})

})

router.get('/pinsearch',(req,res)=>{
  let pincode=req.query.pin
  var options = {
    method: 'POST',
    url: 'https://pincode.p.rapidapi.com/',
    headers: {
      'content-type': 'application/json',
      'x-rapidapi-host': 'pincode.p.rapidapi.com',
      'x-rapidapi-key': '5fe39e26edmshea1cebcdd12d5dbp17f9c8jsneb6bc5ee59e8'
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

router.post('/add-address',verifyLogin,(req,res)=>{
  let user=req.session.user._id
  console.log(req.body);
  userHelpers.addAddress(user,req.body).then(()=>{
    res.redirect('/my-profile')
  })
})

router.get('/my-orders',verifyLogin,async(req,res)=>{
  let user=req.session.user
  let cat=req.session.cat
  let cartCount=req.session.cartCount
  let orders=await userHelpers.getOrderDetails(req.session.user._id)
  res.render('user/my-orders',{orders,head:true,user,cat,cartCount})
})

router.get('/get-order-products',verifyLogin,(req,res)=>{
  req.session.orderId=req.query.orderId
  userHelpers.getOrderProducts(req.query.userId,req.query.orderId).then((products)=>{
    res.json(products)
  })
})


router.get('/my-order-products',verifyLogin,(req,res)=>{
  let user=req.session.user
  let cat=req.session.cat
  let cartCount=req.session.cartCount
  let orderId=req.session.orderId
  userHelpers.getOrderProducts(req.session.user._id,orderId).then((products)=>{
    console.log(products);
    res.render('user/ordered-products',{user,cat,cartCount,head:true,products})
  })
})

router.get('/logout',(req,res)=>{
  req.session.destroy()
  res.redirect('/')
})


module.exports = router;
