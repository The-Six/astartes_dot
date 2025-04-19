import React from "react";

const RetrieveEvents = ({ onRetrieve }) => {
  return (
    <div>
      <button onClick={onRetrieve}>Retrieve Events</button>
      <p id="retrieve-instructions">
        Press The Button Above To Retrieve Events
      </p>
    </div>
  );
};

export default RetrieveEvents;
