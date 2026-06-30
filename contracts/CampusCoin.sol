// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CampusCoin {
    string public lastMessage;

    event Tested(address indexed by, string message);

    function ping() external returns (string memory) {
        lastMessage = "CampusCoin test ok";
        emit Tested(msg.sender, lastMessage);
        return lastMessage;
    }

    function setMessage(string calldata message) external {
        lastMessage = message;
        emit Tested(msg.sender, lastMessage);
    }

    function getMessage() external view returns (string memory) {
        return lastMessage;
    }
}
