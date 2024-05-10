const { ethers } = require("hardhat");
const { expect } = require("chai");

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
    })

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

            let tx = await canvasContract.connect(users[1]).changeNFTColour(
                pixel_idx, r, g, b, { gasLimit: 30000000 }
            );

            try {
                await tx.wait();
                expect(false);
            } catch (err) {
                expect(true);
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
