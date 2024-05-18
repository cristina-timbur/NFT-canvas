require("@nomiclabs/hardhat-ethers");
const { ethers } = require("hardhat");
const path = require("path");

function saveFrontendFiles(artifact) {
    const fs = require("fs");
    const contractsDir = path.join(__dirname, "..", "..", "frontend", "src", "hooks");

    if (!fs.existsSync(contractsDir)) {
        fs.mkdirSync(contractsDir);
    }

    const TokenArtifact = artifacts.readArtifactSync(artifact);

    fs.writeFileSync(
        path.join(contractsDir, `${artifact}.json`),
        JSON.stringify(TokenArtifact, null, 2)
    );
}


const canvases = [
    {
        size: 3,
        title: "Blank",
        royalty: 10,
        initial_owner: 0
    },
    {
        size: 7,
        title: 'Smile',
        royalty: 10,
        initial_owner: 0,
        values: [
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 1, 0, 1, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 1, 0, 0, 0, 1, 0],
            [0, 0, 1, 1, 1, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
        ],
        owner: [
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
        ],
        colors: [
            [0, 0, 0], [255, 255, 255]
        ]
    },
    {
        size: 5,
        title: 'Chessboard',
        royalty: 10,
        initial_owner: 1,
        values: [
            [0, 1, 0, 1, 0],
            [1, 0, 1, 0, 1],
            [0, 1, 0, 1, 0],
            [1, 0, 1, 0, 1],
            [0, 1, 0, 1, 0],
        ],
        owner: [
            [1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1],
        ],
        colors: [
            [0, 0, 255], [150, 75, 0]
        ]
    },
    {
        size: 5,
        title: 'Diagonal',
        royalty: 10,
        initial_owner: 1,
        values: [
            [1, 0, 0, 0, 0],
            [1, 1, 0, 0, 0],
            [1, 1, 1, 0, 0],
            [1, 1, 1, 1, 0],
            [1, 1, 1, 1, 1],
        ],
        owner: [
            [1, 0, 0, 0, 0],
            [1, 1, 0, 0, 0],
            [1, 1, 1, 0, 0],
            [1, 1, 1, 1, 0],
            [1, 1, 1, 1, 1],
        ],
        colors: [
            [0, 255, 0], [0, 0, 255]
        ]
    }
]


async function populate() {
    // Get users
    let users = await ethers.getSigners();

    // Save abi for frontend consumption
    saveFrontendFiles("Factory");
    saveFrontendFiles("Canvas");

    // Deploy factory
    let factoryFactory = await ethers.getContractFactory("Factory");

    let factoryContract = await factoryFactory.deploy();
    await factoryContract.deployed();

    console.log("Factory address: ", factoryContract.address);

    let canvasAdresses = [];
    factoryContract.on("CanvasCreation", (canvasAddress_, size, title) => {
        canvasAdresses.push(canvasAddress_);
        console.log(`Canvas address: ${canvasAddress_}, size ${size}, title ${title}`);
    });

    for (let i = 0; i < 4; i++) {
        let initial_owner = users[canvases[i].initial_owner],
            size = canvases[i].size,
            royalty = canvases[i].royalty,
            title = canvases[i].title;

        let tx = await factoryContract.connect(initial_owner).createCanvas(size, royalty, title, {
            gasLimit: 30000000
        });
        await tx.wait();
    }

    // wait 15s so as to collect all events
    await new Promise(resolve => setTimeout(resolve, 15000));


    // Create 3 canvases by 2 users:
    //  - "Smile" - all pixels owned by user 0
    //  - "Chessboard" - all pixels owned by user 1
    //  - "Diagonal" - half owned by user 0, half owned by user 1

    for (let i = 1; i < 4; i++) {
        let size = canvases[i].size;
        let initial_owner = users[canvases[i].initial_owner];

        let canvasContract = await ethers.getContractAt("Canvas", canvasAdresses[i - 1]);

        for (let x = 0; x < size; x++) {
            for (let y = 0; y < size; y++) {
                let pixel_owner = users[canvases[i].owner[x][y]];
                let pixel_idx = x * size + y;
                let colors = canvases[i].colors[canvases[i].values[x][y]];

                if (pixel_owner != initial_owner) {
                    let tx = await canvasContract.connect(initial_owner).sell(
                        pixel_idx, 0, { gasLimit: 30000000 }
                    );
                    await tx.wait();

                    tx = await canvasContract.connect(pixel_owner).buy(
                        pixel_idx, { value: 1, gasLimit: 30000000 }
                    );
                    await tx.wait();

                    console.log(`Transferred pixel ${x},${y} from ${initial_owner.address} to ${pixel_owner.address}`)
                }

                let tx = await canvasContract.connect(pixel_owner).changeNFTColour(
                    pixel_idx, colors[0], colors[1], colors[2], { gasLimit: 30000000 }
                );
                await tx.wait();

                console.log(`Coloured pixel ${x},${y} of canvas ${i}`)
            }
        }
    }
}

populate()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
