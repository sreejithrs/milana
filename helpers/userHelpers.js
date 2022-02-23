var db = require("../config/connection");
var collection = require("../config/collection");
var ObjectId = require("mongodb").ObjectId;
const bcrypt = require("bcrypt");
const { PRODUCT_COLLECTION } = require("../config/collection");

module.exports = {
  getAllProducts: () => {
    return new Promise(async (resolve, reject) => {
      let product = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .find({})
        .sort({ _id: -1 })
        .limit(4)
        .toArray();
      resolve(product);
    });
  },

  doSignUp: (userData) => {
    return new Promise(async (resolve, reject) => {
      userData.status = true;
      userData.password = await bcrypt.hash(userData.password, 10);
      db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data) => {
          resolve(data.insertedId);
        })
        .catch((err) => {
          err = "This user Already Exists";
          reject(err);
        });
    });
  },

  doLogin: (userData) => {
    let loginStatus = false;
    let response = {};
    return new Promise(async (resolve, reject) => {
      let user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email });
      if (user) {
        bcrypt.compare(userData.password, user.password).then((status) => {
          if (status) {
            response.user = user;
            response.status = true;
            resolve(response);
          } else {
            reject({ status: false });
          }
        });
      } else {
        reject({ status: false });
      }
    });
  },

  mobileCheck: (data) => {
    let response = {};
    return new Promise(async (resolve, reject) => {
      let number = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ number: data.number });
      if (number) {
        response.user = number;
        resolve(response);
      } else {
        reject();
      }
    });
  },

  getAProduct: (prodId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .findOne({ _id: ObjectId(prodId) })
        .then((product) => {
          resolve(product);
        });
    });
  },

  getCatProd: (cat1) => {
    return new Promise(async (resolve, reject) => {
      let products = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .find({ Category: cat1 })
        .toArray();
      resolve(products);
    });
  },

  getSubCatProd: (subcat) => {
    return new Promise(async (resolve, reject) => {
      let prod = await db.get().collection(collection.PRODUCT_COLLECTION).find({ Subcategory: subcat }).toArray();
      resolve(prod);
    });
  },

  addToCart: (prodId, userId) => {
    let proObj = {
      item: ObjectId(prodId),
      quantity: 1,
    };
    return new Promise(async (resolve, reject) => {
      let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectId(userId) });
      if (userCart) {
        let proExist = userCart.products.findIndex((product) => product.item == prodId
        );
        if (proExist != -1) {
          db.get().collection(collection.CART_COLLECTION).updateOne(
              { "products.item": ObjectId(prodId), user: ObjectId(userId) },
              {
                $inc: { "products.$.quantity": 1 },
              }
            ).then(() => {
              resolve();
            });
        } else {
          db.get().collection(collection.CART_COLLECTION).updateOne(
              { user: ObjectId(userId) },
              {
                $push: { products: proObj },
              }
            ).then((response) => {
              resolve();
            });
        }
      } else {
        let cartObj = {
          user: ObjectId(userId),
          products: [proObj],
        };
        db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {
            resolve();
          });
      }
    });
  },

  getCartProducts: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
          {
            $match: { user: ObjectId(userId) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
        ])
        .toArray();
      resolve(cartItems);
    });
  },

  getCartCount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let count = 0;
      let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectId(userId) });
      if (cart) {
        count = cart.products.length;
      }
      resolve(count);
    });
  },

  changeProQuantity: (details) => {
    count=parseInt(details.count)
    quantity=parseInt(details.quantity)
    return new Promise(async(resolve, reject) => {
      if(details.count==-1 && details.quantity==1){
          db.get().collection(collection.CART_COLLECTION).deleteOne({_id:ObjectId(details.cart)}
          // {
          //     $pull:{products:{item:ObjectId(details.product)}}
          // },
          ).then((response)=>{
              resolve({removeProduct:true})
          })
      }else{
        var pro=await db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:ObjectId(details.product)})
        db.get().collection(collection.CART_COLLECTION).findOneAndUpdate(
          { "products.item": ObjectId(details.product), _id: ObjectId(details.cart) },
          {$inc: { "products.$.quantity": count}},
          {returnNewDocument:true}
      )
        // db.get().collection(collection.CART_COLLECTION).updateOne(
        //     { "products.item": ObjectId(details.product), _id: ObjectId(details.cart) },
        //     {$inc: { "products.$.quantity": count}}
        //   )
          .then((response) => {
            let Count=response.value.products[0].quantity
            if(Count>=pro.Stock){

              resolve({countCheck:true})
            }
            resolve({status:true})
          });   
      }
    });
  },

  deleteCartProduct:(details)=>{
      return new Promise((resolve,reject)=>{
        db.get().collection(collection.CART_COLLECTION).updateOne({_id:ObjectId(details.cart)},
        {
            $pull:{products:{item:ObjectId(details.product)}}
        },
        ).then((response)=>{
            resolve({removeProduct:true})
        })
      })
  },

  getTotalAmount:(userId)=>{
    return new Promise(async(resolve,reject)=>{
      let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
        {
          $match: { user: ObjectId(userId) },
        },
        {
          $unwind: "$products",
        },
        {
          $project: {
            item: "$products.item",
            quantity: "$products.quantity",
          },
        },
        {
          $lookup: {
            from: collection.PRODUCT_COLLECTION,
            localField: "item",
            foreignField: "_id",
            as: "product",
          },
        },
        {
          $project: {
            item: 1,
            quantity: 1,
            product: { $arrayElemAt: ["$product", 0] }
           
          },
        },
        {
          $group:{
            _id:null,
            total:{$sum:{$multiply:['$quantity','$product.Price']}},
            maxTotal:{$sum:{$multiply:['$quantity','$product.Maxprice']}}
          }
        },
        {
           $project:{
              discount: { $subtract: [  '$maxTotal', '$total'  ] } ,
              total:1,
              maxTotal:1
            } 
        }
      ]).toArray()
      resolve(total[0])
    })
  },

  getCartProductsList:(userId)=>{
    return new Promise(async(resolve,reject)=>{
      let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:ObjectId(userId)})
      resolve(cart.products)
    })
  },


  placeOrder:(order,products,total)=>{
    return new Promise((resolve,reject)=>{
      let status=order['payment-method']=='COD'?'placed':'pending'
      let orderObj={
        delivery:{
          firstname:order.fname,
          lastname:order.lname,
          address1:order.faddress,
          address2:order.laddress,
          city:order.town,
          state:order.state,
          pin:order.pin,
          phone:order.phone,
          email:order.email
        },
        orderId:Math.floor(100000 + Math.random() * 900000),
        userId:order.user,
        paymentMethod:order['payment-method'],
        products:products,
        totalAmount:total.total,
        date:new Date(),
        status:status
      }
      let dt = orderObj.date;
      dt.setMinutes( dt.getMinutes() + 6000 );
      var d = dt.toString();
      var index = d.lastIndexOf(':') - 6
      orderObj.deliveryDate=d.substring(0, index)

      db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response)=>{
        db.get().collection(collection.CART_COLLECTION).deleteOne({user:ObjectId(order.user)}).then((res)=>{
          resolve({status:true,orderObj})
        })
      })
    })
  },

  orderDetails:(orderId)=>{
    return new Promise(async(resolve,reject)=>{
      let order=await db.get().collection(collection.ORDER_COLLECTION).find({_id:ObjectId(orderId)}).toArray()
        resolve(order[0])
    })
  },


  addAddress:(userId,address)=>{
    return new Promise((resolve,reject)=>{
      db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectId(userId)},{$addToSet:{address: address}})
      .then(()=>{
        resolve()
      })
    })
  },

  getAddress:(userId)=>{
    return new Promise(async(resolve,reject)=>{
      let address=await db.get().collection(collection.USER_COLLECTION).aggregate([
        {$match:{_id:ObjectId(userId)}},
        {$unwind:"$address"},
        {$project:{address:1,_id:0}}
      ]).toArray()
      resolve(address)
    })
  },

  getOrderDetails:(userId)=>{
    return new Promise(async(resolve,reject)=>{
      let orders=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $match: { userId: userId }
        }
        // {
        //   $unwind: "$products",
        // },
        // {
        //   $project: {
        //     item: "$products.item",
        //     quantity: "$products.quantity",
        //     payment:"$paymentMethod",
        //     orderId:"$orderId",
        //     status:"$status",
        //     date:"$date",
        //     amount:"$totalAmount",
        //   },
        // },
        // {
        //   $lookup: {
        //     from: collection.PRODUCT_COLLECTION,
        //     localField: "item",
        //     foreignField: "_id",
        //     as: "product",
        //   },
        // },
        // {
        //   $unwind: "$product"
        // }
      ]).toArray()
      resolve(orders)
    })
  },

  getOrderProducts:(userId,orderId)=>{
    return new Promise(async(resolve,reject)=>{
      let products=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $match: { userId: userId }
        },
        {
          $unwind: "$products",
        },
        {
          $project: {
            item: "$products.item",
            quantity: "$products.quantity",
            deliveryDate:"$deliveryDate",
            amount:"$totalAmount",
            userId:"$userId",
            address:"$delivery"
          },
        },
        {
          $lookup: {
            from: collection.PRODUCT_COLLECTION,
            localField: "item",
            foreignField: "_id",
            as: "product",
          },
        },
        {
          $unwind: "$product"
        }
      ]).toArray()
      console.log(products);
      resolve(products)
    })
  }



}
