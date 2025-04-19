import { BrowserProvider, Contract } from "ethers";
import AstartesLogAbi from "../../contracts/AstartesLog.json";

let provider;
let contract;
let signer;

/**
 * Connect to the blockchain using Ethers.js and a browser wallet (e.g., MetaMask).
 */
export const connectToBlockchain = async () => {
  try {
    // Check if a wallet is installed
    if (typeof window.ethereum === "undefined") {
      console.error("No Ethereum wallet installed. Please install MetaMask.");
      return null;
    }

    console.log("An Ethereum wallet is installed!");

    // Initialize the provider using the browser wallet
    provider = new BrowserProvider(window.ethereum);

    // Request the user to connect their wallet
    await provider.send("eth_requestAccounts", []);
    console.log("Wallet connected!");

    return provider;
  } catch (error) {
    console.error("Error connecting to blockchain:", error);
    throw error;
  }
};

/**
 * Initialize the smart contract using Ethers.js.
 * @param {Object} provider - The Ethers.js provider instance.
 */
export const initializeContract = (provider) => {
  try {
    const contractAddress = "0x9873e9d72f6b31A92a9DB9C723B5589ca4D714a2"; // Replace with your deployed contract address
    console.log("Initializing contract...");
    console.log("ABI:", AstartesLogAbi.abi); // Log the extracted ABI
    console.log("Contract Address:", contractAddress);

    // Get the signer from the provider and cache it
    signer = provider.getSigner();

    // Initialize the contract with the signer
    contract = new Contract(contractAddress, AstartesLogAbi.abi, signer);
    console.log("Smart contract initialized with signer:", contract);

    return contract;
  } catch (error) {
    console.error("Error initializing contract:", error);
    throw error;
  }
};

/**
 * Store a log hash on the blockchain.
 * @param {string} log - The log to hash and store.
 */
export const storeLogHash = async (log) => {
  if (!provider) {
    throw new Error("Provider not initialized");
  }

  console.log(`Storing log on-chain via smart contract: ${log}`);

  try {
    // Hash the log to produce a 32-byte value
    // const hash = keccak256(toUtf8Bytes(log));
    const hash = log;
    console.log("Hashed log:", hash);

    // Reinitialize the contract with a fresh signer
    const signer = await provider.getSigner();
    console.log("Signer retrieved:", signer);

    const contractAddress = "0x9873e9d72f6b31A92a9DB9C723B5589ca4D714a2"; // Replace with your deployed contract address
    const contractWithSigner = new Contract(
      contractAddress,
      AstartesLogAbi.abi,
      signer
    );
    console.log("Contract reinitialized with signer:", contractWithSigner);

    // Call the `submitHash` function on the contract
    const tx = await contractWithSigner.submitHash(hash);
    console.log("Transaction sent:", tx.hash);

    // Wait for the transaction to be mined
    const receipt = await tx.wait();
    console.log("Transaction mined:", receipt);

    return receipt;
  } catch (error) {
    console.error("Error storing log hash:", error);
    throw error;
  }
};
