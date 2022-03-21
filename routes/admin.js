const express = require("express");
const { Compressor } = require("mongodb");
const router = express.Router();
const userHelpers= require("../helpers/userHelpers")
const prodHelpers = require("../helpers/productHelpers");


/* GET home page. */
function verifyLogin(req, res, next) {
  if (req.session.adminLogin) {
    next();
  } else {
    res.render("admin/login");
  }
}

router.get('/',async function(req, res, next) {
    let admin=req.session.admin
    if(req.session.adminLogin){
     let pro= await prodHelpers.getTotalPro()
     let sales=await prodHelpers.getTotalSales()
     let status=await prodHelpers.getTotalStatus()
     let totalSales=await prodHelpers.getSalesTotal()
     let weeklyReport=await prodHelpers.getweeklyreport()
     let totUsers=await prodHelpers.getTotUsers()
     let tot = totalSales.reduce(function (accumulator, item) {
      return accumulator + item.totalAmount;
    }, 0);
    let totSale = sales.reduce(function (accumulator, item) {
      return accumulator + item.total;
    }, 0);
    let proCount=pro.length
    res.render('admin/index',{admin,pro,sales,'data':weeklyReport,status,tot,totSale,proCount,totUsers})
    }else{
      res.render('admin/login',{ err: req.session.adminErr})
      req.session.adminErr = false;
    }
});

router.get("/login",(req, res) => {
  res.render("admin/login");
});

router.post("/login", (req, res) => {
  prodHelpers
    .adminLogin(req.body)
    .then((response) => {
      if (response.status) {
        req.session.admin = response.admin;
        req.session.adminLogin = true;
        res.redirect('/admin')
      } else {
        res.redirect('/admin')
      }
    })
    .catch((err) => {
      req.session.adminErr = "Incorrect Details";
      res.redirect("/admin");
    });
});

router.get("/all-users", verifyLogin, (req, res) => {
  prodHelpers.getAllUsers().then((users) => {
    let admin = req.session.admin;
    res.render("admin/all-users", { admin, users });
  });
});

router.get("/block/:id", verifyLogin, (req, res) => {
  let userId = req.params.id;
  prodHelpers.blockUser(userId).then(() => {
    res.redirect("/admin/all-users");
  });
});

router.get("/unblock/:id", verifyLogin, (req, res) => {
  let userId = req.params.id;
  prodHelpers.unBlockUser(userId).then(() => {
    res.redirect("/admin/all-users");
  });
});

router.get("/add-product", verifyLogin, (req, res) => {
  let admin = req.session.admin;
  prodHelpers.getAllCategories().then((data) => {
    prodHelpers.getSize().then((size) => {
      prodHelpers.getColor().then((color) => {
        res.render("admin/add-product", { admin, size, color, data , 'success':req.session.successMsg});
        req.session.successMsg=false
      });
    });
  });
});

router.get("/getsub", verifyLogin, (req, res) => {
  let cat = req.query.cat;
  prodHelpers
    .getSubCat(cat)
    .then((subcat) => {
      res.send(subcat);
    })
    .catch((err) => {
      console.log(err);
    });
});

// router.post("/add-product",(req, res) => {
//   prodHelpers.addProduct(req.body).then((id)=>{
//     if (req.files) {
//       const file = req.files.image;
//       let fileArr=[]
//       for(i=0;i<file.length;i++){
//         var name= file[i].name
//         var ext = name.split(".")[1];
//       }
//       for (let i = 0; i < file.length; i++) {
//         file[i].mv("./public/product-images/" + id +"-"+ i + '.'+ ext, function (err) {
//           if (err) {
//             res.send(err);
//           }
//         });
//         fileArr.push(id+'-'+i+"."+ ext)
       
//       }
//       prodHelpers.updateId(fileArr,id).then(()=>{
//         req.session.successMsg=true
//         res.redirect('/admin/add-product')
//       })
//     }
//   })
// });

