pragma solidity ^0.6.0;

import "../../src/contracts/RFT.sol";
import "../../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";
//import "../../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";

/*contract RFT is ERC20 {
    constructor() ERC20("RFT Token", "REI_ID") public {
        _setupDecimals(0);
    }

    function mint(address toAddress,uint256 amount) public {
        _mint(toAddress,amount);
    }
    function _mint(address account, uint256 amount) internal virtual {
        require(account != address(0), "ERC20: mint to the zero address");

        _beforeTokenTransfer(address(0), account, amount);

        _totalSupply = _totalSupply.add(amount);
        _balances[account] = _balances[account].add(amount);
        emit Transfer(address(0), account, amount);
    }
}*/

contract REI is ERC721 {
    string[] public locations;

    //TODO: make mapping of address to list of tokens for internal tracking of who has what token

    mapping(uint => bool) public _idExists;
    mapping(uint => string) public _idMap;
    mapping(string => uint) public _locationMap;
    RFT public rft;

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

        //call ERC20 mint (msg.sender,hashed_data)
        //RFT rft;
        //rft = new RFT();
        //rft.mint(msg.sender,100);

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

    function stringToUint(string memory s) public pure returns (uint result) {
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


    function burn(uint256 _tokenId) public {
        require(_idExists[_tokenId]);

        _burn(_tokenId);
        _idExists[_tokenId] = false;
        string memory _loc = _idMap[_tokenId];
        _idMap[_tokenId] = '';
        _locationMap[_loc] = 0;
        
        //TODO: figure this out vvvv need to see how to get the index of that location (_loc) in the array
        //delete locations[_loc];
    }
    /*function _burn(uint256 tokenId) internal virtual {
        address owner = ownerOf(tokenId);

        _beforeTokenTransfer(owner, address(0), tokenId);

        // Clear approvals
        _approve(address(0), tokenId);

        // Clear metadata (if any)
        if (bytes(_tokenURIs[tokenId]).length != 0) {
            delete _tokenURIs[tokenId];
        }

        _holderTokens[owner].remove(tokenId);

        _tokenOwners.remove(tokenId);

        emit Transfer(owner, address(0), tokenId);
    }*/
}