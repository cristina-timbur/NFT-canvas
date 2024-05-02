require("@nomiclabs/hardhat-ethers");
const { ethers } = require("hardhat");
const path = require("path");

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

    saveFrontendFiles();
}

function saveFrontendFiles() {
    const fs = require("fs");
    const contractsDir = path.join(__dirname, "..", "..", "frontend", "src");
  
    if (!fs.existsSync(contractsDir)) {
      fs.mkdirSync(contractsDir);
    }
  
    const TokenArtifact = artifacts.readArtifactSync("Canvas");
  
    fs.writeFileSync(
      path.join(contractsDir, "Canvas.json"),
      JSON.stringify(TokenArtifact, null, 2)
    );
  }

deploy()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
