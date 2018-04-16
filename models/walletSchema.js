var orm = require("orm");

var connectionParams = require('../settings.json');







exports.insertRecord =   function (callback){
        orm.connect(connectionParams.connection , (err , db)=>{
        
        
            console.log("database coonected successfully");
            console.log(db);
    
           var Wallet =  db.define('details' , {
                
                     wallet_id:String,
                     coinType:String,
                     address:String,
                     balance:Number,
                     confirmBalance:Number,
                     spendableBalance:Number,
                     

    
    
    
            });
    
            return callback(Wallet);
    
        });
    
            
    }

exports.save = function(Wallet , record , callback){


        Wallet.create(record , function(err){

                if(err){

                     return res.json({status:false , message:'Some error occured'});
                }else{

                    return callback({status:true , message:'Data Successfully Inserted'});
                }


        })



}

