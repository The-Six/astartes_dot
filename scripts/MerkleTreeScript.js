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

// Main function
const main = () => {
  console.log("Fetching macOS security logs...");
  const logs = getMacSecurityLogs();

  if (logs.length === 0) {
    console.error("No logs found.");
    return;
  }

  console.log(`Fetched ${logs.length} log entries.`);

  // Save the logs to a file for reuse
  const logFilePath = path.join(__dirname, "logs.json");
  writeFileSync(logFilePath, JSON.stringify(logs, null, 2));
  console.log(`Logs saved to: ${logFilePath}`);

  console.log("Creating Merkle tree...");
  //   const { root } = createMerkleTree(logs);

  //   console.log("Merkle tree created.");
  //   console.log("Merkle Root Hash:", root);

  // Uncomment the following lines to visualize the Merkle tree
  const { tree, root } = createMerkleTree(logs);

  console.log("Merkle tree created.");
  console.log("Merkle Root Hash:", root);

  console.log("\nMerkle Tree:");
  console.log(tree.toString());
  //END

  // Return the root hash for further use (e.g., storing on the blockchain)
  return root;
};

// Run the script
main();
