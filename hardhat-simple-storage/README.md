# Hardhat Simple Storage

## Brief Overview

###
We first installed the hardhat module and initialized a basic project. Then, we imported our previous `ethers-simple-storage` into this project as hardhat also provides the `ethers` component. We then learnt to verify the deployed contract with our Etherscan's API key (as it's an Ethereum based chain) with the `run` and `network` components. `run` to run any hardhat tasks and `network` to ensure Sepolia testnet (for our case) is chosen. Then, we interact with the contract with the basic functions we defined in `SimpleStorage.sol`.

We can also utilize the powerful hardhat console to directly run commands within our `deploy.js` to save time on testing and/or debugging. To do this, we first initialize the console with `yarn hardhat console --network localhost` (the localhost node **must** be running first if we choose localhost network), then we can feed it commands like `const SimpleStorageFactory = await ethers.getContractFactory("SimpleStorage");`, so on and so forth.

We can run `yarn hardhat clean` to delete artifacts folder and clear cache.

We also create a new test script to help verify that our smart contract runs correctly. We can install `hardhat-gas-reporter` to estimate how much gas each function costs. We save it into `gas-report.txt` for easy reference. 

Furthermore, we can improve our solidity test coverage with a hardhat plugin to check number LoC covered, by installing `solidity-coverage`.