router.post('/add-product', (req, res) => {
  prodHelpers.addProduct(req.body).then((id) => {
    let fileArr=[]
    if(req.files.image4==undefined){
      let image1=req.files.image1
      let image2=req.files.image2
      let image3=req.files.image3
      let name1= image1.name
      let name2= image2.name
      let name3= image3.name
      let ext1 = name1.split(".")[1];
      let ext2 = name2.split(".")[1];
      let ext3 = name3.split(".")[1];
      image1.mv("./public/product-images/" + id +"-"+ 0 + '.'+ ext1)
      image2.mv("./public/product-images/" + id +"-"+ 1 + '.'+ ext2)
      image3.mv("./public/product-images/" + id +"-"+ 2 + '.'+ ext3)
      fileArr.push(id+'-'+0+"."+ ext1)
      fileArr.push(id+'-'+1+"."+ ext2)
      fileArr.push(id+'-'+2+"."+ ext3)
      prodHelpers.updateId(fileArr,id).then(()=>{
        req.session.successMsg=true
        res.redirect('/admin/add-product')
      })
    }else{
    let image1=req.files.image1
    let image2=req.files.image2
    let image3=req.files.image3
    let image4=req.files.image4
    //Taking Image Name
    let name1= image1.name
    let name2= image2.name
    let name3= image3.name
    let name4= image4.name
    
    //Splitting Extension
    let ext1 = name1.split(".")[1];
    let ext2 = name2.split(".")[1];
    let ext3 = name3.split(".")[1];
    let ext4 = name4.split(".")[1];

    //Moving Image to Folder
    image1.mv("./public/product-images/" + id +"-"+ 0 + '.'+ ext1)
    image2.mv("./public/product-images/" + id +"-"+ 1 + '.'+ ext2)
    image3.mv("./public/product-images/" + id +"-"+ 2 + '.'+ ext3)
    image4.mv("./public/product-images/" + id +"-"+ 3 + '.'+ ext4)
    
    //FileArray to store ImageId
    fileArr.push(id+'-'+0+"."+ ext1)
    fileArr.push(id+'-'+1+"."+ ext2)
    fileArr.push(id+'-'+2+"."+ ext3)
    fileArr.push(id+'-'+3+"."+ ext4)                                    

    prodHelpers.updateId(fileArr,id).then(()=>{
      req.session.successMsg=true
      res.redirect('/admin/add-product')
    })
    }
  })
})

router.get("/all-products", verifyLogin, (req, res) => {
  prodHelpers.getAllProducts().then((products) => {
    let admin = req.session.admin;
    res.render("admin/all-products", { products, admin });
  });
});

router.get("/edit-product/:id", verifyLogin, (req, res) => {
  let admin=req.session.admin
  prodHelpers.editProduct(req.params.id).then((product) => {
    prodHelpers.getColor().then((color)=>{
      prodHelpers.getSize().then((size)=>{
        prodHelpers.getAllCategories().then((cat)=>{
          res.render("admin/edit-product", { product ,color, cat, size, admin});
        })
      })
    })
  });
});

