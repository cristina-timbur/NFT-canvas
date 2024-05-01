require("@nomiclabs/hardhat-ethers");
const { ethers } = require("hardhat");

async function interact() {
    let users = await ethers.getSigners();
    let user = users[0];

    // replace this with local address
    let deployedCanvasAddress = "0x9fe46736679d2d9a65f0992f2272de9f3c7fa6e0";
    let contract = await ethers.getContractAt("Canvas", deployedCanvasAddress);

    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
            // TODO: fix logic for getting the cell index from (i, j) coordinates
            let colour = await contract.connect(user).getNFTColour(i * 5 + j);
            console.log(`Color of pixel (${i}, ${j}) is ${colour}`);
        }
    }
}

interact()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
