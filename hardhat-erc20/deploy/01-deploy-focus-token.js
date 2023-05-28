const { network, ethers } = require("hardhat");
const { verify } = require("../utils/verify");

const INITIAL_SUPPLY = ethers.utils.parseEther("1") // 1 Ether, or 1e18 (10^18) Wei

module.exports = async function ({ getNamedAccounts, deployments }) {

    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    const args = [INITIAL_SUPPLY]
    const focusToken = await deploy("FocusToken", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    if (process.env.ETHERSCAN_API_KEY) {
        log("Verifying...");
        await verify(focusToken.address, args);
    }
}

module.exports.tags = ["all", "focustoken"];
