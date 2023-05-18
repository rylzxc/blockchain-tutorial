// Custom hardhat task definition
const { task } = require("hardhat/config");

task("block-number", "Prints the current block number").setAction(
    // hre is hardhat runtime environment, and can access components as how we do when we require("hardhat")
    async (taskArgs, hre) => {
        const blockNumber = await hre.ethers.provider.getBlockNumber();
        console.log(`Current block number: ${blockNumber}`);
    }
)