const { ethers } = require("hardhat");

async function main() {
    const MyNFT = await ethers.getContractFactory("Canvas");

    const size = 10, royaltyPercent = 1;

    const myNFT = await MyNFT.deploy(size, royaltyPercent);
    await myNFT.deployed();

    console.log("Contract deployed to address:", myNFT.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })