const { network } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");

const BASE_FEE = "250000000000000000";
const GAS_PRICE_LINK = 1e9; // Calculated value based on the gas price of the actual chain (if eth skyrockets, gas price skyrockets as well and this sets gas fee for using chainlink)

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const args = [ BASE_FEE, GAS_PRICE_LINK ];

    if (developmentChains.includes(network.name)) {
        log("Local network detected, deploying...");
        await deploy("VRFCoordinatorV2Mock", {
            from: deployer,
            log: true,
            args: args,
        });
        log("Mock deployed!");
    }
}

module.exports.tags = ["all", "mocks"];