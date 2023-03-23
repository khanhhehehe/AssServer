var mongo = require('mongodb').MongoClient
var url = "mongodb://localhost:27017/mydb"
mongo.connect(url,function(err,db){
    if(err) throw err
    console.log("Data create");
    db.close()
})