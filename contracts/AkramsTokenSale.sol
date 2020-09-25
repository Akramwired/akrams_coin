pragma solidity ^0.5.0;
import './AkramsToken.sol';
contract AkramsTokenSale {
    address admin;
    uint256 public tokenPrice;
    uint256 public tokensSold;
    AkramsToken public tokenContract;

    event Sell(
        address _buyer,
        uint256 _amount
    );

    constructor(AkramsToken _tokenContract, uint256 _tokenPrice) public {
        // Assigning an admin
        admin = msg.sender;
        // Signing the token contract
        tokenContract = _tokenContract;
        // Setting the price for the token
        tokenPrice = _tokenPrice;
    }

    // Building the safe multiply function
    function multiply(uint x, uint y) internal pure returns (uint z) {
        require(y == 0 || (z = x * y) / y == x);
    }

    // Buying the token
    function buyTokens(uint256 _numberOfTokens) public payable {
        // Requiring that the value is equal to the price of tokens i.e., preventing underpaying or overpaying
        require(msg.value == multiply(_numberOfTokens, tokenPrice));
        // Requiring that the contract has enough tokens
        require(tokenContract.balanceOf(address(this)) >= _numberOfTokens);
        // Requiring that a transfer is successful
        require(tokenContract.transfer(msg.sender, _numberOfTokens));
        // Keeping track of the number of tokens sold
        tokensSold += _numberOfTokens;
        // Triggering the sale event
        emit Sell(msg.sender, _numberOfTokens);
    }

    // End sale function
    function endSale() public {
        // Requiring an admin to do this
        require(msg.sender == admin);
        // Transfering the remaining tokens to admin
        require(tokenContract.transfer(admin, tokenContract.balanceOf(address(this))));
        //admin.transfer(address(this).balance);
        // Destroying the contract
        selfdestruct(msg.sender);
    }
}