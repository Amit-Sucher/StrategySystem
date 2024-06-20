import React from 'react';
import './ImageWithDots.css';

// ImageWithDots component definition
const ImageWithDots = ({ imageSrc, coordinates }) => {
  return (
    <div className="image-container">
      {/* Render the background image */}
      <img src={imageSrc} alt="Background" className="background-image" />

      {/* Render each dot at the specified coordinates */}
      {coordinates.map((coord, index) => (
        <div
          key={index} // Unique key for each dot
          className="dot" // CSS class for styling the dot
          style={{ left: `${coord.x}%`, top: `${coord.y}%` }} // Position the dot
        />
      ))}
    </div>
  );
};

export default ImageWithDots;
