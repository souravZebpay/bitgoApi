var express = require('express');
var BitGoJS = require('bitgo');

var router = express.Router();

//const bitgo = new BitGoJS.BitGo({ env: "test", accessToken: "v2xb2c9df3ccd0f332f50475e3c583c686472f72e34420b569cfcf88d8be52ba7bf" });
var bitgo = new BitGoJS.BitGo({accessToken:'v2x7ea86ce72750e2d0f98045a34ffdb621dbac5b2738c4c8c937a15d9c474259f7'});
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});




//------- BitoGo Session Api ---- //



router.get('/session' , (req , res) => {


  bitgo.session({}, function callback(err, session) {
    if (err) {
      // handle error
    }
    return res.json(session);
  });



});


//-------------- End Here --------------------//




//-------------------- RETRIEVING CURRENT USER PROFILE ------------------- //

router.get('/me' ,  (req , res) => {

  bitgo.me({}, function callback(err, myprofile) {
    if (err) {
      // handle error
    }
        return res.json(myprofile);
  });




});



//------------------ END HERE ----------------------------------------------//



//--------------------- LOck and UnLOck the Account --------------------- //

router.get('/action' , (req , res) => {

      var actionTYpe = req.query.type ;

      if(actionTYpe === 'lock'){

        bitgo.lock({})
        .then(function(lockResponse) {
              return res.json({status:true , data:lockResponse});
        });

   
      }else{
        bitgo.unlock({}).then(function(unlockResponse){


            return res.json({status:true , data:unlockResponse});


        });
          
     }




});



//---------------------- End Here -----------------------------------------//




//----------------  LIST WALLET ------------------------------------- //



router.get('/wallet/list' , (req , res) => {
 
 
/*
let coin = req.query.coin ;



  bitgo.coin(coin).wallets().list({})
  .then(function(wallets) {
    // print the wallets
    return res.json({status:true , wallet:wallets});
  });   

  */





  var wallets = bitgo.wallets();

  wallets.list({}, function callback(err, data) {
  // handle error, do something with wallets
      if(err){
          res.send({status:false , message:'Some Problem Occured while getting list of Wallet'});
          return false;

      }

       return res.json({status:true , data:data});


  });




});

//---------------- END HERE --------------------   //



//-------------------- GENERATE NEW WALLET ------------------- //


router.post('/wallet/generate' , (req , res) => {

  var coin = req.body.coin;
  var label = req.body.label ;
  var passphrase = req.body.passphrase ;


  bitgo.coin(coin).wallets()
  .generateWallet({ label:label , passphrase: passphrase })
  .then(function(wallet) {
    
      return res.json({status:true , wallet:wallet});

  }); 








});



//--------- END HERE -----------------------------------------//







//------------------------------- GET SPECIFIC WALLET ------------- //

router.get('/wallet/specific' , (req , res) => {


          var walletId = req.query.walletId ;

          var coin = req.query.coin ;

          bitgo.coin(coin).wallets().get({ id: walletId })
                            .then(function(wallet) {
  
                   return res.json({status:true , data:wallet});

            });

});





//------------------------------- END HERE --------------------------//




//---------------------------- GET WALLET BY ADDRESS ----------- //

router.get('/wallet/address' , (req , res) => {

    var address = req.query.address ;

    var coin = req.query.coin ;



    bitgo.coin(coin).wallets().getWalletByAddress({ address: address })
      .then(function(wallet) {

          return res.json({status:true , data:wallet});
 
       });

});



//-------------------------- END HERE -------------------------------- //




//------------------------- LISTING THE WALLET TRANSFER ------------------------ //


//--------------------------- Api For Getting List of Transaction ----------------------------//