router.post("/edit-product/:id", (req, res) => {
  prodHelpers.updateProduct(req.params.id, req.body).then(() => {
    let id=req.params.id
    let fileArr=[]
    if(req.files.image4==undefined){
      let image1=req.files.image1
      let image2=req.files.image2
      let image3=req.files.image3
      let name1= image1.name
      let name2= image2.name
      let name3= image3.name
      let ext1 = name1.split(".")[1];
      let ext2 = name2.split(".")[1];
      let ext3 = name3.split(".")[1];
      image1.mv("./public/product-images/" + id +"-"+ 0 + '.'+ ext1)
      image2.mv("./public/product-images/" + id +"-"+ 1 + '.'+ ext2)
      image3.mv("./public/product-images/" + id +"-"+ 2 + '.'+ ext3)
      fileArr.push(id+'-'+0+"."+ ext1)
      fileArr.push(id+'-'+1+"."+ ext2)
      fileArr.push(id+'-'+2+"."+ ext3)
      prodHelpers.updateId(fileArr,id).then(()=>{
        req.session.successMsg=true
        res.redirect('/admin/all-products')
      })
    }else{
    let image1=req.files.image1
    let image2=req.files.image2
    let image3=req.files.image3
    let image4=req.files.image4
    //Taking Image Name
    let name1= image1.name
    let name2= image2.name
    let name3= image3.name
    let name4= image4.name
    
    //Splitting Extension
    let ext1 = name1.split(".")[1];
    let ext2 = name2.split(".")[1];
    let ext3 = name3.split(".")[1];
    let ext4 = name4.split(".")[1];

    //Moving Image to Folder
    image1.mv("./public/product-images/" + id +"-"+ 0 + '.'+ ext1)
    image2.mv("./public/product-images/" + id +"-"+ 1 + '.'+ ext2)
    image3.mv("./public/product-images/" + id +"-"+ 2 + '.'+ ext3)
    image4.mv("./public/product-images/" + id +"-"+ 3 + '.'+ ext4)
    
    //FileArray to store ImageId
    fileArr.push(id+'-'+0+"."+ ext1)
    fileArr.push(id+'-'+1+"."+ ext2)
    fileArr.push(id+'-'+2+"."+ ext3)
    fileArr.push(id+'-'+3+"."+ ext4)                                    

    prodHelpers.updateId(fileArr,id).then(()=>{
      req.session.successMsg=true
      res.redirect('/admin/all-products')
    })
    }
  });
});

router.get("/delete-product/:id", (req, res) => {
  prodHelpers.deleteProduct(req.params.id).then(() => {
    res.redirect("/admin/all-products");
  });
});

router.get("/add-category", verifyLogin, (req, res) => {
  let admin = req.session.admin;
  prodHelpers.getAllCategories().then((cat) => {
    res.render("admin/add-category", {admin,cat,catErr: req.session.catErr,subCatErr: req.session.subCatErr,sizeErr: req.session.sizeErr,colorErr: req.session.colorErr,
    });
    req.session.catErr = false;
    req.session.subCatErr = false;
    req.session.sizeErr= false
    req.session.colorErr= false
  });
});

router.post("/add-category", (req, res) => {
  let image=req.files.image
  prodHelpers.addCategory(req.body).then((id) => {
    image.mv('./public/category-images/'+id+'.jpg',(err,done)=>{
      if(err)
        console.log(err);
      else
        res.redirect("/admin/add-category");
    })
    }).catch((err) => {
      req.session.catErr = "This Category already Exists";
      res.redirect("/admin/add-category");
    });
});

router.post("/sub-category", (req, res) => {
  prodHelpers.addSubCategory(req.body).then((data) => {
    if (data.modifiedCount == 0) {
      req.session.subCatErr = "This Sub Category Already Exists";
      res.redirect("/admin/add-category");
    } else {
      res.redirect("/admin/add-category");
    }
  });
});

router.post("/add-color", (req, res) => {
  prodHelpers
    .addColor(req.body)
    .then(() => {
      res.redirect("/admin/add-category");
    })
    .catch(() => {
      req.session.colorErr = "This Color already Exists";
      res.redirect("/admin/add-category");
    });
});

router.post("/add-size", (req, res) => {
  prodHelpers.addSize(req.body).then(() => {
      res.redirect("/admin/add-category");
    })
    .catch(() => {
      req.session.sizeErr = "This Size Already Exists";
      res.redirect("/admin/add-category");
    });
});


router.get('/manage-category',verifyLogin,(req,res)=>{
  let admin=req.session.admin
  prodHelpers.getAllCategories().then((cat)=>{
    res.render('admin/all-category',{cat,admin})
  })
})


