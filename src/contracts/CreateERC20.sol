//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;
import "hardhat/console.sol";


contract ERC20Token {
    address public minter;

    mapping (address => uint) public balances;
    mapping (address => address) public whiteList;
    mapping (bytes => bool) private signatures;
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



    function transferFrom(address sender, address receiver, uint amount, bytes memory sig) external {
        bytes32 message = prefixed(keccak256(abi.encodePacked(receiver, amount, address(this))));
        require(recoverSigner(message, sig) == sender);
        transferBlock(sender, receiver, amount);
    }
    function prefixed(bytes32 hash) internal pure returns (bytes32) {
        return keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", hash)
        );
    }

    /*function getMessageHash(
        address receiver,
        uint amount,
        string memory _message,
        uint _nonce
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(_to, _amount, _message));
    }*/

    function splitSignature(bytes memory sig)
    internal
    pure
    returns (uint8, bytes32, bytes32)
    {
        require(sig.length == 65);

        bytes32 r;
        bytes32 s;
        uint8 v;

        assembly {
        // first 32 bytes, after the length prefix
            r := mload(add(sig, 32))
        // second 32 bytes
            s := mload(add(sig, 64))
        // final byte (first byte of the next 32 bytes)
            v := byte(0, mload(add(sig, 96)))
        }

        return (v, r, s);
    }

    function recoverSigner(bytes32 message, bytes memory sig)
    internal
    pure
    returns (address)
    {
        uint8 v;
        bytes32 r;
        bytes32 s;

        (v, r, s) = splitSignature(sig);

        return ecrecover(message, v, r, s);
    }
}

