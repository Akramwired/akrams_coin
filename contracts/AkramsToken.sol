pragma solidity ^0.5.0;
contract AkramsToken {
    string public name = "AkramsToken";
    string public symbol = "Akramwired";
    string public standard = "AkramsToken v1.0";
    uint256 public totalSupply;
    
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    event Transfer( 
        address indexed _from,
        address indexed _to,
        uint256 _value
    );

    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );
       

    constructor(uint256 _initialSupply) public {
        balanceOf[msg.sender] = _initialSupply;
        totalSupply = _initialSupply;
    }
    
    // Transfer function
    function transfer(address _to, uint256 _value) public returns (bool success) {
        // Throwing an exception if the account doesnot have enough token
        require(balanceOf[msg.sender] >= _value);
        //Transferring the balance
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value; 
        // Triggering the event
        emit Transfer(msg.sender, _to, _value);
        success = true;
        // Retruning a boolean
        return success;
    }

    // Delegated transfer function

    // Approve function
    function approve(address _spender, uint256 _value) public returns (bool success) {
        // Approving the allowance
        allowance[msg.sender][_spender] = _value;
        // Triggering the approve event
        emit Approval(msg.sender, _spender, _value);
        // Returning a boolean
        success = true;
        return success;
    }

    // TransferFrom function
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        // Requiring _from has enough token
        require(balanceOf[_from] >= _value);
        // Requiring the allowance is big enough
        require(allowance[_from][msg.sender] >= _value);
        // Changing the balance
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        // Updating the allowance
        allowance[_from][msg.sender] -= _value;
        // Triggering the transfer event
        emit Transfer(_from, _to, _value);
        // Returning a boolean
        success = true;
        return success;
    }

}