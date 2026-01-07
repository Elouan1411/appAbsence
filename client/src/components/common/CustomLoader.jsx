import React from "react";
import { Dots } from "react-activity";
import "react-activity/dist/library.css";
function CustomLoader() {
  return (
    <div className="loader-container">
      <Dots className="loader" />
    </div>
  );
}

export default CustomLoader;
