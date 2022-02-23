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

router.get('/', function(req, res, next) {
  let admin=req.session.admin
    if(req.session.adminLogin){
      res.render('admin/index',{admin})
    }else{
      res.render('admin/login',{ err: req.session.adminErr })
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

router.post("/add-product",(req, res) => {
  prodHelpers.addProduct(req.body).then((id)=>{
    if (req.files) {
      const file = req.files.image;
      let fileArr=[]
      for(i=0;i<file.length;i++){
        var name= file[i].name
        var ext = name.split(".")[1];
      }
      for (let i = 0; i < file.length; i++) {
        file[i].mv("./public/product-images/" + id +"-"+ i + '.'+ ext, function (err) {
          if (err) {
            res.send(err);
          }
        });
        fileArr.push(id+'-'+i+"."+ ext)
       
      }
      prodHelpers.updateId(fileArr,id).then(()=>{
        req.session.successMsg=true
        res.redirect('/admin/add-product')
      })
    }
  })
});

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
    let id = req.params.id;
    if (req.files) {
      const file = req.files.image;
      let fileArr=[]
      for(i=0;i<file.length;i++){
        var name= file[i].name
        var ext = name.split(".")[1];
      }
      for (let i = 0; i < file.length; i++) {
        file[i].mv("./public/product-images/" + id +"-"+ i + '.'+ ext, function (err) {
          if (err) {
            res.send(err);
          }
        });
        fileArr.push(id+'-'+i+"."+ ext)
       
      }
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
  prodHelpers.getACategory(req.query.id).then((cat)=>{
    res.render('admin/edit-category',{cat})
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
  console.log(id);
  prodHelpers.changeStatus(status,id).then(()=>{
    res.redirect('/admin/view-orders')
  })
})

router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/admin");
});

module.exports = router;
