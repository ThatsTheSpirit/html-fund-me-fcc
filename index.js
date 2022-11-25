import { ethers } from "./ethers-5.1.esm.min.js";
import { abi, contractAddress } from "./constants.js";

const connectBtn = document.getElementById("connectBtn");
const fundBtn = document.getElementById("fundBtn");
const balanceBtn = document.getElementById("balanceBtn");
const withdrawBtn = document.getElementById("withdrawBtn");

connectBtn.onclick = connect;
fundBtn.onclick = fund;
balanceBtn.onclick = getBalance;
withdrawBtn.onclick = withdraw;

async function connect() {
    if (typeof window.ethereum !== "undefined") {
        await window.ethereum.request({
            method: "eth_requestAccounts",
        });
        console.log("connected");
        connectBtn.innerHTML = "Connected";
    } else {
        console.log("No metamask");
        connectBtn.innerHTML = "Please install Metamask!";
    }
}

//fund
async function fund(ethAmount) {
    ethAmount = document.getElementById("ethAmount").value;
    console.log(`Funding with ${ethAmount}...`);
    if (typeof window.ethereum !== "undefined") {
        //provider / connection to the blockchain
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        //signer / wallet /someone with some gas
        const signer = provider.getSigner();
        //contract that we are interacting with
        //ABI & address
        const contract = new ethers.Contract(contractAddress, abi, signer);
        try {
            const txResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            });
            await listenForTransactionMined(txResponse, provider);
        } catch (error) {
            console.log(error);
        }
        //await txResponse.wait(1);
    }
}

function listenForTransactionMined(txResponse, provider) {
    console.log(`Minig ${txResponse.hash}...`);
    return new Promise((resolve, reject) => {
        provider.once(txResponse.hash, (txReceipt) => {
            console.log(
                `Completed with ${txReceipt.confirmations} confirmations`
            );
        });
        resolve();
    });
}

async function getBalance() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const balance = await provider.getBalance(contractAddress);
        console.log(ethers.utils.formatEther(balance));
    }
}

//withdraw
async function withdraw() {
    if (typeof window.ethereum !== "undefined") {
        console.log("Withdrawing...");
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);
        try {
            const txResponse = await contract.withdraw();
            await listenForTransactionMined(txResponse, provider);
        } catch (error) {
            console.log(error);
        }
    }
}