router.get('/edit-category',verifyLogin,(req,res)=>{
  let admin=req.session.admin
  prodHelpers.getACategory(req.query.id).then((cat)=>{
    res.render('admin/edit-category',{cat,admin})
  })
})

router.post('/edit-category/:id',(req,res)=>{
  let id=req.params.id
  let image=req.files.image

  prodHelpers.updateCategory(id,req.body).then(()=>{
    image.mv('./public/category-images/'+id+'.jpg',(err,done)=>{
      if(!err){
        res.redirect('/admin/manage-category')
      }else{
         res.redirect('/admin/edit-category')
      }
    })
  })
})

router.get('/delete-category/:id',verifyLogin,(req,res)=>{
  prodHelpers.deleteCategory(req.params.id).then(()=>{
    res.redirect('/admin/manage-category')
  })
})

router.get('/delete-subcategory',(req,res)=>{
  prodHelpers.deleteSubCategory(req.query.subcat,req.query.catId).then((response)=>{
    res.json(response)
   })
})

router.get('/view-orders',verifyLogin,(req,res)=>{
  prodHelpers.getOrderDetails().then((orders)=>{
    let admin=req.session.admin
    res.render('admin/view-orders',{orders,admin})
  })
})

router.get('/status-change',verifyLogin,(req,res)=>{
  let status=req.query.status
  let id=req.query.id
  prodHelpers.changeStatus(status,id).then(()=>{
    res.redirect('/admin/view-orders')
  })
})

router.get("/category-offer",verifyLogin,async(req,res)=>{
  let offerview=await prodHelpers.getCategoryOffer()
  let category=await prodHelpers.categoryfind()
  res.render('admin/category-offer',{admin: true,offerview,category})
});

router.post('/category-offer',async(req,res)=>{
  let viewPro=await prodHelpers.addCategoryOffer(req.body)
  res.json(viewPro)  
});

router.post('/deleteOffer',async(req,res)=>{
  let response=await prodHelpers.deleteCategoryOffer(req.body.catOfferId,req.body.offerItem)
  res.json({status:true})
});


router.get('/add-coupon',verifyLogin,(req,res)=>{
  res.render('admin/coupon',{admin:true,'couponErr':req.session.couponErr})
})

router.post('/add-coupon',(req,res)=>{
  prodHelpers.checkCoupon(req.body).then(()=>{
    res.json()
  }).catch(()=>{
    req.session.couponErr="Coupon Already Exists"
    res.redirect('/add-coupon')
  })
})


  router.post('/salesreport/report', async (req, res) => {
    let salesReport = await prodHelpers.getSalesReport(req.body.from, req.body.to)
    res.json({ report: salesReport })
  })
  
  router.post('/salesreport/monthlyreport', async (req, res) => {
    let singleReport = await prodHelpers.getNewSalesReport(req.body.type)
    res.json({ wmyreport: singleReport })
  })
  
  router.get('/salesreport', async (req, res) => {
    let salesreport = await prodHelpers.getsalesReport()
    res.render('admin/salesreport', { admin: true, salesreport })
  })



  router.get('/product-offer',verifyLogin,async(req,res)=>{
    let viewPro= await prodHelpers.getAllProducts()
    let cat=await prodHelpers.getAllCategories()
    let findofferPro= await prodHelpers.viewOfferPro()
    res.render('admin/product-offer',{admin: true,viewPro,findofferPro,cat})
  });
  
  router.post('/product-offer',(req,res)=>{
    prodHelpers.addProductOffer(req.body).then((offer)=>{  
      res.json(offer)
    })
  });
  
  router.post('/deleteOfferPro',(req,res)=>{
    prodHelpers.deleteProOffer(req.body.proOfferId,req.body.profferItem)
    res.json({status:true})
  });

  router.get('/getAllPro',async(req,res)=>{
    let pro=await prodHelpers.getProductsByCat(req.query.cat)
    res.json(pro)
  })

  router.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/admin");
  });


module.exports = router;
