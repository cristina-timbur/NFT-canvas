const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("Setup", function () {
    let users, owner;
    before(async function () {
        users = await ethers.getSigners();
        owner = users[0];
    });

    let canvasContract;
    beforeEach(async function () {
        let size = 10, royaltyPercent = 1;
        let canvasFactory = await ethers.getContractFactory("Canvas");
        canvasContract = await canvasFactory.connect(owner).deploy(size, royaltyPercent);
        await canvasContract.deployed();
    });

    it("Should get the correct color of all cells", async function () {
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 5; j++) {
                // TODO: fix logic for getting the cell index from (i, j) coordinates
                let colour = await canvasContract.connect(users[0]).getNFTColour(i * 5 + j);
                expect(colour).to.have.members([0, 0, 0]);
            }
        }
    });

    it("Description", async function () {
        // TODO ...
    });
})