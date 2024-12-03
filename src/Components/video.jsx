import React from 'react';

export const Video = ({ title, videoUrl }) => {
  return (
    <div className="video-container">
      <h3>{title}</h3>
      <video controls>
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};
