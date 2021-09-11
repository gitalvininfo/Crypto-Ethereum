pragma solidity ^0.4.2;
import "./DappToken.sol";

contract DappTokenSale {

    // admin has no public, don't expose it
    address admin;
    DappToken public tokenContract;
    uint public tokenPrice;


    constructor(DappToken _tokenContract, uint _tokenPrice) public {
        // Assign an admin
        // Token Contract
        // Token Price
        admin = msg.sender;
        tokenContract = _tokenContract;
        tokenPrice = _tokenPrice;

    }
}