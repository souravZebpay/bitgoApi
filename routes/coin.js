var express = require('express');

var router = express.Router() ;

var BitGoJS = require('bitgo');

var record = require('../models/walletSchema');

var cron = require('node-cron');

var connectionParams = require('../settings.json');




var bitgo = new BitGoJS.BitGo({accessToken:connectionParams.accessToken});



//--------------------- MY DETAILS ---------------------------------- //



router.get('/me' , (req , res) => {


    bitgo.me({}, function callback(err, user) {
        if (err) {
          console.log(err);
          return res.json({status:false , message:'Some error occured' , error:err});
        }

        return res.json({status:true , message:'Current User Profile' , user:user});

        
      });
});
//---------------- END HERE ------------------------------------------//




//-------------------------- CREATE WALLET --------------------------------- //

router.post('/createWallet' , (req , res) => {


        var coin = req.body.coin ;
        var label = req.body.label ;
        var passphrase = req.body.passphrase ;

        
        bitgo.coin(coin).wallets()
        .generateWallet({ label:label , passphrase: passphrase })
        .then(function(wallet) {
            
            return res.json({status:true , wallet:wallet});
      
        }); 



});


//------------------------ END HERE ---------------------------------------//



//----------------- LIST OF WALLET AND CRON JOB INSERTION AFTER 5 Minutes ---------------------------------------//

router.get('/list' , (req , res) => {
    var coin = req.query.coin ;

    var json = {} ;


    cron.schedule('*/1 * * * *', function(){


    bitgo.coin(coin).wallets().list({})
    .then(function(wallets) {
        console.log(wallets.wallets.length);

        getIndvRecord(0 , coin ,  wallets.wallets , function(record){

            console.log({status:true , message:'Successfully inserted'});

           // return res.json({status:true , message:'Successfully fetched wallet details' , list:wallets});

        })

       
   
   
    }).catch(function(err){

        return res.json({status:false , message:'Some error occured' , error:err});


    });

 });



});



//-------------- END HERE ---------------------------------------------//


router.get('/fetch' , (req , res) => {
    var query = req.query ;

    record.insertRecord(function(Wallet){
        
        Wallet.find(query , function(err , data){

                if(err){

                    return res.json({status:false , message:'Some error has occured'});
                }else{
                    return res.json({status:true , message:'Data Successfully fetched' , data:data});
                }


        });


    });




});







//---------------------- FETCH WALLET DETAILS ----------------------------//



router.get('/details' , (req , res) => {
    var coin = req.query.coin ;
    var walletId = req.query.wallet ;

    bitgo.coin(coin).wallets().get({ id: walletId })
    .then(function(wallet) {

        return res.json({status:true , message:'Successfully fetched wallet details' , details:wallet});
      
    }).catch(function(err){


        console.log(err);

        return res.json({status:false , message:'Some error occured' , error:err});


    })

});

//----------------------- END HERE ------------------------------------//




/*

router.get('/cron' , (req , res) => {


      record.insertRecord(function(Wallet){

           Wallet.create({wallet_id:'test' , balance:1000 , confirmBalance:1000 , spendableBalance:1000} , function(err){
                    if(err){

                         console.log(err);
                         return res.json({status:false , message:'Some error Ocuured'});

                    }else{

                         return res.json({status:true , message:'Successfully Inserted the record'});
                    }
               
           })

      })

}); */







function getIndvRecord(index , coin , array , callback){

   
    if(index === array.length){

          return callback({status:true , message:'Data Successfully Inserted'});
    }

    var walletId = array[index]._wallet.id ;
    var json = {} ;



    bitgo.coin(coin).wallets().get({ id: walletId })
    .then(function(wallet) {
            
        var  date = new Date() ;
      


            json.wallet_id = wallet._wallet.id ;
            json.coinType = coin ;
            json.address = wallet._wallet.receiveAddress.address ;
            json.balance = wallet._wallet.balance ;
            json.confirmBalance = wallet._wallet.confirmedBalance ;
            json.spendableBalance = wallet._wallet.spendableBalance ;
          
            record.insertRecord(function(Wallet){
            record.save(Wallet , json , function(data){

                return getIndvRecord(index+1 , coin , array , callback);

            });
        });



           
        
      
    }).catch(function(err){


       

        return callback({status:false , message:'Some error occured'});


    })





}





module.exports = router ;