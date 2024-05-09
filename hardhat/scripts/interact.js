require("@nomiclabs/hardhat-ethers");
const { ethers } = require("hardhat");

async function interact() {
    let users = await ethers.getSigners();
    let user = users[0];

    // replace this with local address
    let deployedCanvasAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
    let contract = await ethers.getContractAt("Canvas", deployedCanvasAddress);

    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
            // TODO: fix logic for getting the cell index from (i, j) coordinates
            let colour = await contract.connect(user).getNFTColour(i * 5 + j);
            console.log(`Color of pixel (${i}, ${j}) is ${colour}`);
        }
    }
}

async function createCanvasViaFactory() {
    let users = await ethers.getSigners();
    let user = users[0];

    // replace this with local address
    let deployedFactoryAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    let contract = await ethers.getContractAt("Factory", deployedFactoryAddress);

    let size = 5, royaltyPercent = 1;
    let initialTitle = "My Canvas", updatedTitle = "My Beautiful Canvas";

    contract.once("CanvasCreation", async (canvasAddress, size, title) => {
        console.log(`Canvas deployed at ${canvasAddress} with size ${size}, title ${title}`);

        await contract.connect(user).changeCanvasTitle(canvasAddress, updatedTitle, {
            gasLimit: 30000000
        });
    });

    contract.once("CanvasTitleChange", (canvasAddress, title) => {
        console.log(`Canvas deployed at ${canvasAddress} changed title to ${title}`);
    });

    await contract.connect(user).createCanvas(size, royaltyPercent, initialTitle, {
        gasLimit: 30000000
    });

    // wait 10s
    await new Promise(resolve => setTimeout(resolve, 10000));
}

createCanvasViaFactory()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
