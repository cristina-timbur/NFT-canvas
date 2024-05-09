// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./Canvas.sol";

contract Factory {
    event CanvasCreation(address indexed canvasAddress, uint8 size, string title);
    event CanvasTitleChange(address indexed canvasAddress, string title);

    mapping(address => bool) isCanvas;
    mapping(address => address) owner;

    modifier onlyCanvasOwner(address canvasAddress) {
        require(isCanvas[canvasAddress], "Canvas does not exist");
        require(owner[canvasAddress] == msg.sender, "Only the canvas initial owner can change the title");
        _;
    }

    function createCanvas(uint8 size, uint256 royaltyPercent, string memory title) public {
        Canvas canvas = new Canvas(size, royaltyPercent, title);

        isCanvas[address(canvas)] = true;
        owner[address(canvas)] = msg.sender;

        emit CanvasCreation(address(canvas), size, title);
    }
    
    function changeCanvasTitle(address canvasAddress, string memory title) onlyCanvasOwner(canvasAddress) public {
        (bool success, ) = canvasAddress.call(abi.encodeWithSignature("changeTitle(string)", title));
        require(success, "Call failed");

        emit CanvasTitleChange(canvasAddress, title);
    }
}
