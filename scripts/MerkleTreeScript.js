import { execSync } from "child_process";
import { writeFileSync } from "fs";
import { MerkleTree } from "merkletreejs";
import CryptoJS from "crypto-js";
import { keccak256 } from "ethers";
import path from "path";
import { fileURLToPath } from "url";

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to grab macOS security logs
const getMacSecurityLogs = () => {
  try {
    // Fetch logs for the last 5 minutes
    const logs = execSync(
      "log show --predicate 'eventMessage contains \"auth\"' --info --style syslog --last 5m",
      {
        encoding: "utf-8",
        maxBuffer: 1024 * 1024, // 1 MB buffer size
      }
    );
    return logs.split("\n").filter((line) => line.trim() !== ""); // Split logs into lines and filter empty lines
  } catch (error) {
    console.error("Error fetching macOS security logs:", error.message);
    return [];
  }
};

// Function to create a Merkle tree from logs
export const createMerkleTree = (logs) => {
    // Hash each log entry using SHA-256
    const hashedLogs = logs.map((log) =>
      CryptoJS.SHA256(log).toString(CryptoJS.enc.Hex)
    );
  
    // Create the Merkle tree
    const tree = new MerkleTree(hashedLogs, keccak256, { sortPairs: true });
  
    // Get the Merkle root
    const root = tree.getHexRoot();
  
    return { tree, root };
  };