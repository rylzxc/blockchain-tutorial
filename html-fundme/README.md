# HTML FundMe

## Brief Overview

###
We will create a bare-boned Web3 application with HTML to explore what goes on behind the scenes when we execute functions in the browser. The HTML page will consist of buttons to withdraw, fund, connect and get balance. Connecting with Metamask wallet can be done with the `Web3Provider` module which helps plug in the RPC endpoint from our Metamask account to make us the provider.

We also make use of the `<script>` tags to write Javascript code. Within the `index.js` script, we write the function definitions for functions to be called on button clicks. Communicating with our FundMe smart contracts require its ABI and address of deployment. We thus run a local hardhat blockchain first and get the address where it's deployed. Its ABI is retrieved from `artifacts` folder within the FundMe project. We then listen to check if our transaction has completed, making use of `Promise` which delays the execution of the function till it's resolved.


Notes:

1. `document.getElementById("connectButton").innerHTML` tells us what to display if the condition is met/unmet.
2. Using `type="module"` allows importing modules (in our case, ethers) into our code.
3. We import the ethers library as a [best practice and for security reasons](https://docs.ethers.org/v5/getting-started/#getting-started--importing--web-browser).
4. We shift the `onClick` functions to `index.js` due to us using modules for script type (point 2).
5. If encounter nonce error, reset account (to reset the nonce) then retry again as Metamask wouldn't know if we restarted the local blockchain or not. Restarting the local blockchain restarts its nonce too.
6. If nothing to add between tags, just end it with a slash -> `<input .../>` == `<input></input>`.
