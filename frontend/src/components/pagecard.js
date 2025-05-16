import React from "react";
import "./pagecard.css"; // Create this file for styles

const PageCard = ({ title, children }) => (
  <div className="page-card">
    {title && <h2 className="page-card-title">{title}</h2>}
    <div className="page-card-content">
      {children}
    </div>
  </div>
);

export default PageCard;