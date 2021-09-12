App = {
    web3Provider: null,
    contracts: {},
    account: '0x0',
    loading: false,
    tokenPrice: 1000000000000000,
    tokensSold: 0,
    tokensAvailable: 750000,

    init: function () {
        console.log('app initialized');
        return App.initWeb3();
    },

    initWeb3: function () {
        if (typeof web3 !== 'undefined') {
            // if web3 instance is already provided by Meta Mask.
            App.web3Provider = web3.currentProvider;
            web3 = new Web3(web3.currentProvider);
        } else {
            // specify default instance if no web3 instance provided.
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
            web3 = new Web3(App.web3Provider);
        }
        return App.initContracts();
    },

    initContracts: function () {
        $.getJSON("DappTokenSale.json", function (dappTokenSale) {
            App.contracts.DappTokenSale = TruffleContract(dappTokenSale);
            App.contracts.DappTokenSale.setProvider(App.web3Provider);
            App.contracts.DappTokenSale.deployed().then(function (dappTokenSale) {
                console.log('dapp token sale address', dappTokenSale.address);
            });
        }).done(function () {
            $.getJSON("DappToken.json", function (dappToken) {
                App.contracts.DappToken = TruffleContract(dappToken);
                App.contracts.DappToken.setProvider(App.web3Provider);
                App.contracts.DappToken.deployed().then(function (dappToken) {
                    console.log('dapp token address', dappToken.address);
                });
                
                App.listenForEvents();
                return App.render();
            });
        })

    },

    render: function () {
        if (App.loading) {
            return;
        }
        App.loading = true;
        var loader = $('#loader');
        var content = $('#content');

        loader.show();
        content.hide();


        // load account data
        web3.eth.getCoinbase(function (err, account) {
            if (err === null) {
                console.log(account)
                App.account = account;
                $('#accountAddress').html('Your account: ' + account);
            }
        })

        // load token sale contract
        App.contracts.DappTokenSale.deployed().then(function (instance) {
            dappTokenSaleInstance = instance;
            return dappTokenSaleInstance.tokenPrice();
        }).then(function (tokenPrice) {
            App.tokenPrice = tokenPrice;
            $('.token-price').html(web3.fromWei(App.tokenPrice, 'ether').toNumber());
            return dappTokenSaleInstance.tokensSold();
        }).then(function (tokensSold) {
            App.tokensSold = tokensSold.toNumber();
            $('.tokens-sold').html(App.tokensSold);
            $('.tokens-available').html(App.tokensAvailable);

            var progressPercent = (Math.ceil(App.tokensSold) / App.tokensAvailable) * 100;
            $('#progress').css('width', progressPercent + '%');

            // load token contract
            App.contracts.DappToken.deployed().then(function (instance) {
                dappTokenInstance = instance;
                return dappTokenInstance.balanceOf(App.account)
            }).then(function (balance) {
                console.log(balance.toNumber())
                $('.dapp-balance').html(balance.toNumber());
                App.loading = false;
                loader.hide();
                content.show();
            })

        })
    },

    buyTokens: function () {

        $('#content').hide();
        $('#loader').show();

        var numberOfTokens = $('#numberOfTokens').val();

        App.contracts.DappTokenSale.deployed().then(function (instance) {
            return instance.buyTokens(numberOfTokens, {
                from: App.account,
                value: numberOfTokens * App.tokenPrice,
                gas: 500000
            }).then(function(result) {
                console.log('tokens bought...')
                $('form').trigger('reset');
                // wait for sell event
            })
        })
    },

    // events emitted from contract
    listenForEvents: function() {
        App.contracts.DappTokenSale.deployed().then(function(instance) {
            instance.Sell({}, {
                fromBlock: 0,
                toBlock: 'latest'
            }).watch(function(err, event) {
                console.log('event triggered', event)
                App.render();
            })
        })
    }
}

$(function () {
    $(window).load(function () {
        App.init();
    })
})