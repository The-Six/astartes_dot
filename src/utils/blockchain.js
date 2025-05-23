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
export const storeLogHash = async (hash) => {
  if (!provider) {
    throw new Error("Provider not initialized");
  }

  console.log(`Storing log on-chain via smart contract: ${hash}`);

  try {
    // console.log("Hash Ready To Send:", hash);

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

/**
 * Retrieve input data for a user's account from the blockchain.
 * @returns {Array} An array of objects containing block number, hash, block timestamp, and input data.
 */
export const getAccountInputData = async () => {
  if (!provider) {
    throw new Error("Provider not initialized");
  }

  try {
    // Get signer address
    const signer = await provider.getSigner();
    const address = await signer.address;
    console.log("User Account Address: ", address);

    // Get hash (former extrinsics index) from Subscan API
    const response = await fetch(
      "https://assethub-westend.api.subscan.io/api/scan/evm/v2/transactions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": import.meta.env.VITE_SUBSCAN_API_KEY,
        },
        body: JSON.stringify({
          address: address,
          row: 5,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    // console.log("Subscan Response:", data);
    const listOfHash = data.data.list;
    // console.log("Hash Former Extrinsics:", listOfHash);
    const allHash = [];
    const allBlockTimestamp = [];
    for (const item of listOfHash) {
      allHash.push(item.hash);
      allBlockTimestamp.push(item.block_timestamp);
    }
    // console.log("All Hashes:", allHash);
    // console.log("All Block Timestamp:", allBlockTimestamp);

    // Get Input Data from Subscan API
    const allInputData = [];
    const allBlockNum = [];
    for (const hash of allHash) {
      const response2 = await fetch(
        "https://assethub-westend.api.subscan.io/api/scan/evm/transaction",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": import.meta.env.VITE_SUBSCAN_API_KEY,
          },
          body: JSON.stringify({
            hash: hash,
          }),
        }
      );

      if (!response2.ok) {
        throw new Error(`HTTP error! status: ${response2.status}`);
      }

      const data2 = await response2.json();
      // console.log("Subscan Response2:", data2);
      allInputData.push(data2.data.input_data);
      allBlockNum.push(data2.data.block_num);
    }

    // Return Output
    const accountInputDataOutput = [];
    for (let i = 0; i < allInputData.length; i++) {
      accountInputDataOutput.push({
        blockNum: allBlockNum[i],
        hash: allHash[i],
        blockTimestamp: allBlockTimestamp[i],
        inputData: allInputData[i],
      });
    }
    console.log("Account Input Data:", accountInputDataOutput);
    return accountInputDataOutput;
  } catch (error) {
    console.error("Error retrieving input data:", error);
    throw error;
  }
};
