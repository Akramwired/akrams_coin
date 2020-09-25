App = {
    web3Provider: null,
    contracts: {},
    account: '0x0',
    loading: false,
    tokenPrice: 1000000000000000,
    tokensSold: 0,
    tokensAvailable: 750000,
    
    init: function() {
        console.log("App has been initialized");
        return App.initWeb3();
    },
    
    initWeb3: function() {
        if (typeof web3 !== 'undefined') {
            // If a web3 instance is already provided by Meta Mask.
            App.web3Provider = web3.currentProvider;
            web3 = new Web3(web3.currentProvider);
          } else {
            // Specify default instance if no web3 instance provided
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
            web3 = new Web3(App.web3Provider);
          }
        
        return App.initContracts();
    },

    initContracts: function() {
        $.getJSON("AkramsTokenSale.json", function(akramsTokenSale) {
            App.contracts.AkramsTokenSale = TruffleContract(akramsTokenSale);
            App.contracts.AkramsTokenSale.setProvider(App.web3Provider);
            App.contracts.AkramsTokenSale.deployed().then(function(akramsTokenSale) {
                console.log("AkramsTokenSale Address: ", akramsTokenSale.address);
            });
            }).done(function() {
                $.getJSON("AkramsToken.json", function(akramsToken) {
                    App.contracts.AkramsToken = TruffleContract(akramsToken);
                    App.contracts.AkramsToken.setProvider(App.web3Provider);
                    App.contracts.AkramsToken.deployed().then(function(akramsToken) {
                        console.log("AkramsToken Address: ", akramsToken.address);
                    });
                App.listenForEvents();
                return App.render();
                });
            });
    },

    // Listening for events emitted from the contract
    listenForEvents: function() {
      App.contracts.AkramsToken.deployed().then(function(instance) {
          instance.Sell({},
            {
                fromBlock: 0,
                toBlock: 'latest'
            }
          ).watch(function(error, event) {
              console.log("Event triggered: ", event);
              App.render();
          })
      })  
    },

    render: function() {
        if(App.loading) {
            return;
        }
        App.loading = true;
        let loader = $('#loader');
        let content = $('#content');
        loader.show();
        content.hide();
        // Loading app data 
        web3.eth.getCoinbase(function(err, account) {
            if (err === null) {
              App.account = account;
              $("#accountAddress").html("Your Account: " + App.account);
            }
        });
        // Loading the token sale contract
        App.contracts.AkramsTokenSale.deployed().then(function(instance) {
            tokenSaleInstance = instance;
            return tokenSaleInstance.tokenPrice();
        }).then(function(tokenPrice) {
            App.tokenPrice = tokenPrice;
            $(".token-price").html(web3.fromWei(App.tokenPrice, 'Ether').toNumber());
            return tokenSaleInstance.tokensSold();
        }).then(function(tokensSold) {
            App.tokensSold = tokensSold.toNumber();
            //App.tokensSold = 375000;
            $(".tokens-sold").html(App.tokensSold);
            $(".tokens-available").html(App.tokensAvailable);
            let progressBar = (App.tokensSold / App.tokensAvailable) * 100;
            $("#progress").css("width", progressBar + "%");
            // Loading the token contract
            App.contracts.AkramsToken.deployed().then(function(instance) {
                tokenInstance = instance;
                return tokenInstance.balanceOf(App.account);
            }).then(function(balance) {
                $('.akrams-balance').html(balance.toNumber());
                App.loading = false;
                loader.hide();
                content.show();
            });
        });
    },

    buyTokens: function() {
        $("#content").hide();
        $("#loader").show();
        let numberOfTokens = $("#numberOfTokens").val();
        App.contracts.AkramsTokenSale.deployed().then(function(instance) {
            tokenSaleInstance = instance;
            return tokenSaleInstance.buyTokens(numberOfTokens, { from: App.account, value: numberOfTokens * App.tokenPrice, gas: 500000});
        }).then(function(result) {
            console.log("Tokens bought...");
            // Listening for the event
            $('form').trigger('reset'); // Reset number of tokens in form
            /* $("#content").show();
            $("#loader").hide(); */
        });
    }
}

$(function() {
    $(window).load(function() {
        App.init();
    });
});