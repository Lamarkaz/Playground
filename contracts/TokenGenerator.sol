pragma solidity ^0.4.20;

library SafeMath {

  /**
  * @dev Multiplies two numbers, throws on overflow.
  */
  function mul(uint256 _a, uint256 _b) internal pure returns (uint256) {
    // Gas optimization: this is cheaper than asserting 'a' not being zero, but the
    // benefit is lost if 'b' is also tested.
    // See: https://github.com/OpenZeppelin/openzeppelin-solidity/pull/522
    if (_a == 0) {
      return 0;
    }

    uint256 c = _a * _b;
    assert(c / _a == _b);

    return c;
  }

  /**
  * @dev Integer division of two numbers, truncating the quotient.
  */
  function div(uint256 _a, uint256 _b) internal pure returns (uint256) {
    // assert(_b > 0); // Solidity automatically throws when dividing by 0
    uint256 c = _a / _b;
    // assert(_a == _b * c + _a % _b); // There is no case in which this doesn't hold

    return c;
  }

  /**
  * @dev Subtracts two numbers, throws on overflow (i.e. if subtrahend is greater than minuend).
  */
  function sub(uint256 _a, uint256 _b) internal pure returns (uint256) {
    assert(_b <= _a);
    uint256 c = _a - _b;

    return c;
  }

  /**
  * @dev Adds two numbers, throws on overflow.
  */
  function add(uint256 _a, uint256 _b) internal pure returns (uint256) {
    uint256 c = _a + _b;
    assert(c >= _a);

    return c;
  }
}

contract TokenGenerator {
    
    using SafeMath for uint256;

    struct Token {
        string symbol;
        string name;
        uint8 decimals;
        uint totalSupply;
        address generator;
        mapping (address => uint) balances;
    }
    
    mapping (bytes32 => Token) public tokens;

    event Transfer(string symbol, address sender, address recipient, uint value);
    event NewToken(string symbol, string name, uint8 decimals, uint totalSupply, address generator);

    function balanceOf(string _token, address _owner) public view returns (uint256) {
        return tokens[keccak256(_token)].balances[_owner];
    }

    function generate(string symbol, string name, uint8 decimals, uint totalSupply) public returns (bool) {
        require(totalSupply > 0);
        Token storage newToken = tokens[keccak256(symbol)];
        require(newToken.totalSupply == 0);
        newToken.symbol = symbol;
        newToken.name = name;
        newToken.decimals = decimals;
        newToken.generator = msg.sender;
        newToken.totalSupply = totalSupply;
        newToken.balances[msg.sender] = totalSupply;
        NewToken(symbol, name, decimals, totalSupply, msg.sender);
        Transfer(symbol, address(0), msg.sender, totalSupply);
        return true;
    }

    function transfer(string _token, address _to, uint256 _value) public returns (bool) {
        Token storage thisToken = tokens[keccak256(_token)];
        require(_value <= thisToken.balances[msg.sender]);
        require(_to != address(0));
        thisToken.balances[msg.sender] = thisToken.balances[msg.sender].sub(_value);
        thisToken.balances[_to] = thisToken.balances[_to].add(_value);
        Transfer(_token, msg.sender, _to, _value);
        return true;
    }
    
}