pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

import "../../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";


/**
 * @title ExampleDivisibleNFTs
 * @dev Exploring the need for a non-fungible token to have multiple owners with different shares
 *
 * @dev A 'unit' in this example is the minimum part of a token that an owner can have.
 *
 * @notice This is just an example for the Ethereum request for comments section
 * @notice This code is of course UNSAFE & NON SECURE
 */

contract DNFT is ERC721 {
    // ------------------------------ Variables ------------------------------

    string[] public locations;
    uint256[] public tokenIds;

    string[] private activeLocations;
    uint256[] private activeTokenIds;

    uint256[] private ownerTokens;
    uint256[] private ownerShares;

    // user registry 
    //address[] private activeUsers;

    // Percentage of ownership over a token (address of owner => tokenId => %ofToken)
    mapping(address => mapping(uint256 => uint256)) ownerToTokenShare;

    // How much owners have of a token (tokenId => address => %ofToken)
    mapping(uint256 => mapping(address => uint256)) tokenToOwnersHoldings;

    // If a token has been created
    mapping(uint256 => bool) mintedToken;

    // Number of equal(fungible) units that constitute a token (that a token can be divised to)
    uint256 public divisibility = 100; // All tokens have the same divisibility in our example

    // total of managed/tracked tokens by this smart contract
    uint256 public totalS;

    constructor() public ERC721("DNFT Token", "SYMBOL") {}

    // ------------------------------ Modifiers ------------------------------

    modifier onlyNonExistentToken(uint256 _tokenId) {
        require(mintedToken[_tokenId] == false);
        _;
    }

    modifier onlyExistentToken(uint256 _tokenId) {
        require(mintedToken[_tokenId] == true);
        _;
    }

    // ------------------------------ View functions ------------------------------

    // function findHash(string memory _loc) public returns(uint256 kHash){
    //     uint256 id = uint256(keccak256(bytes(_loc)));
    //     return id;
    // }

    /// @dev The balance an owner have of a token
    function unitsOwnedOfAToken(address _owner, uint256 _tokenId)
        public
        view
        returns (uint256 _balance)
    {
        return ownerToTokenShare[_owner][_tokenId];
    }

    // ------------------------------ Core public functions ------------------------------

    /// @dev Anybody can create a token in our example
    /// @notice Minting grants 100% of the token to a new owner in our example
    function mint(string memory _location)
        public
        onlyNonExistentToken(uint256(keccak256(bytes(_location))))
    {
        uint256 _tokenId = uint256(keccak256(bytes(_location)));

        _mint(msg.sender, _tokenId);

        locations.push(_location);
        tokenIds.push(_tokenId);
        //activeUsers.push(msg.sender);

        mintedToken[_tokenId] = true;

        _addShareToNewOwner(msg.sender, _tokenId, divisibility);
        _addNewOwnerHoldingsToToken(msg.sender, _tokenId, divisibility);

        totalS = totalS + 1;

        //Minted(_owner, _tokenId); // emit event
    }

    /// @dev transfer parts of a token to another user
    function transfer(address _to, uint256 _tokenId, uint256 _units)
        public
        onlyExistentToken(_tokenId)
    {
        require(ownerToTokenShare[msg.sender][_tokenId] >= _units);
        // TODO should check _to address to avoid losing tokens units

        _removeShareFromLastOwner(msg.sender, _tokenId, _units);
        _removeLastOwnerHoldingsFromToken(msg.sender, _tokenId, _units);

        _addShareToNewOwner(_to, _tokenId, _units);
        _addNewOwnerHoldingsToToken(_to, _tokenId, _units);

        if (ownerToTokenShare[_to][_tokenId] > 50) {
            _transfer(ownerOf(_tokenId), _to, _tokenId);
        }

        //Transfer(msg.sender, _to, _tokenId, _units); // emit event
    }

    function burn(uint256 _tokenId) public {
        require(ownerToTokenShare[msg.sender][_tokenId] == divisibility);

        _burn(_tokenId);
        mintedToken[_tokenId] = false;
        ownerToTokenShare[msg.sender][_tokenId] = 0;
        tokenToOwnersHoldings[_tokenId][msg.sender] = 0;
    }

    // ------------------------------ Getter functions (public functions) -----------------------------
    
    // Get all location assets active
    /* TODO: TBD WHETHER WILL IMPLEMENT OR TEST */
    function allLocations() public returns(string[] memory locs) {
        delete activeLocations;

        for (uint i=0; i < locations.length; i++) {
            if (mintedToken[tokenIds[i]] == true) {
                activeLocations.push(locations[i]);
            }
        }
        return activeLocations;
    }

    // Get all tokenIds active
    function allTokenIds() public returns(uint256[] memory tokens) {
        delete activeTokenIds;

        for (uint i=0; i < tokenIds.length; i++) {
            if (mintedToken[tokenIds[i]] == true) {
                activeTokenIds.push(tokenIds[i]);
            }
        }
        return activeTokenIds;
    }

    // Check if an address is a majority owner
    /*TODO: IMPLEMENT MAYBE AND TEST??*/
    function majorityOwner(address _user, uint256 _tokenId) public view returns(bool maj) {
        bool majority = false;

        if (ownerToTokenShare[_user][_tokenId] > 50) {
            majority = true;
        }
        
        return majority;
    }

    // Get addresses of owners and the shares of a token
    /*function tokenOwners(uint256 _tokenId) public returns(address[] memory owners, uint256[] memory shares) {
        uint256 numUsers = tokenToOwnersHoldings[_tokenId].length;

        address[] memory users;
        uint256[] memory shrs;

        for(int i = 0; i < numUsers; i++) {
            if(tokenToOwnersHoldings[_tokenId][i])
        }

    }*/

    // Get all shares for a specific owner 
    function allOwnerShares(address _user) public returns(uint256[] memory tokens, uint256[] memory shares) {
        
        delete ownerTokens;
        delete ownerShares;

        for (uint i=0; i < tokenIds.length; i++) {

            uint256 amountOfShares = ownerToTokenShare[_user][tokenIds[i]];

            if (amountOfShares > 0) {
                ownerTokens.push(tokenIds[i]);
                ownerShares.push(amountOfShares);
            }
        }

        return (ownerTokens, ownerShares);

    }

    // Get the number of shares of a token an owner has 
    function ownerSharesforToken(address _user, uint256 _tokenId) public view returns(uint256 amountOfShares) {
        return ownerToTokenShare[_user][_tokenId];
    }

    // ------------------------------ Helper functions (internal functions) ------------------------------

    // Remove token units from last owner
    function _removeShareFromLastOwner(
        address _owner,
        uint256 _tokenId,
        uint256 _units
    ) internal {
        ownerToTokenShare[_owner][_tokenId] -= _units;
    }

    // Add token units to new owner
    function _addShareToNewOwner(
        address _owner,
        uint256 _tokenId,
        uint256 _units
    ) internal {
        ownerToTokenShare[_owner][_tokenId] += _units;
    }

    // Remove units from last owner
    function _removeLastOwnerHoldingsFromToken(
        address _owner,
        uint256 _tokenId,
        uint256 _units
    ) internal {
        tokenToOwnersHoldings[_tokenId][_owner] -= _units;
    }

    // Add the units to new owner
    function _addNewOwnerHoldingsToToken(
        address _owner,
        uint256 _tokenId,
        uint256 _units
    ) internal {
        tokenToOwnersHoldings[_tokenId][_owner] += _units;
    }
}
