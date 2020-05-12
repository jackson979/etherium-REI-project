pragma solidity ^0.6.0;

import "../../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";

// it doesnt matter. the --save does it in the directory. may have to do --save-dev

contract RealEstateInvestment is ERC721 {
    constructor() ERC721("Property", "ADDRESS") public {
    }
    //what here ok
}