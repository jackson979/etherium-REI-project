pragma solidity ^0.6.0;

import "../../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract RFT is ERC20 {
    constructor() ERC20("RFT Token", "REI_ID") public {
        _setupDecimals(0);
    }

    function mint(address toAddress,uint256 amount) public {
        _mint(toAddress,amount);
    }
    /*function _mint(address account, uint256 amount) internal virtual {
        require(account != address(0), "ERC20: mint to the zero address");

        _beforeTokenTransfer(address(0), account, amount);

        _totalSupply = _totalSupply.add(amount);
        _balances[account] = _balances[account].add(amount);
        emit Transfer(address(0), account, amount);
    }*/
}