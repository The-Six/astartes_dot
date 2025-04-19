import React, { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { connectToBlockchain, initializeContract } from "./utils/blockchain";

function App() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const setup = async () => {
      try {
        console.log("Connecting to blockchain...");
        const provider = await connectToBlockchain();
        // setProvider(provider);
        console.log("Blockchain connected!");

        console.log("Initializing contract...");
        initializeContract(provider);
        console.log("Contract initialized!");

        // console.log("Fetching account input data...");
        // const accountInputData = await getAccountInputData();
        // setOffchainData(accountInputData);
        // setOnchainData(accountInputData);
        // console.log("Account input data fetched!");
      } catch (error) {
        console.error("Error during setup:", error);
      }
    };

    setup();
  }, []);

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
