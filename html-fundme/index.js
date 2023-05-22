import { ethers } from "./ethers-5.1.esm.min.js"
import { abi, contractAddress } from "./constants.js"

const connectButton = document.getElementById("connectButton");
connectButton.onclick = connect;
const fundButton = document.getElementById("fundButton");
fundButton.onclick = fund;
const balanceButton = document.getElementById("balanceButton");
balanceButton.onclick = getBalance;
const withdrawButton = document.getElementById("withdrawButton");
withdrawButton.onclick = withdraw;

async function connect() {
    if (typeof window.ethereum !== "undefined") {
        try {
        await ethereum.request({ method: "eth_requestAccounts" })
        } catch (error) {
        console.log(error)
        }
        connectButton.innerHTML = "Connected"
        const accounts = await ethereum.request({ method: "eth_accounts" })
        console.log(accounts)
    } else {
        connectButton.innerHTML = "Please install MetaMask"
    }
}

async function fund() {
    const ethAmount = document.getElementById("ethAmount").value
    console.log(`Funding with ${ethAmount}... `);
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);
        try {
            const transactionResponse = await contract.fund(
                {value: ethers.utils.parseEther(ethAmount)}
            );

            await listenForTransactionMine(transactionResponse, provider);
        } catch(error) {
            console.log(error)
        }
        
    }
}

async function getBalance() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const balance = await provider.getBalance(contractAddress);
        console.log(ethers.utils.formatEther(balance));
    }
}

async function withdraw() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);
        try {
            const transactionResponse = await contract.withdraw();

            await listenForTransactionMine(transactionResponse, provider);
        } catch(error) {
            console.log(error)
        }
    }
}

function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}...`);
    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            console.log(`Completed with ${transactionReceipt.confirmations} confirmations`);
            resolve();
        });
    })
}