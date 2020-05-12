pragma solidity ^0.6.0;

import "../../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";

// it doesnt matter. the --save does it in the directory. may have to do --save-dev

contract REI is ERC721 {
    string[] public locations;

    mapping(uint => bool) _idExists;
    mapping(uint => string) public _idMap;
    mapping(string => uint) public _locationMap;

    constructor() ERC721("REI Token", "REIADDRESS") public {
    }

    function mint(string memory _location) public {
        // Require unique address
        // Address - add
        // Call mint function
        // Address - track


        //MAKE HASH HERE
        uint256 _id = uint256(keccak256(bytes(_location)));

        require(!_idExists[_id]);
        

        //TODO: Change what we use for the ID on the token
        //hashed value of address (street #, street, zip) plus timestamp, make dict with key the hash and the value the address
        _mint(msg.sender, _id);

        locations.push(_location);
        _idExists[_id] = true;
        _idMap[_id] = _location;
        _locationMap[_location] = _id;
    }

    function transfer(address _toAddress, uint256 _tokenId) public {//string memory _tId) public {
        //uint _tokenId = stringToUint(_tId);
        require(_idExists[_tokenId]);

        //find way to look up tokenId (look at line 39 of test)
        _transfer(msg.sender,_toAddress,_tokenId);//from, to, tokenId

    }

    /*function _transfer(address from, address to, uint256 tokenId) internal virtual {
        require(ownerOf(tokenId) == from, "ERC721: transfer of token that is not own");
        require(to != address(0), "ERC721: transfer to the zero address");

        _beforeTokenTransfer(from, to, tokenId);

        // Clear approvals from the previous owner
        _approve(address(0), tokenId);

        _holderTokens[from].remove(tokenId);
        _holderTokens[to].add(tokenId);

        _tokenOwners.set(tokenId, to);

        emit Transfer(from, to, tokenId);
    }*/
    function stringToUint(string memory s) public returns (uint result) {
        bytes memory b = bytes(s);
        uint i;
        result = 0;
        for (i = 0; i < b.length; i++) {
            uint c = uint(uint8(b[i]));
            if (c >= 48 && c <= 57) {
                result = result * 10 + (c - 48);
            }
        }
    }
}