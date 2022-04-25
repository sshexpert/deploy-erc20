//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;


contract ERC20Token {
    address public minter;

    mapping (address => uint) public balances;
    mapping (address => address) public whiteList;
    uint public totalSupply;

    constructor() {
        minter = msg.sender;
    }
    function mint() external payable {
        require(msg.value != 0);
        uint amount = msg.value;
        balances[msg.sender] += amount;
        totalSupply += amount;
    }
    function burn(address payable receiver) external {
        uint amount = balances[receiver];
        receiver.transfer(amount);
        balances[receiver] -= amount;
        totalSupply -= amount;
    }

    function transferBlock (address sender, address receiver, uint amount) public {
        require(amount <= balances[sender]);
        balances[sender] -= amount;
        balances[receiver] += amount;
    }

    function transfer(address receiver, uint amount) external {
        transferBlock(msg.sender, receiver, amount);
    }
    function transferFrom(address sender, address receiver, uint amount) external  {
        require(whiteList[sender] == msg.sender);
        transferBlock(sender, receiver, amount);
    }
    function approve (address whiteAddress) external {
        whiteList[msg.sender] = whiteAddress;
    }
}

/*
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC20Token is ERC20 {
    constructor(string memory name, string memory symbol, uint256 initialSupply) ERC20(name, symbol) {
        _mint(msg.sender, initialSupply);
    }
}*/
