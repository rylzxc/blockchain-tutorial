# Ethers Simple Storage

## Brief overview

### 
This section provides an introduction to creating, deploying and interacting with smart contracts. We bring the knowledge and ideas learnt from `Remix` to our favourite IDE.

Furthermore, we learnt how to encrypt our wallet's private keys in `encrypt.js` to prevent hackers from gaining access that simply to it. The private keys are retrieved from `Ganache`, which deploys a local blockchain on our system.

In `deploy.js`, we will find the steps went through to create, deploy and interact with the smart contracts, in chronological order. Each step provides further explanation whenever necessary, for learning purposes. 

For e.g. `Step 3b` commented out is how the contract is deployed as a transaction which takes in those fields. This is essentially the raw data passed to a transaction.

Lastly, we get the RPC URL from our app created for deployment on the Sepolia Testnet from Alchemy, our Metamask private key and we deploy this smart contract onto the testnet chain! (**Remember to encrypt the new key!**)