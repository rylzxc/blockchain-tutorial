const { assert, expect } = require("chai");
const { network, deployments, ethers } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

// Staging tests only run on testnets
developmentChains.includes(network.name) ? describe.skip :
describe("FundMe", async function () {

    let fundMe;
    let deployer;
    const sendValue = ethers.utils.parseEther("1") // 1 ETH
    // Deploy contract first then call the functions
    beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer;
        // Gets most recently deployed FundMe contract
        fundMe = await ethers.getContract("FundMe", deployer);
    });
})