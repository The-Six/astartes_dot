import { BrowserProvider } from "ethers";

let provider;

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
