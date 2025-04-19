import React, { useState, useEffect } from "react";
import "./App.css";
import OnChainDisplay from "./components/OnChainDisplay";
import OffChainDisplay from "./components/OffChainDisplay";
import RetrieveEvents from "./components/RetrieveEvents";
import {
  connectToBlockchain,
  initializeContract,
  getAccountInputData,
} from "./utils/blockchain";

function App() {
  const [onchainData, setOnchainData] = useState([]);
  const [offchainData, setOffchainData] = useState([]);

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

  const handleRetrieveEvents = async () => {
    try {
      // Fetching account input data
      console.log("Fetching account input data...");
      const accountInputData = await getAccountInputData();
      setOffchainData(accountInputData);
      setOnchainData(accountInputData);
      console.log("Account input data fetched!");
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  return (
    <div className="App">
      <div>
        <div className="server-charlie-container">
          <div>
            <h2>Server C &#40;Verifier&#41;</h2>
          </div>
          <div className="feature-display-out-container">
            <div className="feature-outer-container">
              <RetrieveEvents onRetrieve={handleRetrieveEvents} />
            </div>
            <div className="display-outer-container">
              <OffChainDisplay data={offchainData} onchainData={onchainData} />
              <OnChainDisplay data={onchainData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
