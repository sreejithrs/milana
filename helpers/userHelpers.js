var db=require('../config/connection')
var collection=require('../config/collection')
const bcrypt=require('bcrypt')

module.exports={
    getAllProducts:()=>{
        return new Promise((resolve,reject)=>{
            let product=db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(product)
        })
    },

    doSignUp:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            userData.password=await bcrypt.hash(userData.password,10)
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data)=>{
                resolve(data.insertedId)
            }).catch((err)=>{
                reject()
            })
        })
    },

    doLogin:(userData)=>{
        let loginStatus=false
        let response={}
        return new Promise(async(resolve,reject)=>{
            let user=await db.get().collection(collection.USER_COLLECTION).findOne({email:userData.email})
            if(user){
                bcrypt.compare(userData.password,user.password).then((status)=>{
                    if(status){
                        response.user=user
                        response.status=true
                       
                        resolve(response)
                    }
                    else{
                      
                        reject({status:false})
                    }
                })
            }else{
               
                reject({status:false})
            }
        })
    },

    mobileCheck:(data)=>{
        let response={}
        return new Promise(async(resolve,reject)=>{
           let number=await db.get().collection(collection.USER_COLLECTION).findOne({number:data.number})
           console.log(number);
           if(number){
               response.user=number
               resolve(response)
           }
           else{
               reject()
           }
        })
    }

    

  
}