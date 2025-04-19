import React from "react";

const OffChainDisplay = ({ data, verifyClicked, onchainData }) => {
  if (verifyClicked) {
    return (
      <div className="display-container">
        <h2>Off-chain Data</h2>
        {data.map((item, index) => {
          const isMismatched = item.inputData !== onchainData[index]?.inputData;
          return (
            <div key={index} className="display-item">
              {/* <p>Block Number: {item.blockNum}</p> */}
              <p>Block Timestamp: {item.blockTimestamp}</p>
              {/* <p>Hash: {item.hash}</p> */}
              <p>
                Input Data:{" "}
                <span className={isMismatched ? "hash-mismatch" : ""}>
                  {item.inputData}
                </span>
              </p>
              <p>
                ------------------------------------------------------------------------------------------
              </p>
            </div>
          );
        })}
      </div>
    );
  } else {
    return (
      <div className="display-container">
        <h2>Off-chain Data</h2>
        {data.map((item, index) => (
          <div key={index} className="display-item">
            {/* <p>Block Number: {item.blockNum}</p> */}
            <p>Block Timestamp: {item.blockTimestamp}</p>
            {/* <p>Hash: {item.hash}</p> */}
            <p>Input Data: {item.inputData}</p>
            <p>
              ------------------------------------------------------------------------------------------
            </p>
          </div>
        ))}
      </div>
    );
  }
};

export default OffChainDisplay;
