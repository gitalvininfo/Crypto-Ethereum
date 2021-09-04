var DappToken = artifacts.require("./DappToken.sol");

// all of the accounts look in ganache
contract('DappToken', function (accounts) {

    it('initializes the contract with the correct value', function() {
        return DappToken.deployed().then(function(instance) {
            tokenInstance = instance;
            return tokenInstance.name();
        }).then(function(name) {
            assert.equal(name, 'DApp Token', 'has the correct name')
            return tokenInstance.symbol();
        }).then(function(symbol) {
            assert.equal(symbol, 'DAPP', 'has the correct symbol')
            return tokenInstance.standard();
        }).then(function(standard) {
            assert.equal(standard, 'DApp Token v1.0', 'has the correct standard')
        })
    })

    it('allocates the initial supply upon deployment', function () {
        return DappToken.deployed().then(function (instance) {
            tokenInstance = instance;
            return tokenInstance.totalSupply();
        }).then(function(totalSupply) {
            assert.equal(totalSupply.toNumber(), 1000000, 'sets the total supply to 1M')
            return tokenInstance.balanceOf(accounts[0])
        }).then(function(adminBalance) {
            assert.equal(adminBalance.toNumber(), 1000000, 'it allocates the initial supply to the admin.')
        })
    })

    it('transfer token ownership', function() {
        return DappToken.deployed().then(function(instance) {
            tokenInstance = instance;
            // Test require statement first by transferring something larger than the sender's balance
            return tokenInstance.transfer.call(accounts[1], 999999999999999999999)
        }).then(assert.fail).catch(function(error) {
            // assert(error.message.indexOf('revert') >= 0, 'error message must contain revert');
            return tokenInstance.transfer.call(accounts[1], 250000, {from: accounts[0]})
        }).then(function(success) {
            assert.equal(success, true, 'it returns true');
            return tokenInstance.transfer(accounts[1], 250000, {
                from: accounts[0]
            })
        }).then(function(receipt) {
            assert.equal(receipt.logs.length, 1, 'triggers one event')
            return tokenInstance.balanceOf(accounts[1])
        }).then(function(balance) {
            assert.equal(balance.toNumber(), 250000, 'adds the amount to the receiving accounts');
            return tokenInstance.balanceOf(accounts[0]);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), 750000, 'deducts the amount from the sending amount.')
        })
    })
})