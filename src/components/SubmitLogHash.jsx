import React, { useState, useEffect } from "react";
import { FaDownLong } from "react-icons/fa6";
import { generateLog } from "../utils/logSimulator";
import { hashLog } from "../utils/hashing";
import { storeLogHash } from "../utils/blockchain";
import ServerIcon from "../components/ServerIcon";

const SubmitLogHash = ({ originalRootHash }) => {
  const [log, setLog] = useState("");
  const [logHash, setLogHash] = useState("");
  const [hashReadyToServerBravo, setHashReadyToServerBravo] = useState("");

  useEffect(() => {
    setLogHash(hashLog(log));
  }, [log]);

  const handleSubmitLogHash = async () => {
    try {
      if (!hashReadyToServerBravo) {
        console.error("No hash ready to store!");
        return;
      }

      console.log("Storing log hash...");
      await storeLogHash(hashReadyToServerBravo);
      console.log("Log hash stored successfully!");
    } catch (error) {
      console.error("Error storing log hash:", error);
    }
  };

  const handleGenerateLog = () => {
    const newLog = generateLog();
    const newHash32 = hashLog(newLog);

    setLog(newLog);
    setLogHash(newHash32);

    console.log("Generated log:", newLog);
    console.log("Generated hash:", newHash32);
  };

  return (
    <div className="submit-log-hash-outer-container">
      <div className="submit-log-hash-container">
        <div className="title-server-icon-container">
          <h2>Server A &#40;Source&#41;</h2>
          <ServerIcon />
        </div>
        <div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              paddingBottom: "1rem",
            }}
          >
            <p>Original Root Hash: {originalRootHash}</p>
            <button onClick={() => setHashReadyToServerBravo(originalRootHash)}>
              Use Original Root Hash
            </button>
          </div>
          <textarea
            placeholder="Your Log"
            value={log}
            onChange={(e) => setLog(e.target.value)}
            rows={3}
            cols={50}
          ></textarea>
          <div>
            <span> or </span>
            <button onClick={handleGenerateLog}>Generate Log</button>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <p>Merkle Hash: {logHash}</p>
          <button onClick={() => setHashReadyToServerBravo(logHash)}>
            Use Merkle Hash
          </button>
        </div>
      </div>

      <FaDownLong className="fa-down-long" />

      <div className="submit-log-hash-container2">
        <div className="title-server-icon-container">
          <h2>Server B &#40;Publisher&#41;</h2>
          <ServerIcon />
        </div>
        {hashReadyToServerBravo && (
          <p>Hash Ready To Send: {hashReadyToServerBravo}</p>
        )}
        <button onClick={handleSubmitLogHash}>Send To Blockchain</button>
      </div>
    </div>
  );
};

export default SubmitLogHash;
