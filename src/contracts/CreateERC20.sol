//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;


contract ERC20Token {
    address public minter;

    mapping (address => uint) public balances;
    constructor() {
        minter = msg.sender;
    }
    function mint(address receiver) public payable {
        require(msg.value != 0);
        require(msg.sender == minter);
        uint amount = msg.value;
        balances[receiver] = amount;
    }
    function burn(address payable receiver) external {
        require(balances[receiver] != 0);
        //uint amount = balances[receiver];
        receiver.transfer(100);
    }
}

/*
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC20Token is ERC20 {
    constructor(string memory name, string memory symbol, uint256 initialSupply) ERC20(name, symbol) {
        _mint(msg.sender, initialSupply);
    }
}*/
