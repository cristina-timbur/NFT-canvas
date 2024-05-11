const { ethers } = require("hardhat");
const { expect } = require("chai");
const assert = require("assert");

const SIZE = 5;
const ROYALTY_PERCENT = 10;
const TITLE = "Beautiful Canvas";
const SAMPLES = 3;

/*
    Constructs a new canvas. Tests that the owner can color the pixels
    and retrieve the correct color, while a non-owner may only read the pixels.
*/
describe("Coloring", function () {
    let users, owner;
    before(async function () {
        users = await ethers.getSigners();
        owner = users[0];
    });

    let canvasContract;
    beforeEach(async function () {
        let canvasFactory = await ethers.getContractFactory("Canvas");
        canvasContract = await canvasFactory.connect(owner).deploy(
            SIZE,
            ROYALTY_PERCENT,
            TITLE
        );
        await canvasContract.deployed();
    });

    it("Owner can write and read the color of all pixels", async function () {
        for (let sample = 0; sample < SAMPLES; sample++) {
            let i = Math.floor(Math.random() * SIZE);
            let j = Math.floor(Math.random() * SIZE);

            let pixel_idx = i * SIZE + j;
            let r = Math.floor(Math.random() * 256),
                g = Math.floor(Math.random() * 256),
                b = Math.floor(Math.random() * 256);

            let tx = await canvasContract.connect(owner).changeNFTColour(
                pixel_idx, r, g, b, { gasLimit: 30000000 }
            );
            await tx.wait();

            let colour = await canvasContract.connect(owner).getNFTColour(pixel_idx);
            expect(colour).to.have.members([r, g, b]);
        }
    }).timeout(1000000);

    it("Non-owner cannot write the color of any pixel", async function () {
        for (let sample = 0; sample < SAMPLES; sample++) {
            let i = Math.floor(Math.random() * SIZE);
            let j = Math.floor(Math.random() * SIZE);

            let pixel_idx = i * SIZE + j;
            let r = Math.floor(Math.random() * 256),
                g = Math.floor(Math.random() * 256),
                b = Math.floor(Math.random() * 256);

            let tx = canvasContract.connect(users[1]).changeNFTColour(
                pixel_idx, r, g, b, { gasLimit: 30000000 }
            );

            try {
                await tx.wait();
                assert.fail("Non-owner cannot change color");
            } catch (err) {
                assert.equal(true, true);
            }
        }
    }).timeout(1000000);

    it("Non-owner can read the color of all pixels", async function () {
        for (let sample = 0; sample < SAMPLES; sample++) {
            let i = Math.floor(Math.random() * SIZE);
            let j = Math.floor(Math.random() * SIZE);

            let pixel_idx = i * SIZE + j;
            let colour = await canvasContract.connect(users[1]).getNFTColour(pixel_idx);
            expect(colour).to.have.members([0, 0, 0]);
        }
    }).timeout(1000000);
})

/*
    Constructs a new canvas. Tests that the owner can attempt to sell a pixel
    and revert that decision, while a non-owner cannot.
*/
describe("Selling", function () {
    let users, owner;
    before(async function () {
        users = await ethers.getSigners();
        owner = users[0];
    });

    let canvasContract;
    beforeEach(async function () {
        let canvasFactory = await ethers.getContractFactory("Canvas");
        canvasContract = await canvasFactory.connect(owner).deploy(
            SIZE,
            ROYALTY_PERCENT,
            TITLE
        );
        await canvasContract.deployed();
    });

    it("Owner can sell and revertSell all pixels", async function () {
        for (let sample = 0; sample < SAMPLES; sample++) {
            let i = Math.floor(Math.random() * SIZE);
            let j = Math.floor(Math.random() * SIZE);

            let pixel_idx = i * SIZE + j;
            let price = Math.floor(Math.random() * 100);

            let tx = await canvasContract.connect(owner).sell(
                pixel_idx, price
            );
            await tx.wait();

            let availableForSell = await canvasContract.getIsAvailableForSell(
                pixel_idx, { gasLimit: 30000000 }
            );
            expect(availableForSell).to.be.true;

            tx = await canvasContract.connect(owner).revertSell(pixel_idx);
            await tx.wait();

            availableForSell = await canvasContract.getIsAvailableForSell(
                pixel_idx, { gasLimit: 30000000 }
            );
            expect(availableForSell).to.be.false;
        }
    }).timeout(1000000);

    it("Non-owner cannot sell or revertSell any pixel", async function () {
        for (let sample = 0; sample < SAMPLES; sample++) {
            let i = Math.floor(Math.random() * SIZE);
            let j = Math.floor(Math.random() * SIZE);

            let pixel_idx = i * SIZE + j;
            let price = Math.floor(Math.random() * 100);

            let tx = await canvasContract.connect(users[1]).sell(
                pixel_idx, price, { gasLimit: 30000000 }
            );

            try {
                await tx.wait();
                assert.fail("Non-owner cannot sell");
            } catch (err) {
                assert.equal(true, true);
            }

            tx = await canvasContract.connect(users[1]).revertSell(
                pixel_idx, { gasLimit: 30000000 }
            );

            try {
                await tx.wait();
                assert.fail("Non-owner cannot revert-sell");
            } catch (err) {
                assert.equal(true, true);
            }
        }
    }).timeout(1000000);
})

