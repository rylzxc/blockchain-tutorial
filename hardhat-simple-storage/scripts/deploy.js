// 1. We grab the ethers component from hardhat dependency package (hardhat-ethers)
// 2a. run allows running of any hardhat commands - such as hardhat verify etc
const { ethers, run, network } = require("hardhat");


async function main() {
    const SimpleStorageFactory = await ethers.getContractFactory("SimpleStorage");
    console.log("Deploying contract...");
    const simpleStorage = await SimpleStorageFactory.deploy()
    // Hardhat deploys the contract through its Hardhat network (similar to ganache) which comes with rpc url & private key 
    await simpleStorage.deployed()
    console.log(`Deployed contract to: ${simpleStorage.address}`)
    // 3. We only want to verify on the sepolia (as of now) testnet, as hardhat network doesn't have etherscan
    //    === will check types also -> 4 !== "4" but 4 == "4"
    if (network.config.chainId === 11155111 && process.env.ETHERSCAN_API_KEY) {
      // 3a. Wait for contract to finish deploying first then verify
      await simpleStorage.deployTransaction.wait(6);
      await verify(simpleStorage.address, []);
    }

    // 4. Interact with the contract after deploying
    const currentValue = await simpleStorage.retrieve();
    console.log(`Current value is: ${currentValue}`);
    const transactionResponse = await simpleStorage.store(7);
    await transactionResponse.wait(1);
    const updatedValue = await simpleStorage.retrieve();
    console.log(`Updated value is: ${updatedValue}`);
}

// 2. Verify the contract using Etherscan API as this is Ethereum based chain
async function verify(contractAddress, args) {
  console.log("Verifying contract...");
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    })
  } catch (e) {
    if (e.msg.toLowerCase().includes("already verified")) {
      console.log("Already verified!");
    } else {
      console.log(e);
    }
  }
}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
})