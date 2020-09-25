const { assert } = require("chai");
const AkramsToken = artifacts.require('./AkramsToken.sol');
const AkramsTokenSale = artifacts.require('./AkramsTokenSale.sol');

contract('AkramsTokenSale', function(accounts) {
    let tokenInstance;
    let tokenSaleInstance;
    const tokenPrice = 1000000000000000 // price is given in wei
    const admin = accounts[0];
    const buyer = accounts[1];
    const tokensAvailable = 750000;
    let numberOfTokens;
    it('Initializing the contract with the correct value', function() {
        return AkramsTokenSale.deployed().then(function(instance) {
            tokenSaleInstance = instance;
            return tokenSaleInstance.address;
        }).then(function(address) {
            assert.notEqual(address, 0x0, 'has contract address');
            return tokenSaleInstance.tokenContract();
        }).then(function(address) {
            assert.notEqual(address, 0x0, 'has token contract address');
            return tokenSaleInstance.tokenPrice();
        }).then(function(price) {
            assert.equal(price, tokenPrice, 'the price of the token is correct')
        });
    });

    it('Facilitating the token buying', function() {
        return AkramsToken.deployed().then(function(instance) {
            // Grabbing the token instance first
            tokenInstance = instance;
            return AkramsTokenSale.deployed();
        }).then(function(instance) {
            // Grabbing the token sale instance second
            tokenSaleInstance = instance;
            // Provisioning 75% of the tokens to the tokenSale contract
            return tokenInstance.transfer(tokenSaleInstance.address, tokensAvailable, { from: admin });
        }).then(function(receipt) {
            numberOfTokens = 10;
            return tokenSaleInstance.buyTokens(numberOfTokens, { from: buyer, value: numberOfTokens * tokenPrice});
        }).then(function(receipt) {
            assert.equal(receipt.logs.length, 1, 'triggering one event');
            assert.equal(receipt.logs[0].event, 'Sell', 'should be the "Sell" event'); 
            assert.equal(receipt.logs[0].args._buyer, buyer, 'logging the account that purchased the tokens');
            assert.equal(receipt.logs[0].args._amount, numberOfTokens, 'logging the number of tokens purchased');
            return tokenSaleInstance.tokensSold();
        }).then(function(amount) {
            assert.equal(amount.toNumber(), numberOfTokens, 'incrementing the number of tokens sold');
            return tokenInstance.balanceOf(buyer);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), numberOfTokens);
            return tokenInstance.balanceOf(tokenSaleInstance.address);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), tokensAvailable - numberOfTokens, 'checking the balance of the token after successful transfer');
            // Trying to buy the tokens different than the ether value
            return tokenSaleInstance.buyTokens(numberOfTokens, { from: buyer, value: 1});
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert') >= 0, 'msg.value must equal to the number of tokens in wei');
            // Trying to buy more tokens than the contract has
            return tokenSaleInstance.buyTokens(800000, { from: buyer, value: numberOfTokens * tokenPrice});
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert') >= 0, 'cannot purchase more tokens than the available amount');
        });
    });

    it('ending token sale', function() {
        return AkramsToken.deployed().then(function(instance) {
          // Grab token instance first
          tokenInstance = instance;
          return AkramsTokenSale.deployed();
        }).then(function(instance) {
          // Then grab token sale instance
          tokenSaleInstance = instance;
          // Try to end sale from account other than the admin
          return tokenSaleInstance.endSale({ from: buyer });
        }).then(assert.fail).catch(function(error) {
          assert(error.message.indexOf('revert' >= 0, 'must be admin to end sale'));
          // End sale as admin
          return tokenSaleInstance.endSale({ from: admin });
        }).then(function(receipt) {
          return tokenInstance.balanceOf(admin);
        }).then(function(balance) {
          assert.equal(balance.toNumber(), 999990, 'returns all unsold dapp tokens to admin');
          // Check that the contract has no balance
         //return tokenSaleInstance.tokenPrice();
          /* balance = web3.eth.getBalance(tokenSaleInstance.address)
          assert.equal(balance, 0); */
        })
        /* .then(function(balance) {
            console.log(balance.toNumber())
            //assert.equal(balance.toNumber(), 0);
        }); */
      });
});