/*
    Constructs a new canvas. Tests that the owner can attempt to sell a pixel
    and a non-owner can buy that pixel.
*/
describe("Buying", function () {
    let users, owner;
    before(async function () {
        users = await ethers.getSigners();
        owner = users[0];
    });

    let canvasContract;
    beforeEach(async function () {
        let canvasFactory = await ethers.getContractFactory("Canvas");
        canvasContract = await canvasFactory.connect(owner).deploy(
            SIZE,
            ROYALTY_PERCENT,
            TITLE
        );
        await canvasContract.deployed();
    });

    it("Non-owner can buy pixels offered for sale", async function () {
        for (let sample = 0; sample < SAMPLES; sample++) {
            let i = Math.floor(Math.random() * SIZE);
            let j = Math.floor(Math.random() * SIZE);

            let pixel_idx = i * SIZE + j;
            let price = Math.floor(Math.random() * 100);

            // owner wants to sell this pixel
            let tx = await canvasContract.connect(owner).sell(
                pixel_idx, price
            );
            await tx.wait();

            let availableForSell = await canvasContract.getIsAvailableForSell(
                pixel_idx, { gasLimit: 30000000 }
            );
            expect(availableForSell).to.be.true;

            tx = await canvasContract.connect(users[1]).buy(
                pixel_idx, { gasLimit: 30000000, value: price * 2 }
            );
            try {
                await tx.wait();
                assert.equal(true, true);
            } catch (err) {
                assert.fail("Non-owner should buy the pixel");
            }

            // owner tries to sell the pixel again - expected to fail
            tx = await canvasContract.connect(owner).sell(
                pixel_idx, price, { gasLimit: 30000000 }
            );

            try {
                await tx.wait();
                assert.fail("Owner cannot sell the same pixel twice");
            } catch (err) {
                assert.equal(true, true);
            }
        }
    }).timeout(1000000);

    it("Transaction fails if insufficient funds", async function () {
        for (let sample = 0; sample < SAMPLES; sample++) {
            let i = Math.floor(Math.random() * SIZE);
            let j = Math.floor(Math.random() * SIZE);

            let pixel_idx = i * SIZE + j;
            let price = Math.floor(Math.random() * 100);

            // owner wants to sell this pixel
            let tx = await canvasContract.connect(owner).sell(
                pixel_idx, price
            );
            await tx.wait();

            let availableForSell = await canvasContract.getIsAvailableForSell(
                pixel_idx, { gasLimit: 30000000 }
            );
            expect(availableForSell).to.be.true;

            tx = await canvasContract.connect(users[1]).buy(
                pixel_idx, { gasLimit: 30000000, value: Math.floor(price / 2) }
            );
            try {
                await tx.wait();
                assert.fail("Non-owner has insufficient funds");
            } catch (err) {
                assert.equal(true, true);
            }
        }
    }).timeout(1000000);
})

/*
    Constructs a new factory. Tests that an user can create a new canvas
    via the factory method and the expected CanvasCreation event is emitted.
*/
describe("Factory pattern", function () {
    let users, owner;
    before(async function () {
        users = await ethers.getSigners();
        owner = users[0];
    });

    let factoryContract;
    beforeEach(async function () {
        let contractFactory = await ethers.getContractFactory("Factory");
        factoryContract = await contractFactory.connect(owner).deploy();
        await factoryContract.deployed();
    });

    it("User can create a new canvas via factory", async function () {
        await expect(factoryContract.connect(owner).createCanvas(
            SIZE, ROYALTY_PERCENT, TITLE
        )).to.emit(factoryContract, "CanvasCreation");
    });
});

/*
    Constructs a new factory. Tests that an owner can change the title of
    his canvas via the factory method, while a non-owner cannot.
*/
describe("Canvas title change", function () {
    let users, owner;
    before(async function () {
        users = await ethers.getSigners();
        owner = users[0];
    });

    let factoryContract;
    beforeEach(async function () {
        let contractFactory = await ethers.getContractFactory("Factory");
        factoryContract = await contractFactory.connect(owner).deploy();
        await factoryContract.deployed();
    });

    it("Owner can change the title of the canvas", async function () {
        let seenCreationEvent = false;
        let seenChangeTitleEvent = false;

        factoryContract.once("CanvasCreation", async (address, _size, _title) => {
            seenCreationEvent = true;
            for (let i = 0; i < 5; i++) {
                await factoryContract.connect(owner).changeCanvasTitle(
                    address, "UpdatedTitle", { gasLimit: 30000000 }
                );
            }
        });

        factoryContract.once("CanvasTitleChange", (_address, _title) => {
            seenChangeTitleEvent = true;
        })

        for (let i = 0; i < 5; i++) {
            await factoryContract.connect(owner).createCanvas(
                SIZE, ROYALTY_PERCENT, TITLE, { gasLimit: 30000000 }
            );
        }

        // wait 30s
        await new Promise(resolve => setTimeout(resolve, 30000));
        expect(seenCreationEvent).to.be.true;
        expect(seenChangeTitleEvent).to.be.true;
    });

    it("Non-owner cannot change the title of the canvas", async function () {
        let seenCreationEvent = false;
        let seenChangeTitleEvent = false;

        factoryContract.on("CanvasCreation", async (address, _size, _title) => {
            seenCreationEvent = true;
            for (let i = 0; i < 5; i++) {
                await factoryContract.connect(users[1]).changeCanvasTitle(
                    address, "UpdatedTitle", { gasLimit: 30000000 }
                );
            }
        });

        factoryContract.once("CanvasTitleChange", (_address, _title) => {
            seenChangeTitleEvent = true;
        })

        for (let i = 0; i < 5; i++) {
            await factoryContract.connect(owner).createCanvas(
                SIZE, ROYALTY_PERCENT, TITLE, { gasLimit: 30000000 }
            );
        }

        // wait 30s
        await new Promise(resolve => setTimeout(resolve, 30000));
        expect(seenCreationEvent).to.be.true;
        expect(seenChangeTitleEvent).to.be.false;
    });
});
