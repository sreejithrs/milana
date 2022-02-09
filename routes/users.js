const express = require('express');
const router = express.Router();
const userHelpers=require('../helpers/userHelpers')

const accountSid = 'AC0d35bd1f0a4e4b06276b58eff1fc6f56';
const authToken = '0bdafe1469c147f3cb6500f82e4395a2';
const client = require('twilio')(accountSid, authToken);


/* GET users listing. */
router.get('/', function(req, res) {
  let user=req.session.user
  if(req.session.loggedIn){
    res.render('user/index',{user});
  }
  else{
    res.render('user/login')
  }
 
});

router.get('/product',(req,res)=>{
  res.render('user/product')
})

router.get('/signup',(req,res)=>{
  res.render('user/signup')
})

router.post('/signup',(req,res)=>{
  userHelpers.doSignUp(req.body).then((data)=>{
    res.redirect('/')
  })
})

router.get('/login',(req,res)=>{
    res.render('user/login',{'error':req.session.loginErr})
    req.session.loginErr=false
})

router.get('/login/verify',(req,res)=>{
  res.render('user/verify',{'err':req.session.verifyErr})
  req.session.verifyErr=false
})

let random=Math.floor(1000 + Math.random() * 9000)

router.post('/login/verify',(req,res)=>{
  userHelpers.mobileCheck(req.body).then((response)=>{
    let number=req.body.number
    req.session.user=response.user

    client.messages
    .create({
    body: random+' is your OTP number',
    to: '+91'+number, 
    from: '+18608095209', 
    })
   .then((message) => console.log(message));
    res.render('user/otp')
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

router.post('/login',(req,res)=>{
  userHelpers.doLogin(req.body).then((response)=>{
    if(response.status){
      req.session.user=response.user
      req.session.loggedIn=true
      req.session.loginErr=null
      res.redirect('/')
    }
  }).catch((err)=>{
    req.session.loginErr="Invalid Email or Password"
    res.redirect('/login')
  })
})

router.get('/logout',(req,res)=>{
  req.session.destroy()
  res.redirect('/')
})

function sendMessage(){

  
}


module.exports = router;
