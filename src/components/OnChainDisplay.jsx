import React from "react";

const OnChainDisplay = ({ data }) => {
  return (
    <div className="display-container">
      <h2>On-chain Data</h2>
      {data.map((item, index) => (
        <div key={index} className="display-item">
          <p>Block Number: {item.blockNum}</p>
          <p>Block Timestamp: {item.blockTimestamp}</p>
          <p>Hash: {item.hash}</p>
          <p>Input Data: {item.inputData}</p>
          <p>
            ------------------------------------------------------------------------------------------
          </p>
        </div>
      ))}
    </div>
  );
};

export default OnChainDisplay;
