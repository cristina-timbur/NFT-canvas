require("@nomiclabs/hardhat-ethers");
const { ethers } = require("hardhat");
const path = require("path");

async function deploy() {
    let users = await ethers.getSigners();
    let owner = users[0];

    console.log(`Number of users: ${users.length}`)
    console.log(`Owner: ${owner.address}`);

    let factoryFactory = await ethers.getContractFactory("Factory");

    let factory = await factoryFactory.deploy();
    await factory.deployed();

    console.log("Factory address: ", factory.address);

    saveFrontendFiles();
}

function saveFrontendFiles() {
    const fs = require("fs");
    const contractsDir = path.join(__dirname, "..", "..", "frontend", "src", "hooks");
  
    if (!fs.existsSync(contractsDir)) {
      fs.mkdirSync(contractsDir);
    }
  
    const TokenArtifact = artifacts.readArtifactSync("Factory");
  
    fs.writeFileSync(
      path.join(contractsDir, "Factory.json"),
      JSON.stringify(TokenArtifact, null, 2)
    );
  }

deploy()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
