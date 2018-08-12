pragma solidity ^0.4.20;

contract Whitelist {
    
    // Ownable
    
    address public owner;
  
    event OwnershipRenounced(address indexed previousOwner);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    function Whitelist() public {
        owner = 0xbf7914020229016b03983d0b25e8f5a36b54c059;
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    function renounceOwnership() public onlyOwner {
        OwnershipRenounced(owner);
        owner = address(0);
    }

    function transferOwnership(address _newOwner) public onlyOwner {
        _transferOwnership(_newOwner);
    }

    function _transferOwnership(address _newOwner) internal {
        require(_newOwner != address(0));
        OwnershipTransferred(owner, _newOwner);
        owner = _newOwner;
    }
    
    // Whitelisting/Permissioning
    
    struct User {
        string name;
        bool whitelisted;
    }
    
    mapping (address => User) public whitelist;
    mapping (string => address) names;
    
    event Whitelisted(address user, string name);
    event UnWhitelisted(address user, string name);
    event Renamed(address user, string oldName, string newName);
    
    function add(address user, string name) public onlyOwner returns (bool) {
        require(whitelist[user].whitelisted == false);
        require(names[name] == address(0));
        whitelist[user].whitelisted = true;
        whitelist[user].name = name;
        names[name] = user;
        Whitelisted(user, name);
        return true;
    }
    
    function remove(address user) public onlyOwner returns (bool) {
        require(whitelist[user].whitelisted == true);
        string memory name = getName(user);
        whitelist[user].whitelisted = false;
        whitelist[user].name = "";
        names[name] = address(0);
        UnWhitelisted(user, name);
        return true;
    }
    
    function rename(address user, string name) public onlyOwner returns (bool) {
        require(whitelist[user].whitelisted == true);
        string memory currentName = getName(user);
        require(keccak256(currentName) != keccak256(name));
        require(names[name] == address(0));
        whitelist[user].name = name;
        names[name] = user;
        names[currentName] = address(0);
        Renamed(user, currentName, name);
    }
    
    function isWhitelisted(address user) public view returns (bool) {
        return whitelist[user].whitelisted;
    }
    
    function getName(address user) public view returns (string) {
        return whitelist[user].name;
    }
    
    function getAddress(string name) public view returns (address) {
        return names[name];
    }
    
    // Allowed transaction types mask
    uint32 constant None = 0;
    uint32 constant All = 0xffffffff;
    uint32 constant Call = 0x02;

    function allowedTxTypes(address sender) public view returns (uint32) {
        if (sender == owner) return All;
        if (whitelist[sender].whitelisted) return Call;
        return None;
    }
    
}