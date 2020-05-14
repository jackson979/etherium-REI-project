pragma solidity ^0.6.0;

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

        if (ownerToTokenShare[_to][_tokenId] >= 50) {
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
