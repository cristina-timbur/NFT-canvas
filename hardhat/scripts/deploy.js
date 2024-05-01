require("@nomiclabs/hardhat-ethers");
const { ethers } = require("hardhat");

async function deploy() {
    let users = await ethers.getSigners();
    let owner = users[0];

    console.log(`Number of users: ${users.length}`)
    console.log(`Owner: ${owner.address}`);

    let canvasFactory = await ethers.getContractFactory("Canvas");

    let size = 10, royaltyPercent = 1;
    let canvas = await canvasFactory.connect(owner).deploy(size, royaltyPercent);
    await canvas.deployed();

    console.log("Canvas address: ", canvas.address);
}

deploy()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
