import React from "react";

const VerifyLog = ({ onVerify }) => {
  return (
    <div>
      {/* <h2>Verify Log</h2> */}
      <button onClick={onVerify}>Verify Log</button>
      <p id="verify-instructions">Press The Button Above To Verify The Log</p>
    </div>
  );
};

export default VerifyLog;
