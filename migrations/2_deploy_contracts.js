const AkramsToken = artifacts.require("AkramsToken");
const AkramsTokenSale = artifacts.require("AkramsTokenSale");

module.exports = function(deployer) {
  deployer.deploy(AkramsToken, 1000000).then(function() {
    const tokenPrice = 1000000000000000 // price is given in wei
    return deployer.deploy(AkramsTokenSale, AkramsToken.address, tokenPrice);
  });
}
