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

    //arrays to hold all tokenIds and locations
    string[] public locations;
    uint256[] public tokenIds;

    //arrays to hold active locations and tokenIds, used with helper methods
    string[] private activeLocations;
    uint256[] private activeTokenIds;

    //arrays to hold owner info
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

    //empty constructor for ERC 721 token
    constructor() public ERC721("DNFT Token", "SYMBOL") {}

    // ------------------------------ Modifiers ------------------------------

    //modifiers to ensure that tokens are not duplicated
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

    /// @dev The balance an owner has of a token
    function unitsOwnedOfAToken(address _owner, uint256 _tokenId)
        public
        view
        returns (uint256 _balance)
    {
        return ownerToTokenShare[_owner][_tokenId];
    }

    // ------------------------------ Core public functions ------------------------------

    //anybody can create a token in our example
    //minting grants 100% of the token to a new owner in our example
    function mint(string memory _location)
        public
        onlyNonExistentToken(uint256(keccak256(bytes(_location))))
    {
        //generate tokenId as hash of address
        uint256 _tokenId = uint256(keccak256(bytes(_location)));

        //mint a 721 token to the person issuing the request and use the hashed value as the ID
        _mint(msg.sender, _tokenId);

        //add the address and tokenIds to their respective arrays
        locations.push(_location);
        tokenIds.push(_tokenId);
        //activeUsers.push(msg.sender);

        //set the tokenId's minted status to true
        mintedToken[_tokenId] = true;

        //call functions to add shares of the token to the person entering the address
        _addShareToNewOwner(msg.sender, _tokenId, divisibility);
        _addNewOwnerHoldingsToToken(msg.sender, _tokenId, divisibility);

        //track total supply of tokens
        totalS = totalS + 1;
    }

    //transfer parts of a token to another user
    function transfer(address _to, uint256 _tokenId, uint256 _units)
        public
        onlyExistentToken(_tokenId)
    {
        //require that the person transferring has the number of shares that they want to transfer
        require(ownerToTokenShare[msg.sender][_tokenId] >= _units);
        // TODO should check _to address to avoid losing tokens units

        //call functions to remove shares from the person transferring
        _removeShareFromLastOwner(msg.sender, _tokenId, _units);
        _removeLastOwnerHoldingsFromToken(msg.sender, _tokenId, _units);

        //call functions to add shares to the person receiving
        _addShareToNewOwner(_to, _tokenId, _units);
        _addNewOwnerHoldingsToToken(_to, _tokenId, _units);

        //if the receiver now has greater than 50% of the shares, they become the "owner" of the 721 token
        if (ownerToTokenShare[_to][_tokenId] > 50) {
            _transfer(ownerOf(_tokenId), _to, _tokenId);
        }
    }

    //burn tokens
    function burn(uint256 _tokenId) public {
        //require that the person requesting the burn owns ALL shares of a token
        require(ownerToTokenShare[msg.sender][_tokenId] == divisibility);

        //burn the 721 token
        _burn(_tokenId);

        //set the minted status of the ID to false and remove the shares from the owner
        mintedToken[_tokenId] = false;
        ownerToTokenShare[msg.sender][_tokenId] = 0;
        tokenToOwnersHoldings[_tokenId][msg.sender] = 0;
    }

    // ------------------------------ Getter functions (public functions) -----------------------------
    
    // Get all location assets active
    function allLocations() public returns(string[] memory locs) {
        //clear array from previous call
        delete activeLocations;

        //iterate through the tokenIds and if there is a minted token, add the location to the array
        for (uint i=0; i < locations.length; i++) {
            if (mintedToken[tokenIds[i]] == true) {
                activeLocations.push(locations[i]);
            }
        }
        //return the array with active locations
        return activeLocations;
    }

    // Get all tokenIds active
    function allTokenIds() public returns(uint256[] memory tokens) {
        //clear array from previous call
        delete activeTokenIds;

        //iterate through the tokenIds and if there is a minted token, add the tokenId to the array
        for (uint i=0; i < tokenIds.length; i++) {
            if (mintedToken[tokenIds[i]] == true) {
                activeTokenIds.push(tokenIds[i]);
            }
        }
        //return the array with active locations
        return activeTokenIds;
    }

    // Check if an address is a majority owner
    function majorityOwner(address _user, uint256 _tokenId) public view returns(bool maj) {
        //initialize variable as false
        bool majority = false;

        //check if the user has >50% of shares, set to treu if yes
        if (ownerToTokenShare[_user][_tokenId] > 50) {
            majority = true;
        }
        //return the value
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
        //clear arrays from previous calls
        delete ownerTokens;
        delete ownerShares;

        //iterate through tokenIds for a given user and push the ID and number of shares if they exist
        for (uint i=0; i < tokenIds.length; i++) {

            uint256 amountOfShares = ownerToTokenShare[_user][tokenIds[i]];

            if (amountOfShares > 0) {
                ownerTokens.push(tokenIds[i]);
                ownerShares.push(amountOfShares);
            }
        }

        //return both the tokenIds and shares arrays
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