router.get('/user/wallet/transaction/list' , (req , res) => {

        var walletId = req.query.walletId ;

 
        var wallets = bitgo.wallets();


        

        wallets.get({"id": walletId }, function callback(err, wallet) {
               if (err) { throw err; }

              //  return res.json({status:true , walletDetails:wallet});


                    
               
                     wallet.transactions({}, function callback(err, transactions) {
   
                      
                      return res.json({status:true , data:transactions});


  
                }); 
      });




});


//---------------------------- Api For Getting Specific Transaction Details -------------------//



router.get('/user/wallet/transaction/specific' , (req , res) => {

    var transactionId = req.query.transactionId ;

    var walletId = req.query.walletId ;



    var wallets = bitgo.wallets();
    

    wallets.get({"id": walletId }, function callback(err, wallet) {

      wallet.getTransaction({ "id": transactionId }, function callback(err, transaction) {
       
        return res.json({status:true , data:transaction});

          });
     });

});


//-------------------------- END HERE ---------------------------------------//












//------------------------ CREATE SPECIFIC WALLET ONLY BITCOIN -------------------- //

router.get('/user/wallet/create' , function callback(req ,  res , next){
  console.log(req.query.passpharse);
  var data = {
    "passphrase": req.query.passpharse,
    "label": req.query.label,
  
  }
  
  

  bitgo.wallets().createWalletWithKeychains(data, function(err, result) {
    if (err) { console.dir(err); throw new Error("Could not create wallet!");
     
      res.send({status:false , message:'Some problem Occured while creating new wallet'});
      return false;
  }
    console.dir(result.wallet.wallet);
    console.log("User keychain encrypted xPrv: " + result.userKeychain.encryptedXprv);
    console.log("Backup keychain xPub: " + result.backupKeychain.xPub);
   
    res.send(result);
  });
});



//------------------------ END HERE -------------------------------------------------- //


router.get('/user/wallet/individual' , function callback(req ,  res , next){

  var walletId = req.query.walletId ;
  var wallets = bitgo.wallets();
  var data = {
    "type": "bitcoin",
    "id": walletId,
  };
  wallets.get(data, function callback(err, wallet) {
    if (err) {
      // handle error
      res.send({status:false , message:'Some problem Occured while getting specific wallet'});
      return false;
    }
    // Use wallet object here
    
    
    return res.send(wallet);

    });
});





router.get('/createAddress' , (req , res) => {


  var walletId = req.query.walletId ;
  var wallets = bitgo.wallets();
  var data = {
    "type": "bitcoin",
    "id": walletId,
  };
  wallets.get(data, function callback(err, wallet) {
    if (err) {
      // handle error
      res.send({status:false , message:'Some problem Occured while getting specific wallet'});
      return false;
    }
    // Use wallet object here

        wallet.createAddress({label:'My New Address'}).then(function(address){

          return res.json({status:true , wallet:address});



        });
    
         

    });
    



});




//---------- SENDING COIN TO SPECIFIC WALLET ------------------------------- //

router.get('/user/sendCoin' , function callback(req , res , next){

  var destinationAddress = req.query.to;
  var amountSatoshis = req.query.amount * 1e8; // send 0.1 bitcoins

  console.log(amountSatoshis);
 
  var walletPassphrase = 'Sourav@1992Satyam' // replace with wallet passphrase
 
//  var walletPassphrase = req.query.pass ;

//var walletPassphrase = 'Sourav@1992!@#' ;
  
  bitgo.wallets().get({id: req.query.by}, function(err, wallet) {
    if (err) { console.log("Error getting wallet!"); console.dir(err); return process.exit(-1); }
    console.log("Balance is: " + (wallet.balance() / 1e8).toFixed(4));
  
  wallet.sendCoins({ address: destinationAddress, amount: amountSatoshis, walletPassphrase: walletPassphrase }, function(err, result) {
      
    if (err) { 
     console.log(err);
      
     
  
  }
  
        console.dir(result);

        return res.json({status:true , transactionDetails:result});

      });

    });



});



//----------------- END HERE ---------------------------------------------- //








module.exports = router;
