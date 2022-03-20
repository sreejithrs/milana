var db = require("../config/connection");
var collection = require("../config/collection");
var ObjectId = require("mongodb").ObjectId;
const bcrypt = require("bcrypt");
const { PRODUCT_COLLECTION } = require("../config/collection");
const Razorpay = require("razorpay");
require('dotenv').config()

var instance = new Razorpay({
  key_id: process.env.RAZOR_KEYID,
  key_secret: process.env.RAZOR_KEY_SECRET,
});

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
    let response = {};
    return new Promise(async (resolve, reject) => {
      if (userData.wallet) {
        let mainUser=await db.get().collection(collection.USER_COLLECTION).findOne({_id:userData.referedBy})
        console.log(mainUser);
        if(mainUser.wallet<200){
          console.log('hai');
          await db
          .get()
          .collection(collection.USER_COLLECTION)
          .updateOne({ _id: userData.referedBy }, { $inc: { wallet: 50 } });
        }
      }
      userData.status = true;
      userData.wallet = userData.wallet ? userData.wallet : 0;
      userData.password = await bcrypt.hash(userData.password, 10);
      db.get()
        .collection(collection.USER_COLLECTION)
        .insertOne(userData)
        .then(async (data) => {
          let user = await db
            .get()
            .collection(collection.USER_COLLECTION)
            .findOne({ _id: ObjectId(data.insertedId) });
          response.user = user;
          response.status = true;
          resolve(response);
        })
        .catch((err) => {
          err = "This user Already Exists";
          reject(err);
        });
    });
  },

  checkReferal: (referal) => {
    return new Promise(async (resolve, reject) => {
      let refer = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .find({ refer: referal })
        .toArray();
      if (refer) {
        resolve(refer);
      } else {
        reject();
      }
    });
  },

  doLogin: (userData) => {
    let loginStatus = false;
    let response = {};
    return new Promise(async (resolve, reject) => {
      let user = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ email: userData.email });
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
      db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: ObjectId(prodId) }).then((product) => {
        if(product.Stock==0){
          reject(product)
        }else{
          resolve(product);
        }
        });
    });
  },

  getCatProd: (cat1, user) => {
    return new Promise(async (resolve, reject) => {
      if (user) {
        let products = await db
          .get()
          .collection(collection.PRODUCT_COLLECTION)
          .aggregate([
            {
              $match: { Category: cat1 },
            },
            {
              $lookup: {
                from: collection.WISHLIST_COLLECTION,
                localField: "_id",
                foreignField: "products.prodId",
                as: "output",
              },
            },
          ])
          .toArray();
        resolve(products);
      } else {
        let products = await db
          .get()
          .collection(collection.PRODUCT_COLLECTION)
          .find({ Category: cat1 })
          .toArray();
        resolve(products);
      }
    });
  },

  getLimitedPro:()=>{
    return new Promise(async(resolve,reject)=>{
      let pro=await db.get().collection(collection.PRODUCT_COLLECTION).find({}).sort({Stock:1}).limit(4).toArray()
      console.log(pro);
      resolve(pro)
    })
  },

  getSubCatProd: (cat, subcat) => {
    return new Promise(async (resolve, reject) => {
      let prod = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .find({ Category: cat, Subcategory: subcat })
        .toArray();
      resolve(prod);
    });
  },

  addToCart: (prodId, userId, sizes, colors) => {
    let proObj = {
      item: ObjectId(prodId),
      quantity: 1,
      color: colors,
      size: sizes,
    };
    return new Promise(async (resolve, reject) => {
      let userCart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: ObjectId(userId) });
      if (userCart) {
        let proExist = userCart.products.findIndex(
          (product) =>
            product.item == prodId &&
            product.color == colors &&
            product.size == sizes
        );
        if (proExist != -1) {
          db.get()
            .collection(collection.CART_COLLECTION)
            .updateOne(
              {
                "products.item": ObjectId(prodId),
                "products.color": colors,
                "products.size": sizes,
                user: ObjectId(userId),
              },
              {
                $inc: { "products.$.quantity": 1 },
              }
            )
            .then((data) => {
              resolve();
            })
        } else {
          db.get().collection(collection.CART_COLLECTION).updateOne(
              { user: ObjectId(userId) },
              {
                $push: { products: proObj },
              }
            )
            .then(() => {
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
      let cartItems = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .aggregate([
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
              color: "$products.color",
              size: "$products.size",
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
              color: 1,
              size: 1,
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
      let cart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .aggregate([
          {
            $match: { user: ObjectId(userId) },
          },
          {
            $unwind: "$products",
          },
          {
            $group: {
              _id: "",
              sum: { $sum: "$products.quantity" },
            },
          },
        ])
        .toArray();
      cart = cart.length == 0 ? 0 : cart[0].sum;
      resolve(cart);
    });
  },

  getCart: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: ObjectId(userId) });
      resolve(cart);
    });
  },

  updateCart: (userId, final, discount) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.CART_COLLECTION)
        .updateOne(
          { user: ObjectId(userId), couponApplied: true },
          {
            $set: {
              finalPrice: final,
              discount: discount,
              couponApplied: false,
            },
          }
        )
        .then(() => {
          resolve();
        })
        .catch(() => {
          reject();
        });
    });
  },

  changeProQuantity: (details) => {
    count = parseInt(details.count);
    quantity = parseInt(details.quantity);
    console.log(quantity);
    return new Promise(async (resolve, reject) => {
      if (details.count == -1 && details.quantity == 1) {
        db.get()
          .collection(collection.CART_COLLECTION)
          .deleteOne(
            { _id: ObjectId(details.cart) }
            // {
            //     $pull:{products:{item:ObjectId(details.product)}}
            // },
          )
          .then((response) => {
            resolve({ removeProduct: true });
          });
      } else {
        let pro=await db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:ObjectId(details.product)})
        if((count==1 && quantity<pro.Stock)  || (quantity>=0 && count==-1)){
          db.get().collection(collection.CART_COLLECTION).findOneAndUpdate(
            {"products.item": ObjectId(details.product), _id: ObjectId(details.cart),},
            { $inc: { "products.$.quantity": count } })
            .then(() => {
            resolve({ status: true });
          });
        }else{
          resolve({stock:true})
        }
      }
    });
  },

  deleteCartProduct: (details) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.CART_COLLECTION)
        .updateOne(
          { _id: ObjectId(details.cart) },
          {
            $pull: {
              products: {
                item: ObjectId(details.product),
                color: details.color,
                size: details.size,
              },
            },
          }
        )
        .then(async () => {
          let cart = await db
            .get()
            .collection(collection.CART_COLLECTION)
            .findOne({ _id: ObjectId(details.cart) });
          if (cart.products.length == 0) {
            db.get()
              .collection(collection.CART_COLLECTION)
              .deleteOne({ _id: ObjectId(details.cart) })
              .then(() => {
                resolve({ removeProduct: true });
              });
          }
          resolve({ removeProduct: true });
        });
    });
  },

  getTotalAmount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let total = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .aggregate([
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
          {
            $group: {
              _id: null,
              total: { $sum: { $multiply: ["$quantity", "$product.Price"] } },
              maxTotal: {
                $sum: { $multiply: ["$quantity", "$product.Maxprice"] },
              },
            },
          },
          {
            $project: {
              discount: { $subtract: ["$maxTotal", "$total"] },
              total: 1,
              maxTotal: 1,
            },
          },
        ])
        .toArray();
      resolve(total[0]);
    });
  },

  getCartProductsList: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: ObjectId(userId) });
      resolve(cart.products);
    });
  },

  placeOrder: (userid, order, address, products, total) => {
    let date = new Date();
    total = parseInt(total);
    return new Promise((resolve, reject) => {
      let status = order["payment-method"] == "COD" ? "placed" : "pending";
      let orderObj = {
        delivery: {
          firstname: address.address.firstname,
          firstname: address.address.firstname,
          address1: address.address.address1,
          address2: address.address.address2,
          city: address.address.city,
          state: address.address.state,
          pin: address.address.pin,
          phone: address.address.phone,
          email: address.address.email,
        },
        orderId: Math.floor(100000 + Math.random() * 900000),
        userId: userid,
        paymentMethod: order["payment-method"],
        wallet:order.wallet,
        products: products,
        totalAmount: total,
        date: date,
        status: status,
      };
      if(order.coupon)orderObj.coupon=order.coupon
      if(order.wallet)orderObj.wallet=order.wallet
      let dt = new Date();
      dt.setMinutes(dt.getMinutes() + 6000);
      var d = dt.toString();
      var index = d.lastIndexOf(":") - 6;
      orderObj.deliveryDate = d.substring(0, index);
      db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then(async (response) => {
          resolve({ status: true, orderObj, response });
        });
    });
  },

  orderDetails: (orderId, userId) => {
    return new Promise(async (resolve, reject) => {
      await db.get().collection(collection.CART_COLLECTION).deleteOne({ user: ObjectId(userId) });
      let order = await db.get().collection(collection.ORDER_COLLECTION).find({ _id: ObjectId(orderId) }).toArray();
      console.log(order[0].products);
      let orderedPro=order[0].products
      for(i=0;i<orderedPro.length;i++){
        await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:orderedPro[i].item},{$inc:{Stock:-orderedPro[i].quantity}})
      }
      if(order[0].wallet){
        await db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectId(userId)},{$set:{wallet:0}})
      }
      resolve(order[0]);
    });
  },

  getUserDetails: (userId) => {
    return new Promise(async (resolve, reject) => {
      let user = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ _id: ObjectId(userId) });
      resolve(user);
    });
  },

  editProfile: (id, data) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .updateOne(
          { _id: ObjectId(id) },
          {
            $set: {
              name: data.name,
              email: data.email,
              bday: data.bday,
              number: data.number,
            },
          }
        )
        .then(async () => {
          let user = await db
            .get()
            .collection(collection.USER_COLLECTION)
            .findOne({ _id: ObjectId(id) });
          resolve(user);
        });
    });
  },

  /* Address Adding, Editing, Deleting */

  addAddress: (userId, address) => {
    address.id = new ObjectId();
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .updateOne(
          { _id: ObjectId(userId) },
          { $addToSet: { address: address } }
        )
        .then(() => {
          resolve();
        });
    });
  },

  editAddress: (id, addId) => {
    return new Promise(async (resolve, reject) => {
      let address = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .aggregate([
          {
            $match: { _id: ObjectId(id) },
          },
          {
            $unwind: "$address",
          },
          { $match: { "address.id": ObjectId(addId) } },
          { $project: { address: 1 } },
        ])
        .toArray();
      resolve(address[0]);
    });
  },

  updateAddress: (id, data) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .updateOne(
          { _id: ObjectId(id), "address.id": ObjectId(data.id) },
          {
            $set: {
              "address.$.firstname": data.firstname,
              "address.$.lastname": data.lastname,
              "address.$.email": data.email,
              "address.$.phone": data.phone,
              "address.$.address1": data.address1,
              "address.$.address2": data.address2,
              "address.$.pin": data.pin,
              "address.$.office": data.office,
              "address.$.city": data.city,
              "address.$.state": data.state,
            },
          }
        )
        .then(() => {
          resolve();
        });
    });
  },

  getAddress: (userId, addId) => {
    return new Promise(async (resolve, reject) => {
      let address = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .aggregate([
          {
            $match: { _id: ObjectId(userId) },
          },
          {
            $unwind: "$address",
          },
          { $match: { "address.id": ObjectId(addId) } },
          { $project: { address: 1 } },
        ])
        .toArray();
      resolve(address[0]);
    });
  },

  /* Address Adding, Editing, Deleting End*/

  getOrderDetails: (userId) => {
    return new Promise(async (resolve, reject) => {
      let orders = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: { userId: userId },
          },
          {
            $sort: { _id: -1 },
          },
        ])
        .toArray();
      for (i = 0; i < orders.length; i++) {
        if (orders[i].status == "pending") {
          db.get()
            .collection(collection.ORDER_COLLECTION)
            .deleteOne({ _id: orders[i]._id })
            .then(() => {
              resolve(orders);
            });
        }
      }
      resolve(orders);
    });
  },

  getOrderProducts: (userId, orderId) => {
    return new Promise(async (resolve, reject) => {
      let products = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: { userId: userId, _id: ObjectId(orderId) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
              deliveryDate: "$deliveryDate",
              amount: "$totalAmount",
              userId: "$userId",
              address: "$delivery",
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
            $unwind: "$product",
          },
        ])
        .toArray();
      resolve(products);
    });
  },

  /* Filter Products in User Side */

  getLowToHigh: (val1, val2, cat) => {
    return new Promise(async (resolve, reject) => {
      if (val1 == "sta" && val2 == "fin") {
        let pro = await db
          .get()
          .collection(collection.PRODUCT_COLLECTION)
          .find({ Category: cat })
          .sort({ Price: -1 })
          .toArray();
        resolve(pro);
      } else if (val1 == "low" && val2 == "hig") {
        let pro = await db
          .get()
          .collection(collection.PRODUCT_COLLECTION)
          .find({ Category: cat })
          .sort({ Price: 1 })
          .toArray();
        resolve(pro);
      } else if (val1 == "000" && val2 == "399") {
        let pro = await db
          .get()
          .collection(collection.PRODUCT_COLLECTION)
          .find({ Category: cat, Price: { $gte: 399, $lte: 799 } })
          .toArray();
        resolve(pro);
      } else if (val1 == "400" && val2 == "799") {
        let pro = await db
          .get()
          .collection(collection.PRODUCT_COLLECTION)
          .find({ Category: cat, Price: { $gte: 800, $lte: 1399 } })
          .toArray();
        resolve(pro);
      } else if (val1 == "abc" && val2 == "def") {
        let pro = await db
          .get()
          .collection(collection.PRODUCT_COLLECTION)
          .find({ Category: cat })
          .toArray();
        resolve(pro);
      } else {
        reject();
      }
    });
  },

  getLowToHighSub: (val1, val2, cat, subcat) => {
    return new Promise(async (resolve, reject) => {
      if (val1 == "sta" && val2 == "fin") {
        let pro = await db
          .get()
          .collection(collection.PRODUCT_COLLECTION)
          .find({ Category: cat, Subcategory: subcat })
          .sort({ Price: -1 })
          .toArray();
        resolve(pro);
      } else if (val1 == "low" && val2 == "hig") {
        let pro = await db
          .get()
          .collection(collection.PRODUCT_COLLECTION)
          .find({ Category: cat, Subcategory: subcat })
          .sort({ Price: 1 })
          .toArray();
        resolve(pro);
      } else if (val1 == "000" && val2 == "399") {
        let pro = await db
          .get()
          .collection(collection.PRODUCT_COLLECTION)
          .find({
            Category: cat,
            Subcategory: subcat,
            Price: { $gte: 399, $lte: 799 },
          })
          .toArray();
        resolve(pro);
      } else if (val1 == "400" && val2 == "799") {
        let pro = await db
          .get()
          .collection(collection.PRODUCT_COLLECTION)
          .find({
            Category: cat,
            Subcategory: subcat,
            Price: { $gte: 800, $lte: 1399 },
          })
          .toArray();
        resolve(pro);
      } else if (val1 == "abc" && val2 == "def") {
        let pro = await db
          .get()
          .collection(collection.PRODUCT_COLLECTION)
          .find({ Category: cat, Subcategory: subcat })
          .toArray();
        resolve(pro);
      } else {
        reject();
      }
    });
  },

  getPriceFilter: (val1, val2, cat) => {
    return new Promise(async (resolve, reject) => {
      let pro = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .find({ Category: cat, Price: { $gt: val1, $lt: val2 } })
        .toArray();
      resolve(pro);
    });
  },

  getPriceFilterSub: (val1, val2, cat, subcat) => {
    return new Promise(async (resolve, reject) => {
      let pro = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .find({
          Category: cat,
          Subcategory: subcat,
          Price: { $gt: val1, $lt: val2 },
        })
        .toArray();
      resolve(pro);
    });
  },

  filterbyOrders: (val) => {
    return new Promise(async (resolve, reject) => {
      let pro = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .find({ status: val })
        .sort({ _id: -1 })
        .toArray();
      resolve(pro);
    });
  },

  /* Filter Products in User Side End*/


  /* Wishlet Codes */

  addToWishlist: (prodId1, userId1) => {
    let proObj = {
      prodId: ObjectId(prodId1),
    };
    return new Promise(async (resolve, reject) => {
      let wish = await db
        .get()
        .collection(collection.WISHLIST_COLLECTION)
        .findOne({ userId: ObjectId(userId1) });
      if (wish) {
        let wishExist = wish.products.findIndex(
          (product) => product.prodId == prodId1
        );
        if (wishExist != -1) {
          db.get()
            .collection(collection.WISHLIST_COLLECTION)
            .updateOne(
              { userId: ObjectId(userId1) },
              { $pull: { products: { prodId: ObjectId(prodId1) } } }
            )
            .then(() => {
              resolve({ already: true });
            });
        } else {
          db.get()
            .collection(collection.WISHLIST_COLLECTION)
            .updateOne(
              { userId: ObjectId(userId1) },
              {
                $push: { products: proObj },
              }
            )
            .then(() => {
              resolve({ status: true });
            });
        }
      } else {
        let cartObj = {
          userId: ObjectId(userId1),
          products: [proObj],
          isAdded: true,
        };
        db.get()
          .collection(collection.WISHLIST_COLLECTION)
          .insertOne(cartObj)
          .then((response) => {
            resolve({ status: true });
          });
      }
    });
  },

  getWishlist: (userId) => {
    return new Promise(async (resolve, reject) => {
      let prod = await db
        .get()
        .collection(collection.WISHLIST_COLLECTION)
        .aggregate([
          {
            $match: { userId: ObjectId(userId) },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "products.prodId",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: { product: 1 },
          },
        ])
        .toArray();
      resolve(prod[0].product);
    });
  },

  deleteWishlist: (proId, userId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.WISHLIST_COLLECTION)
        .updateOne(
          { userId: ObjectId(userId) },
          { $pull: { products: { prodId: ObjectId(proId) } } }
        )
        .then(() => {
          resolve();
        });
    });
  },

  /* Wishlet Codes End */

  getAllAddress: (userId) => {
    return new Promise(async (resolve, reject) => {
      let address = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .aggregate([
          {
            $match: { _id: ObjectId(userId) },
          },
          {
            $unwind: "$address",
          },
          {
            $project: { address: 1 },
          },
        ])
        .toArray();
      resolve(address);
    });
  },


  deleteAddress:(userId,addId)=>{
    return new Promise((resolve,reject)=>{
      db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectId(userId)},{$pull:{address:{id:ObjectId(addId)}}}).then(()=>{
        resolve()
      })
    })
  },

  changePaymentStatus: (orderId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .updateOne({ _id: ObjectId(orderId) }, { $set: { status: "placed" } })
        .then(() => {
          resolve();
        });
    });
  },

  generateRazorpay: (orderId, total) => {
    total = parseFloat(total);
    return new Promise((resolve, reject) => {
      var options = {
        amount: total * 100,
        currency: "INR",
        receipt: "" + orderId,
      };
      instance.orders.create(options, function (err, order) {
        if (err) {
          console.log(err);
        } else {
          resolve({ order, razorpay: true });
        }
      });
    });
  },


  /* Coupon Codes */

  getAllCoupons: () => {
    return new Promise(async (resolve, reject) => {
      let coupons = await db
        .get()
        .collection(collection.COUPON_COLLECTION)
        .find({})
        .toArray();
      resolve(coupons);
    });
  },

  checkCoupon: (data, userId) => {
    let date = new Date();
    //Parsing First Date
    let dateStart = Date.parse(date);
    return new Promise(async (resolve, reject) => {
      let used = await db
        .get()
        .collection(collection.USED_COUPON_COLLECTION)
        .findOne({ coupon: data.coupon, userId: ObjectId(userId) });
      let coupon = await db
        .get()
        .collection(collection.COUPON_COLLECTION)
        .find({ coupon: data.coupon })
        .toArray();
      let discount = parseInt(coupon[0].discount);

      //Parsing Coupon Date
      let dateFin = Date.parse(coupon[0].duration);
      if (dateFin < dateStart) {
        resolve({ timeout: true });
      } else if (used != null) {
        resolve({ used: true });
      } else {
        db.get()
          .collection(collection.CART_COLLECTION)
          .updateOne(
            { user: ObjectId(userId) },
            {
              $set: {
                coupon: data.coupon,
                discount: discount,
                couponApplied: true,
              },
            },
            { upsert: true }
          )
          .then((res) => {
            resolve({ status: true });
          });
      }
    });
  },

  useCoupon: (userId, coupon) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USED_COUPON_COLLECTION)
        .updateOne(
          { coupon: coupon },
          { $push: { userId: ObjectId(userId) } },
          { upsert: true }
        )
        .then(() => {
          resolve();
        });
    });
  },

  deleteCoupon: (userId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.CART_COLLECTION)
        .updateOne(
          { user: ObjectId(userId) },
          { $unset: { coupon: 1, discount: 1, finalPrice: 1 } }
        )
        .then(() => {
          resolve();
        });
    });
  },


  /* Coupon Codes End */

  /* Get Related Product */

  getRelatedPro: (cat, sub) => {
    return new Promise(async (resolve, reject) => {
      let related = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .find({ Category: cat, Subcategory: sub })
        .toArray();
      resolve(related);
    });
  },

  /* Get Related Product End*/

  
  /* Wallet Code */

  updatewallet: (userId, wallet) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.CART_COLLECTION).updateOne({user:ObjectId(userId)},{$set:{wallet:wallet,walletApplied:true}}).then(() => {
          resolve();
        });
    });
  },

  updateCartWallet:(userId,final)=>{
    return new Promise((resolve,reject)=>{
      db.get().collection(collection.CART_COLLECTION).updateOne({user:ObjectId(userId)},{$set:{walletFinal:final}}).then(()=>{
        resolve()
      })
    })
  },

  deleteWallet:(id)=>{
    return new Promise((resolve,reject)=>{
      db.get().collection(collection.CART_COLLECTION).updateOne({user:ObjectId(id)},{$unset:{wallet:1,walletApplied:1,walletFinal:1}}).then(()=>{
        resolve()
      })
    })
  },

  /* Wallet Code End*/

  //Get total Category

  getCatTotal:()=>{
    return new Promise(async(resolve,reject)=>{
      let count=await db.get().collection(collection.CATEGORY_COLLECTION).find({}).count()
      resolve(count)
    })
  },

  getTotalProCount:()=>{
    return new Promise(async(resolve,reject)=>{
      let products=await db.get().collection(collection.PRODUCT_COLLECTION).find().count()
      resolve(products)
    })
  }

};
