import React from "react";

const TamperSimulator = ({ onTamper }) => {
  return (
    <div>
      {/* <h2>Simulate Tampering</h2> */}
      <button onClick={onTamper}>Simulate Tampering</button>
      <p id="tamper-instructions">
        Press The Button Above To Simulate Tampering
      </p>
    </div>
  );
};

export default TamperSimulator;
