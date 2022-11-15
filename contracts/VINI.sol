pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract VINI is ERC20 {
    constructor() ERC20("Vini", "VINI") {
        _mint(msg.sender, 10**6 * 10**18);
    }

    function mint(uint256 _amount) external {
         _mint(msg.sender, _amount);
    }
}