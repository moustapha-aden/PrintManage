// src/components/common/Loader.js
import React from 'react';
import '../styles/Loader.css';

const Loader = ({ message = "Chargement..." }) => (
  <div className="loader-container">
    <div className="spinner"></div>
    <p>{message}</p>
  </div>
);

export default Loader;
