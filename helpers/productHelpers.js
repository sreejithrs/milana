var db = require("../config/connection");
var collection = require("../config/collection");
var ObjectId = require("mongodb").ObjectId;
const bcrypt = require("bcrypt");


module.exports = {
  adminLogin: (adminData) => {
    let response = {};
    return new Promise(async (resolve, reject) => {
      let admin = await db
        .get()
        .collection(collection.ADMIN_COLLECTION)
        .findOne({ name: adminData.name });
      if (admin) {
        bcrypt.compare(adminData.password, admin.password).then((status) => {
          if (status) {
            response.admin = admin;
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

  getAllUsers: () => {
    return new Promise((resolve, reject) => {
      let user = db
        .get()
        .collection(collection.USER_COLLECTION)
        .find()
        .toArray();
      resolve(user);
    });
  },

  blockUser: (userId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .findOneAndUpdate(
          { _id: ObjectId(userId) },
          { $set: { status: false } }
        )
        .then(() => {
          resolve();
        });
    });
  },

  unBlockUser: (userId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .findOneAndUpdate({ _id: ObjectId(userId) }, { $set: { status: true } })
        .then(() => {
          resolve();
        });
    });
  },

  addProduct: (product) => {
    return new Promise((resolve, reject) => {
        product.Stock=parseInt(product.Stock)
        product.Maxprice= parseFloat(product.Maxprice)
        product.Price= parseFloat(product.Price)
        db.get().collection(collection.PRODUCT_COLLECTION).insertOne(product).then((data) => {
          resolve(data.insertedId);
        });
    });
  },

  updateId:(fileArr,id)=>{
    return new Promise((resolve,reject)=>{
      db.get().collection(collection.PRODUCT_COLLECTION).update({_id: ObjectId(id)},{$set:{Imageid:fileArr}}).then(()=>{
        resolve()
      })
    })
  },

  getAllProducts: () => {
    return new Promise(async (resolve, reject) => {
      let product = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray();
      resolve(product);
    });
  },

  editProduct: (userId) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: ObjectId(userId) }).then((response) => {
          resolve(response);
        });
    });
  },

  updateProduct: (proId, product) => {
    product.Stock=parseInt(product.Stock)
    product.Maxprice= parseFloat(product.Maxprice)
    product.Price= parseFloat(product.Price)
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .updateOne(
          { _id: ObjectId(proId) },
          {
            $set: {
              Name: product.Name,
              Maxprice: product.Maxprice,
              Price: product.Price,
              Title: product.Title,
              Colour: product.Colour,
              Category: product.Category,
              Stock:product.Stock,
              Description: product.Description,
            },
          }
        )
        .then((response) => {
          resolve();
        });
    });
  },

  deleteProduct: (proId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .deleteOne({ _id: ObjectId(proId) })
        .then((response) => {
          resolve();
        });
    });
  },


  getAllCategories: () => {
    return new Promise(async(resolve, reject) => {
      let cat =await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray();
      resolve(cat);
    });
  },

  getACategory:(id)=>{
    return new Promise((resolve,reject)=>{
      let cat=db.get().collection(collection.CATEGORY_COLLECTION).findOne({_id:ObjectId(id)})
      resolve(cat)
    })
  },

  deleteCategory:(id)=>{
    return new Promise((resolve,reject)=>{
      db.get().collection(collection.CATEGORY_COLLECTION).deleteOne({_id:ObjectId(id)}).then(()=>{
        resolve()
      })
    })
  },

  deleteSubCategory:(subcat,catId)=>{
    return new Promise((resolve,reject)=>{
      db.get().collection(collection.CATEGORY_COLLECTION).updateOne({_id:ObjectId(catId)},{$pull:{ SubCategory: subcat}}).then(()=>{
        resolve({status:true})
      })
    })
  },

  addCategory: (data) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.CATEGORY_COLLECTION).insertOne(data).then((data) => {
          resolve(data.insertedId);
        })
        .catch(() => {
          reject();
        });
    });
  },

  updateCategory:(id,data)=>{
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.CATEGORY_COLLECTION)
        .updateOne(
          { _id: ObjectId(id) },
          {
            $set: {
              Category: data.Category,
              SubCategory: data.SubCategory
            },
          }
        )
        .then(() => {
          resolve();
        });
    });
  },

  addSubCategory: (catDat) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.CATEGORY_COLLECTION)
        .update(
          { Category: catDat.Category },
          { $addToSet: { SubCategory: catDat.Subcategory } }
        )
        .then((data) => {
          resolve(data);
        });
    });
  },

  getSubCat: (cat) => {
    return new Promise(async (resolve, reject) => {
      let catt=await db.get().collection(collection.CATEGORY_COLLECTION).aggregate([
          { $match: { Category: cat } },
          { $project: { SubCategory: 1, _id: 0 } }
        ]).toArray()
        resolve(catt)
        
    })
   },

   addColor:(color)=>{
       return new Promise((resolve,reject)=>{
           db.get().collection(collection.COLOR_COLLECTION).insertOne(color).then(()=>{
              resolve()
           }).catch(()=>{
              reject()
           })
       })
    },

   addSize:(size)=>{
       return new Promise((resolve,reject)=>{
           db.get().collection(collection.COLOR_COLLECTION).insertOne(size).then(()=>{
               resolve()
           }).catch(() => {
            reject();
          });
       })
   },

   getColor:()=>{
       return new Promise(async(resolve,reject)=>{
          let color=await db.get().collection(collection.COLOR_COLLECTION).find({Color:{$exists:1}}).toArray()
          resolve(color)
       })
   },

   getSize:()=>{
    return new Promise(async(resolve,reject)=>{
        let size=await db.get().collection(collection.COLOR_COLLECTION).find({Size:{$exists:1}}).toArray()
        resolve(size)
     })
   },

   getOrderDetails:()=>{
     return new Promise(async(resolve,reject)=>{
       let orders= await db.get().collection(collection.ORDER_COLLECTION).find().toArray()
       resolve(orders)
     })
   },

   changeStatus: (status, id) => {
    let Status = status;
    console.log(Status);
    return new Promise(async (resolve, reject) => {
        await db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: ObjectId(id) }, { $set: { status: status } }).then(async () => {
            if (Status == "delivered") {
              let order = await db.get().collection(collection.ORDER_COLLECTION).findOne({ _id: ObjectId(id) });
              db.get().collection(collection.DELIVERED_COLLECTION).insertOne(order).then(() => {
                  db.get().collection(collection.ORDER_COLLECTION).deleteOne({ _id: ObjectId(id) }).then(() => {
                      resolve();
                    })
                    .catch((err) => {
                      reject();
                  });
              });
            }
            else{
              resolve();
            }
        });
      
    });
  },

  getTotalPro:()=>{
    return new Promise(async(resolve,reject)=>{
      let pro =await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
        {
          $project:{Name:1,Stock:1, _id:0}
        }
      ]).toArray()
      resolve(pro)
    
    })
  },

  getTotalSales:()=>{
    return new Promise(async(resolve,reject)=>{
      let cod=await db.get().collection(collection.DELIVERED_COLLECTION).aggregate([
        {
          $match:{paymentMethod:'COD'}
        },
        { 
          $project :{count: {$size:{ "$ifNull":["$products",[]]}}}
        },
        {
          $group : {_id:"", total:{$sum:"$count"}}
        },
        {
          $set:{status:'COD'}
        }
      ]).toArray()

      let razor=await db.get().collection(collection.DELIVERED_COLLECTION).aggregate([
        {
          $match:{paymentMethod:'Razorpay'}
        },
        { 
          $project :{count: {$size:{ "$ifNull":["$products",[]]}}}
        },
        {
          $group : {_id:"", total:{$sum:"$count"}}
        },
        {
          $set:{status:'Razorpay'}
        }
      ]).toArray()

      let paypal=await db.get().collection(collection.DELIVERED_COLLECTION).aggregate([
        {
          $match:{paymentMethod:'Paypal'}
        },
        { 
          $project :{count: {$size:{ "$ifNull":["$products",[]]}}}
        },
        {
          $group : {_id:"", total:{$sum:"$count"}}
        },
        {
          $set:{status:'Paypal'}
        }
      ]).toArray()
      console.log(paypal[0]);
      resolve([cod[0],razor[0],paypal[0]])
    })
  },

  getTotalStatus:()=>{
    return new Promise(async(resolve,reject)=>{
      let Cstatus=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
       { $match: {status:'cancelled'} },
       { $project :{
         count: {$size:{ "$ifNull":["$products",[]]}}
       }},
       {$group : {
         _id:"", total:{$sum:"$count"}
       }},
       { $set :{ status:'cancelled'}},
      ]).toArray()

      let Astatus=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        { $match: {status:'accepted'} },
       { $project :{
         count: {$size:{ "$ifNull":["$products",[]]}}
       }},
       {$group : {
         _id:"", total:{$sum:"$count"}
       }},
       { $set :{ status:'accepted'}},
       ]).toArray()

       let Sstatus=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        { $match: {status:'shipped'} },
       { $project :{
         count: {$size:{ "$ifNull":["$products",[]]}}
       }},
       {$group : {
         _id:"", total:{$sum:"$count"}
       }},
       { $set :{ status:'shipped'}},
       ]).toArray()

       let Pstatus=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        { $match: {status:'placed'} },
       { $project :{
         count: {$size:{ "$ifNull":["$products",[]]}}
       }},
       {$group : {
         _id:"", total:{$sum:"$count"}
       }},
       { $set :{ status:'placed'}},
       ]).toArray()


       let Dstatus=await db.get().collection(collection.DELIVERED_COLLECTION).aggregate([
        { $match: {status:'delivered'} },
        { $project :{
          count: {$size:{ "$ifNull":["$products",[]]}}
        }},
        {$group : {
          _id:"", total:{$sum:"$count"}
        }},
        { $set :{ status:'delivered'}},
       ]).toArray()
       resolve([Astatus[0],Cstatus[0],Sstatus[0],Pstatus[0],Dstatus[0]])
    })
  },

  getSalesTotal:()=>{
    return new Promise(async(resolve,reject)=>{
      let totalProfit=await db.get().collection(collection.DELIVERED_COLLECTION).find().toArray()
      resolve(totalProfit)
    })
  },

  getTotUsers:()=>{
    return new Promise(async(resolve,reject)=>{
      let users=await db.get().collection(collection.USER_COLLECTION).find().count()
      resolve(users)
    })
  },

   getsalesReport: () => {
    return new Promise(async (resolve, reject) => {
        let orderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
            {
                $match: { $and: [{ status: { $ne: 'cancelled' } }, { status: { $ne: 'pending' } }] }
            },
            {
                $project: {
                    orderId: '$orderId',
                    userId: '$userId',
                    paymentMethod: '$paymentMethod',
                    totalAmount: '$totalAmount',
                    date: '$date',
                    products: '$products'
                }
            },
        ]).toArray()
        resolve(orderItems)
    })
  },


  getweeklyreport: async () => {
    const dayOfYear = (date) =>
        Math.floor(
            (date - new Date(date.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24
        )
    return new Promise(async (resolve, reject) => {
        const data = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
            {
                $match: {
                    $and: [{ status: { $ne: 'cancelled' } }, { status: { $ne: 'pending' } }],
                    date: { $gte: new Date(new Date() - 7 * 60 * 60 * 24 * 1000) },
                },
            },

            { $group: { _id: { $dayOfYear: '$date' }, count: { $sum: 1 } } },
        ]).toArray()
        const thisday = dayOfYear(new Date())
        let salesOfLastWeekData = []
        for (let i = 0; i < 8; i++) {
            let count = data.find((d) => d._id === thisday + i - 7)

            if (count) {
                salesOfLastWeekData.push(count.count)
            } else {
                salesOfLastWeekData.push(0)
            }
        }
        console.log(salesOfLastWeekData);
        resolve(salesOfLastWeekData)

    })
  },

  getSalesReport: (from, to) => {
    console.log(new Date(from));
    console.log(new Date(to));
    return new Promise(async (resolve, reject) => {
        let orders = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
            {
              $match: {
                date: { $gte: new Date(from), $lte: new Date(to) },
              }
            },
        ]).toArray()
        console.log(orders);
        resolve(orders)
    })
  },

  getNewSalesReport: (type) => {
    const numberOfDays = type === 'daily' ? 1 : type === 'weekly' ? 7 : type === 'monthly' ? 30 : type === 'yearly' ? 365 : 0
    const dayOfYear = (date) =>
        Math.floor(
            (date - new Date(date.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24
        )
    return new Promise(async (resolve, reject) => {
        const data = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
            {
                $match: {
                    date: { $gte: new Date(new Date() - numberOfDays * 60 * 60 * 24 * 1000) },
                },
            },
        ]).toArray()
        console.log(data);
        resolve(data)

    })
  },

   addCategoryOffer: (offer) => {
    let offerItem = offer.offerItem;

    return new Promise(async (resolve, reject) => {
      let offerExist = await db
        .get()
        .collection(collection.CATOFFER_COLLECTION)
        .findOne({ offerItem: offerItem });

      if (offerExist) {
        resolve({ Exist: true });
      } else {
        db.get()
          .collection(collection.CATOFFER_COLLECTION)
          .insertOne(offer)
          .then(async (data) => {
            let activeOffer = await db
              .get()
              .collection(collection.CATOFFER_COLLECTION)
              .findOne({ _id: data.insertedId });

            //let Id = activeOffer._id;
            let discount = activeOffer.discount;
            let category = activeOffer.offerItem;

            //  let validity = activeOffer.validity;

            let items = await db
              .get()
              .collection(collection.PRODUCT_COLLECTION)
              .aggregate([
                {
                  $match: { $and: [{ Category: category }, { offer: false }] },
                },
              ])
              .toArray();

            await items.map(async (product) => {
              let productPrice = product.Price;

              let offerPrice = productPrice - (productPrice * discount) / 100;
              offerPrice = parseInt(offerPrice.toFixed(2));
              let proId = product._id + "";

              await db
                .get()
                .collection(collection.PRODUCT_COLLECTION)
                .updateOne(
                  {
                    _id: ObjectId(proId),
                  },
                  {
                    $set: {
                      Price: offerPrice,
                      offer: true,
                      OldPrice: productPrice,
                      offerPercentage: parseInt(discount),
                    },
                  }
                );
            });

            let Item2 = await db
              .get()
              .collection(collection.PRODUCT_COLLECTION)
              .aggregate([
                {
                  $match: {
                    $and: [{ Category: category }, { ProductOffer: true }],
                  },
                },
              ])
              .toArray();

            if (Item2[0]) {
              await Item2.map(async (product) => {
                let ProdName = product.Name;

                proOFF = await db
                  .get()
                  .collection(collection.PRODUCT_OFFER)
                  .aggregate([
                    {
                      $match: { items: { $regex: ProdName, $options: "i" } },
                    },
                  ])
                  .toArray();
                let proOffPercentage = parseInt(proOFF[0].discount);
                discount = parseInt(discount);
                let BSToFF =
                  proOffPercentage < discount ? discount : proOffPercentage;
                let prize = product.OldPrice;
                let offerrate = prize - (prize * BSToFF) / 100;
                db.get()
                  .collection(collection.PRODUCT_COLLECTION)
                  .updateOne(
                    {
                      _id: ObjectId(product._id),
                    },
                    {
                      $set: {
                        Price: offerrate,
                        offer: true,
                        OldPrice: prize,
                        offerPercentage: parseInt(BSToFF),
                      },
                    }
                  );
              });
            } else {
            }

            resolve({ Exist: false });
          });
      }
    });
  },

  
  getCategoryOffer: () => {
    return new Promise(async (resolve, reject) => {
      let offerList = await db.get().collection(collection.CATOFFER_COLLECTION).find().toArray();
      resolve(offerList);
    });
  },

  categoryfind: () => {
    return new Promise((res, rej) => {
      db.get().collection(collection.CATEGORY_COLLECTION).find().toArray().then((result) => {
          res(result);
        });
    });
  },

  deleteCategoryOffer: (offId, category) => {
    return new Promise(async (resolve, reject) => {
      let items = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .aggregate([
          {
            $match: { $and: [{ Category: category }, { ProductOffer: false }] },
          },
        ])
        .toArray();

      await items.map(async (product) => {
        let productPrice = product.OldPrice;

        let proId = product._id + "";

        await db
          .get()
          .collection(collection.PRODUCT_COLLECTION)
          .updateOne(
            {
              _id: ObjectId(proId),
            },
            {
              $set: {
                Price: productPrice,
                offer: false,
              },
            }
          );
      });

      let itemforUpdate = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .aggregate([
          {
            $match: { $and: [{ Category: category }, { ProductOffer: true }] },
          },
        ])
        .toArray();

      if (itemforUpdate[0]) {
        await itemforUpdate.map(async (product) => {
          let proName = product.Name;
          let Off = await db
            .get()
            .collection(collection.PRODUCT_OFFER)
            .aggregate([
              {
                $match: { items: { $regex: proName, $options: "i" } },
              },
            ])
            .toArray();

          let dis = parseInt(Off[0].discount);
          let prze = product.OldPrice;
          let offerPrice = prze - (prze * dis) / 100;

          db.get()
            .collection(collection.PRODUCT_COLLECTION)
            .updateOne(
              {
                _id: ObjectId(product._id),
              },
              {
                $set: {
                  Price: offerPrice,
                  offer: true,
                  OldPrice: prze,
                  offerPercentage: dis,
                  ProductOffer: true,
                },
              }
            );
        });
      }

      db.get()
        .collection(collection.CATOFFER_COLLECTION)
        .deleteOne({ _id: ObjectId(offId) })
        .then(async () => {
          resolve();
        });
    });
  },

  addProductOffer: (offer) => {
    return new Promise(async (resolve, reject) => {
      let Pro = offer.items;

      let offerExist = await db
        .get()
        .collection(collection.PRODUCT_OFFER)
        .aggregate([
          {
            $match: { items: { $regex: Pro, $options: "i" } },
          },
        ])
        .toArray();

      if (offerExist[0]) {
        resolve({ Exist: true });
      } else {
        await db
          .get()
          .collection(collection.PRODUCT_OFFER)
          .insertOne(offer)
          .then(async (data) => {
            let ins = await db
              .get()
              .collection(collection.PRODUCT_OFFER)
              .findOne({ _id: ObjectId(data.insertedId) });
            d = ins.discount;
          });

        let ProName = offer.items;
        productoffer = await db
          .get()
          .collection(collection.PRODUCT_COLLECTION)
          .aggregate([
            {
              $match: { Name: { $regex: ProName, $options: "i" } },
            },
          ])
          .toArray();
        let comingPercentage = parseInt(d);
        let activepercentege = productoffer[0].offerPercentage;
        let bestOff =
          comingPercentage < activepercentege
            ? activepercentege
            : comingPercentage;
        if (productoffer[0].offer) {
          let price = productoffer[0].OldPrice;
          let offerPrice = price - (price * bestOff) / 100;
          db.get()
            .collection(collection.PRODUCT_COLLECTION)
            .updateOne(
              {
                Name: offer.items,
              },
              {
                $set: {
                  OldPrice: price,
                  price: offerPrice,
                  offerPercentage: bestOff,
                  offer: true,
                  ProductOffer: true,
                },
              }
            );
        } else {
          let price = productoffer[0].Price;
          let offerPrice = price - (price * comingPercentage) / 100;

          db.get()
            .collection(collection.PRODUCT_COLLECTION)
            .updateOne(
              {
                Name: offer.items,
              },
              {
                $set: {
                  OldPrice: price,
                  Price: offerPrice,
                  offerPercentage: bestOff,
                  offer: true,
                  ProductOffer: true,
                },
              }
            );
        }
      }
      resolve({ Exist: false });
    });
  },

  deleteProOffer: (offId, Product) => {
    return new Promise(async (resolve, reject) => {
      let items = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .aggregate([
          {
            $match: { Name: Product },
          },
        ])
        .toArray();
      let productPrice = items[0].OldPrice;
      let category = items[0].Category;
      let proName = items[0].Name;
      let CateofferExist = await db
        .get()
        .collection(collection.CATOFFER_COLLECTION)
        .findOne({ offerItem: category });
      if (CateofferExist) {
        let percentage = parseInt(CateofferExist.discount);
        let price = items[0].OldPrice;
        let offerPrice = price - (price * percentage) / 100;
        db.get()
          .collection(collection.PRODUCT_COLLECTION)
          .updateOne(
            {
              Name: proName,
            },
            {
              $set: {
                OldPrice: price,
                Price: offerPrice,
                offerPercentage: percentage,
                offer: true,
                ProductOffer: false,
              },
            }
          );

        db.get()
          .collection(collection.PRODUCT_OFFER)
          .deleteOne({ _id: ObjectId(offId) })
          .then(() => {
            resolve();
          });
      } else {
        let proId = items[0]._id + "";

        await db
          .get()
          .collection(collection.PRODUCT_COLLECTION)
          .updateOne(
            {
              _id: ObjectId(proId),
            },
            {
              $set: {
                Price: productPrice,
                offer: false,
                ProductOffer: false,
              },
            }
          );

        db.get()
          .collection(collection.PRODUCT_OFFER)
          .deleteOne({ _id: ObjectId(offId) })
          .then(() => {
            resolve();
          });
      }
    });
  },

  viewOfferPro: () => {
    return new Promise(async (res, rej) => {
      let result = await db
        .get()
        .collection(collection.PRODUCT_OFFER)
        .find()
        .toArray();
      res(result);
    });
  },

  getProductsByCat:(cat)=>{
    return new Promise(async(resolve,reject)=>{
      let prod=await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
        {
          $match:{Category:cat}
        },
        {
          $group:{_id:"$Name"}
        }
      ]).toArray()
      resolve(prod)
    })
  },

  checkCoupon:(data)=>{
    return new Promise((resolve,reject)=>{
      db.get().collection(collection.COUPON_COLLECTION).insertOne(data).then(()=>{
        resolve()
      }).catch(()=>{
        reject()
      })
    })
  },


  checkReferal:(referedBy)=>{
    return new Promise(async(resolve,reject)=>{
      let res=await db.get().collection(collection.USER_COLLECTION).find({refer:referedBy}).toArray()
      console.log(res);
      if(res.length==0){
        reject()
      }else{
        resolve(res)
      }
    })
  },

  updatewallet:(userId,discount)=>{
    return new Promise((resolve,reject)=>{
      db.get().collection(collection.CART_COLLECTION).updateOne({user:ObjectId(userId)},{$set:{discount:discount}}).then(()=>{
        resolve(true)
      })
    })
  },

  removeWallet:(userId)=>{
    return new Promise((resolve,reject)=>{
      db.get().collection(collection.CART_COLLECTION).updateOne({user:ObjectId(userId)},{$unset:{discount:1,walletFinal:1}}).then(()=>{
        resolve(true)
      })
    })
  },


};
