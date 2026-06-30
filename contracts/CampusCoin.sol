// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CampusCoin {
    string public constant name = "CampusCoin";
    string public constant symbol = "CAMP";
    uint8 public constant decimals = 18;
    uint256 public constant totalSupply = 1_000_000 * 10 ** uint256(decimals);

    mapping(address => uint256) private balances;
    mapping(address => mapping(address => uint256)) private allowances;

    string public lastMessage;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Tested(address indexed by, string message);

    constructor() {
        balances[msg.sender] = totalSupply;
        emit Transfer(address(0), msg.sender, totalSupply);
    }

    function balanceOf(address account) external view returns (uint256) {
        return balances[account];
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    function allowance(address owner, address spender) external view returns (uint256) {
        return allowances[owner][spender];
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        require(spender != address(0), "Invalid spender");

        allowances[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        uint256 currentAllowance = allowances[from][msg.sender];
        require(currentAllowance >= amount, "Insufficient allowance");

        if (currentAllowance != type(uint256).max) {
            allowances[from][msg.sender] = currentAllowance - amount;
            emit Approval(from, msg.sender, allowances[from][msg.sender]);
        }

        _transfer(from, to, amount);
        return true;
    }

    function _transfer(address from, address to, uint256 amount) private {
        require(to != address(0), "Invalid recipient");
        require(balances[from] >= amount, "Insufficient balance");

        balances[from] -= amount;
        balances[to] += amount;
        emit Transfer(from, to, amount);
    }

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
