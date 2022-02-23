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

   changeStatus:(status,id)=>{
     return new Promise(async(resolve,reject)=>{
      db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:ObjectId(id)},{$set:{status:status}}).then(()=>{
        resolve()
      })
     })
   }


};
