// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract FocusToken is ERC20 {

    constructor(uint256 initialSupply) ERC20("FocusToken", "FCT") {
        _mint(msg.sender, initialSupply);
    }

}