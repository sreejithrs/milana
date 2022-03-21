const mongoClient=require('mongodb').MongoClient
require('dotenv').config()
const state={
    db:null
}

module.exports.connect=function(done){
    const url= "mongodb+srv://sreejithrs001:Insanesoul123@cluster0.12s17.mongodb.net/milana?retryWrites=true&w=majority"
    const dbname='milana'

    mongoClient.connect(url,(err,data)=>{
        if(err)  
           return done(err)
        state.db=data.db(dbname)
        done()
    })

   
}

module.exports.get=function(){
    return state.db
}
