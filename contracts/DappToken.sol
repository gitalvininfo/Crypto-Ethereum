pragma solidity ^0.4.2;

contract DappToken {
    string public name = "DApp Token";
    string public symbol = "DAPP";
    string public standard = "DApp Token v1.0";
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;

    event Transfer(address indexed _from, address indexed _to, uint256 _value);

    constructor (uint256 _initialSupply) public {
        // msg.sender is the account that deployed the contract
        balanceOf[msg.sender] = _initialSupply;
        totalSupply = _initialSupply;
    }

    // Transfer
    // Exception if account does not have enough
    // Return a boolean
    // Transfer event
    function transfer(address _to, uint256 _value) public returns (bool success) {
        require (balanceOf[msg.sender] >= _value);

        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;

        Transfer(msg.sender, _to, _value);
        return true;
    }
}