import React from "react";

export const MediaItem = ({ title, largeImage, smallImage, videoUrl }) => {
  return (
    <div className="portfolio-item">
      <div className="hover-bg">
        {videoUrl ? (
          <div className="video-container">
            <video controls>
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        ) : (
          <div className="image-container">
            <a href={largeImage} title={title} data-lightbox-gallery="gallery1">
              <div className="hover-text">
                <h4>{title}</h4>
              </div>
              <img src={smallImage} alt={title} />
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
