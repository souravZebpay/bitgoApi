var express = require('express');

var BitGoJS = require('bitgo');

var bitgo = new BitGoJS.BitGo({accessToken:'v2x7ea86ce72750e2d0f98045a34ffdb621dbac5b2738c4c8c937a15d9c474259f7'});

//var bitgo = new BitGoJS.BitGo({accessToken:'v2x7ea86ce72750e2d0f98045a34ffdb621dbac5b2738c4c8c937a15d9c474259f7'});
var router = express.Router();


//---- Api For User Details ----- //

router.get('/user/profile', function(req, res, next) {
  
  bitgo.me({}, function callback(err, user) {
    if (err) {
      // handle error
      res.send({status:false , message:'Some Problem Occured while creating transaction'});
      return false;

    }
    res.send(user);
  });

});

//----------- Api For KeyChain List -------------//

router.get('/user/keychain/list' , function callback(req , res , next){

  var keychains = bitgo.keychains();
  
  
  keychains.list({}, function callback(err, keychains) {
    if (err) {
      res.send({status:false , message:'Some Problem Occured while getting Keychain list'});
      return false;
    }
    console.dir(keychains);

    res.send(keychains);
  });
  


});

//--------- Api For Creating new Keychain ----------------------- //


router.get('/user/keychain/create' , function callback(req , res , next){

  var keychains = bitgo.keychains();
  var keychain = keychains.create();
  res.send(keychain);
  

});


//--------- Api For getting individual Keychain -----------------//


router.get('/user/keychain/individual' , function callback(req , res , next){
  
   var xpub = req.query.xpub ;

  

   bitgo.keychains().get({xpub: xpub}, function callback(err, keychain) {
     if(err){
      res.send({status:false , message:'Some Problem Occured while getting keychain'});
      return false;

     }
    console.dir(keychain);
    res.send(keychain);
  });
  
});


//--------------------- Api For Getting list of wallet ---------------------//


router.get('/user/wallet/list' , function callback(req , res , next){

  var wallets = bitgo.wallets();

  wallets.list({}, function callback(err, data) {
  // handle error, do something with wallets
      if(err){
          res.send({status:false , message:'Some Problem Occured while getting list of Wallet'});
          return false;

      }

      res.send(data);

  });
  


});


//---------------- Api For Getting Individual Wallet Details --------------------//

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
    
  

    res.send(wallet);

    });
});


//----------------------- Api For Creating new Wallet --------------------------------//


router.get('/user/wallet/create' , function callback(req ,  res , next){

  var data = {
    "passphrase": "Sourav@1992Satyam",
    "label": "My ZebPay Wallet",
  
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

//------------------ Api For Sending Coin to Specific Address -------------------------------//

//---------------- GENERATE SPECIFIC WALLET -------------------------//




router.get('/user/wallet/generate' , function callback(req ,  res , next){

  var data = {
    "passphrase": "Sourav@1992!@#",
    "label": "My Souvik Wallet",
  
  }
  
  bitgo.coin(req.query.coin).wallets().generateWallet(data, function(err, result){
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






//----------------- END HERE ------------------------------- //







router.get('/user/sendCoin' , function callback(req , res , next){

  var destinationAddress = req.query.to;
  var amountSatoshis = req.query.amount * 1e8; // send 0.1 bitcoins
 
  var walletPassphrase = 'Sourav@1992!@' // replace with wallet passphrase
 
//  var walletPassphrase = req.query.pass ;

//var walletPassphrase = 'Sourav@1992!@#' ;
  
  bitgo.wallets().get({id: req.query.by}, function(err, wallet) {
    if (err) { console.log("Error getting wallet!"); console.dir(err); return process.exit(-1); }
    console.log("Balance is: " + (wallet.balance() / 1e8).toFixed(4));
  
  wallet.sendCoins({ address: destinationAddress, amount: amountSatoshis, walletPassphrase: walletPassphrase }, function(err, result) {
      
    if (err) { 
      console.log("Error sending coins!"); 
      
      return process.exit(-1);
  
  }
  
        console.dir(result);

        res.send(result);

      });

    });



});



//--------------------------- Api For Getting List of Transaction ----------------------------//



router.get('/user/wallet/transaction/list' , function callback(req , res , next){

    var walletId = req.query.walletId ;

 
  bitgo.wallets().get({ "id": walletId }, function callback(err, wallet) {
    if (err) { throw err; }
    wallet.transactions({}, function callback(err, transactions) {
      // handle transactions
      console.log(JSON.stringify(transactions, null, 4));
      res.send(transactions);
    
    });
});




});


//---------------------------- Api For Getting Specific Transaction Details -------------------//




router.get('/user/wallet/transaction/specific' , function callback(req , res , next){


  var walletId = req.query.walletId;
  var transactionId = req.query.transactionId ;
  
  bitgo.wallets().get({ "id": walletId }, function callback(err, wallet) {
    if (err) { throw err; }
    wallet.getTransaction({ "id": transactionId }, function callback(err, transaction) {
      console.log(JSON.stringify(transaction, null, 4));
      res.send(transaction);
    });
  });
  


});





router.get('/specific/wallet' , function callback(req , res){

  bitgo.coin(req.query.coin).wallets().getWallet({ id: req.query.address})
  .then(function(wallet) {
     res.send(wallet);
    //return wallet.createAddress();
  })
 
});




router.get('/specific/address' , function callback(req , res){

  bitgo.coin(req.query.coin).wallets().getWallet({ id: req.query.address})
  .then(function(wallet) {
     //res.send(wallet);
    return wallet.createAddress();
  })
  .then(function(newAddress) {
    // print new address details
    console.log(newAddress);
    res.send(newAddress);
  });



});












module.exports = router;
