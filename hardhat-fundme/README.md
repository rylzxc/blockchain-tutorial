# Hardhat FundMe Project

## Brief Overview

###
We first import the `FundMe.sol` and `PriceConverter.sol` from Remix into this project. Then we install the `@chainlink/contracts` library to link the libraries up.

To simplify deployment (we don't have the `deploy.js` script here), we install `hardhat-deploy` library. As we are using ethers, we then override the `@nomiclabs/hardhat-ethers` with `npm:hardhat-deploy-ethers` to make it more compatible for deployment. Therefore, all scripts written into the `deploy` folder will be run on calling the deploy task. We can tag each task with a set of tags such as `["all", "development"]`.

We then interact with our contract locally without deploying to a testnet for quicker development by **mocking** the hardhat network. The mock is run whenever a `developmentChain` is used for deployment. `Decimals` and `Initial Answer` are input parameters that can be found in the MockV3Aggregator.sol in our `artifaces/@chainlink/contracts/src/v0.6/tests`.

We modularized the smart contract code to take in any price feed address to be more flexible.

We also added a utils folder to store utility functions there like `verify()`. We then added `blockConfirmations` field to our network config to await for block confirmations to give Etherscan a chance to index our transaction.

We then create some test folders, `unit` (for local hardhat and forked hardhat) and `staging` (testnet -> last stop before deployment).

We also create scripts to test on the local hardhat node. We start the node by running `yarn hardhat node` then in another terminal, run the scripts.

---- Advanced Ideas ----
Storage in Solidity: Storage is a huge array that stores in chronologically declared order, the global variables. Variables within a function lives throughout the function only and will not be stored in that array. For globally declared arrays, the length of the array is stored when it is declared and the content of the array is hash-mapped to some area of the storage array. Constants & immutables are not stored in array as it is already a pointer to that value. Reading and writing to storage takes a ton of gas. Gas cost depends on the [opcodes](https://ethereum.org/en/developers/docs/evm/opcodes/) executed within elements of the storage array. Append `s_` to variables stored to storage, as best practice to find areas of huge gas usage as saving and loading from storage takes a ton of gas. We can use `memory` instead, especially if there is a for-loop for arrays.