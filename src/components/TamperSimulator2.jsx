import React, { useEffect, useState } from "react";
import { MerkleTree } from "merkletreejs";
import CryptoJS from "crypto-js";
import { keccak256 } from "ethers";
import { Buffer } from "buffer"; // Import the Buffer polyfill
// Ensure global styles are applied

const TamperSimulator2 = ({ setOriginalRootHash }) => {
  const [logs, setLogs] = useState([]);
  const [tree, setTree] = useState(null);
  const [originalRoot, setOriginalRoot] = useState("");
  const [tamperedRoot, setTamperedRoot] = useState("");
  //const [verificationResult, setVerificationResult] = useState("");
  const [tamperedIndex, setTamperedIndex] = useState(null);
  // const [proofPath, setProofPath] = useState([]);
  const [tamperedTreeInfo, setTamperedTreeInfo] = useState(null);
  const [expandedLevels, setExpandedLevels] = useState({}); // Track open/close state for levels
  const [isTamperButtonClicked, setIsTamperButtonClicked] = useState(false);

  useEffect(() => {
    initializeTree();
  }, []);

  // Function to load logs from the logs.json file
  const loadLogs = async () => {
    try {
      const response = await fetch("/logs.json"); // Fetch the logs.json file from the public directory
      if (!response.ok) {
        throw new Error("Failed to fetch logs.json");
      }
      const logs = await response.json();
      setLogs(logs);
      console.log("Loaded logs:", logs);
      return logs;
    } catch (error) {
      console.error("Error loading logs:", error.message);
      return [];
    }
  };

  // Function to create a Merkle tree
  const createMerkleTree = (logEntries) => {
    try {
      // Hash each log entry using SHA-256 and convert to Buffer
      const hashedLogs = logEntries.map((log) =>
        Buffer.from(CryptoJS.SHA256(log).toString(CryptoJS.enc.Hex), "hex")
      );

      console.log(
        "Hashed logs:",
        hashedLogs.map((hash) => hash.toString("hex"))
      );

      // Create the Merkle tree
      const tree = new MerkleTree(hashedLogs, keccak256, { sortPairs: true });

      // Get the Merkle root
      const root = tree.getHexRoot();

      console.log("Merkle tree created. Root hash:", root);
      console.log(
        "Merkle tree layers:",
        tree
          .getLayers()
          .map((layer) => layer.map((node) => node.toString("hex")))
      );

      return { tree, root, hashedLogs };
    } catch (error) {
      console.error("Error creating Merkle tree:", error.message);
      return { tree: null, root: null, hashedLogs: [] };
    }
  };

  // Function to handle tampering
  const handleTamper = (index) => {
    if (index === null || index < 0 || index >= logs.length) {
      console.error("Invalid log index for tampering.");
      return;
    }

    // Create a copy of the logs and tamper the selected log
    const tamperedLogs = [...logs];
    tamperedLogs[index] = tamperedLogs[index] + " (tampered)";

    // Rebuild the Merkle tree with the tampered logs
    const { tree: tamperedTree, root: tamperedRootHash } =
      createMerkleTree(tamperedLogs);

    // Update the state
    setLogs(tamperedLogs);
    setTree(tamperedTree);
    setTamperedRoot(tamperedRootHash);
    setTamperedIndex(index);

    console.log("Tampered log index:", index);
    console.log("New tampered root hash:", tamperedRootHash);

    // Set isTamperButtonClicked to true to change the log to red color
    setIsTamperButtonClicked(true);
  };

  // Function to initialize the Merkle tree
  const initializeTree = async () => {
    const logs = await loadLogs();
    if (logs.length === 0) {
      console.error("No logs available to initialize the Merkle tree.");
      return;
    }

    const { tree, root } = createMerkleTree(logs);
    if (!tree || !root) {
      console.error("Failed to initialize the Merkle tree.");
      return;
    }

    setTree(tree);
    setOriginalRoot(root);
    setTamperedRoot(root);
    //setVerificationResult("");
    // setProofPath([]);
    setTamperedTreeInfo(null);

    // Set original root hash and use it in Server Alpha
    setOriginalRootHash(root);

    // Set isTamperButtonClicked to false to change the log to white color
    setIsTamperButtonClicked(false);

    // Set tamperedIndex to null to reset the tampered log
    setTamperedIndex(null);
  };

  // Function to calculate and display tampered tree info
  const walkDownTree = () => {
    if (tamperedIndex === null || !tree) {
      console.error("No tampered log selected or tree not initialized.");
      return;
    }

    // Get the proof path for the tampered log
    const leaf = tree.getLeaf(tamperedIndex);
    console.log("Tampered log leaf hash:", leaf.toString("hex"));

    const proof = tree.getProof(leaf);
    const proofHashes = proof.map((p) => p.data.toString("hex"));

    console.log("Proof path hashes:", proofHashes);

    // Include the tampered log's hash (leaf node) and all intermediate hashes
    // setProofPath([leaf.toString("hex"), ...proofHashes]);
    console.log("Full proof path:", [leaf.toString("hex"), ...proofHashes]);

    // Calculate tampered tree info
    const tamperedTreeDepth = proof.length; // Depth is the number of hashes in the proof
    const tamperedTreeLevel = tree.getLayers().length - tamperedTreeDepth - 1; // Level is relative to the total layers
    const tamperedTreeNodes = proof.length + 1; // Include the leaf node in the count

    setTamperedTreeInfo({
      depth: tamperedTreeDepth,
      level: tamperedTreeLevel,
      nodes: tamperedTreeNodes,
    });

    console.log("Tampered tree info:", {
      depth: tamperedTreeDepth,
      level: tamperedTreeLevel,
      nodes: tamperedTreeNodes,
    });
  };

  // Function to render the hybrid Merkle tree with logs
  const renderHybridMerkleTree = (tree) => {
    const layers = tree
      .getLayers()
      .map((layer) => layer.map((node) => node.toString("hex").toUpperCase()));

    return (
      <div
        style={{
          fontFamily: "monospace",
          whiteSpace: "pre-wrap",
          fontSize: "12px",
          color: "white", // Ensure all text is white
        }}
      >
        <p>Tree Depth: {layers.length - 1}</p>
        <p>Tree Levels: {layers.length}</p>
        <p>
          Tree Nodes: {layers.reduce((acc, layer) => acc + layer.length, 0)}
        </p>
        {layers.map((layer, index) => (
          <div key={index} style={{ marginBottom: "10px" }}>
            <h4
              style={{ cursor: "pointer", textDecoration: "underline" }}
              onClick={() =>
                setExpandedLevels((prev) => ({
                  ...prev,
                  [index]: !prev[index],
                }))
              }
            >
              Level {index} {expandedLevels[index] ? "▼" : "▶"}
            </h4>
            {expandedLevels[index] && (
              <div>
                {layer.map((node, nodeIndex) => {
                  const logIndex = nodeIndex;
                  const log = logs[logIndex] || "N/A";
                  const isTampered = tamperedIndex === logIndex;
                  return (
                    <div
                      key={nodeIndex}
                      style={{
                        color:
                          isTamperButtonClicked && isTampered
                            ? "red"
                            : isTampered
                            ? "lightgreen"
                            : "white",
                        marginBottom: "5px",
                      }}
                    >
                      index: {logIndex}, log: {log.slice(0, 10)}... &gt; SHA256:{" "}
                      {node}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      <h2>Merkle Tree</h2>
      <button onClick={initializeTree}>Initialize Merkle Tree</button>
      {tree && (
        <div>
          <h3>Merkle Tree with Logs</h3>
          {renderHybridMerkleTree(tree)}

          {tamperedTreeInfo && (
            <div>
              <h3>Tampered Tree Info</h3>
              <p>Tampered Tree Depth: {tamperedTreeInfo.depth}</p>
              <p>Tampered Tree Level: {tamperedTreeInfo.level}</p>
              <p>Tampered Tree Nodes: {tamperedTreeInfo.nodes}</p>
            </div>
          )}

          <h3>Copy Of Original Root Hash</h3>
          <p>{originalRoot}</p>
          <h3>Tampered Root Hash</h3>
          <p>{tamperedRoot}</p>
          {/* <h3>Verification Result</h3> */}
          {/* <p>{verificationResult}</p> */}
          <h3>Tamper a Log</h3>
          <select
            onChange={(e) => setTamperedIndex(parseInt(e.target.value))}
            value={tamperedIndex || ""}
          >
            <option value="" disabled>
              Select a Log to Tamper
            </option>
            {logs.map((log, index) => (
              <option key={index} value={index}>
                Log {index}
              </option>
            ))}
          </select>
          <button
            onClick={() => handleTamper(tamperedIndex)}
            disabled={tamperedIndex === null}
          >
            Tamper Selected Log
          </button>
          <button
            onClick={walkDownTree}
            disabled={tamperedIndex === null || !tree}
          >
            Walk Down Tree
          </button>
        </div>
      )}
    </div>
  );
};

export default TamperSimulator2;
