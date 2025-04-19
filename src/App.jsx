import React, { useState, useEffect } from "react";
import "./App.css";
import TamperSimulator from "./components/TamperSimulator";
import TamperSimulator2 from "./components/TamperSimulator2";
import VerifyLog from "./components/VerifyLog";
import OnChainDisplay from "./components/OnChainDisplay";
import OffChainDisplay from "./components/OffChainDisplay";
import RetrieveEvents from "./components/RetrieveEvents";
import SubmitLogHash from "./components/SubmitLogHash";
import {
  connectToBlockchain,
  initializeContract,
  getAccountInputData,
} from "./utils/blockchain";
import { generateLog } from "./utils/logSimulator";
import { hashLog } from "./utils/hashing";

function App() {
  const [onchainData, setOnchainData] = useState([]);
  const [offchainData, setOffchainData] = useState([]);
  const [verifyClicked, setVerifyClicked] = useState(false);
  const [isVerifier, setIsVerifier] = useState(true);
  const [randomNumArray, setRandomNumArray] = useState([]);
  const [originalRootHash, setOriginalRootHash] = useState("");

  useEffect(() => {
    const setup = async () => {
      try {
        // Connect to blockchain
        console.log("Connecting to blockchain...");
        const provider = await connectToBlockchain();
        console.log("Blockchain connected!");

        // Initialize contract
        console.log("Initializing contract...");
        initializeContract(provider);
        console.log("Contract initialized!");
      } catch (error) {
        console.error("Error during setup:", error);
      }
    };

    setup();
  }, []);

  const handleVerifyLog = async () => {
    setVerifyClicked(true);

    // Confirm verification
    const verifyElement = document.getElementById("verify-instructions");
    verifyElement.textContent = "Verification Agent Started";
    verifyElement.style.color = "white";
    verifyElement.style.fontWeight = "bold";
  };

  const handleTamper = () => {
    const newLog = generateLog();
    const newHash32 = hashLog(newLog);

    // Check if all data has been tampered with
    if (randomNumArray.length === offchainData.length) {
      console.error("All Data Has Been Tampered With!");
      const element = document.getElementById("tamper-instructions");
      element.textContent = "All Data Has Been Tampered With";
      element.style.color = "red";
      element.style.fontWeight = "bold";

      return;
    }

    // Randomly select an index to tamper
    let randomIndex = 0;
    do {
      randomIndex = Math.floor(Math.random() * offchainData.length);
    } while (randomNumArray.includes(randomIndex));
    setRandomNumArray((prev) => [...prev, randomIndex]);

    console.log(`Tampering With Off-chain Data At Index: ${randomIndex}`);

    // Update tamper instructions
    const element = document.getElementById("tamper-instructions");
    element.textContent = `Tampering With Off-chain Data At Index: ${randomIndex}`;
    element.style.color = "red";
    element.style.fontWeight = "bold";

    // Update offchain data
    setOffchainData((prev) => {
      const newData = [...prev];
      newData[randomIndex] = {
        ...newData[randomIndex],
        inputData: newHash32,
      };
      return newData;
    });
  };

  const handleRetrieveEvents = async () => {
    try {
      // Fetching account input data
      console.log("Fetching account input data...");
      const accountInputData = await getAccountInputData();
      setOffchainData(accountInputData);
      setOnchainData(accountInputData);
      console.log("Account input data fetched!");

      // Reset verification state
      setVerifyClicked(false);

      // Reset randomNumArray
      setRandomNumArray([]);

      // Reset tamper instructions
      const tamperElement = document.getElementById("tamper-instructions");
      tamperElement.textContent =
        "Press The Button Above To Simulate Tampering";
      tamperElement.style.color = "";
      tamperElement.style.fontWeight = "";

      // Reset verify instructions
      const verifyElement = document.getElementById("verify-instructions");
      verifyElement.textContent = "Press The Button Above To Verify The Log";
      verifyElement.style.color = "";
      verifyElement.style.fontWeight = "";
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  return (
    <div className="App">
      <button
        className="switch-button"
        onClick={() => setIsVerifier(!isVerifier)}
      >
        {isVerifier ? "Switch to Server C" : "Switch to Server A & B"}
      </button>
      <div style={isVerifier ? { display: "block" } : { display: "none" }}>
        <h1>
          <span className="titleAstartes">ASTARTES</span>.DOT
        </h1>
        <div className="submit-outer-container">
          <SubmitLogHash originalRootHash={originalRootHash} />
        </div>
      </div>
      <div style={isVerifier ? { display: "none" } : { display: "block" }}>
        <div className="server-charlie-container">
          <div>
            <h2>Server C &#40;Verifier&#41;</h2>
          </div>
          <div className="feature-display-out-container">
            <div className="feature-outer-container">
              <TamperSimulator onTamper={handleTamper} />
              <VerifyLog onVerify={handleVerifyLog} />
              <RetrieveEvents onRetrieve={handleRetrieveEvents} />
            </div>
            <div className="display-outer-container">
              <OffChainDisplay
                data={offchainData}
                verifyClicked={verifyClicked}
                onchainData={onchainData}
              />
              <OnChainDisplay data={onchainData} />
            </div>
          </div>
        </div>
        <div className="merkle-tree-container">
          <TamperSimulator2 setOriginalRootHash={setOriginalRootHash} />
        </div>
      </div>
    </div>
  );
}

export default App;
