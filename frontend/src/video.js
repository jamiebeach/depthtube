// Video.js
import React from 'react';

const Video = ({ video }) => {
  return (
    <div className="video-card">
      <img src={video.thumbnail} alt={video.title} />
      <div className="video-card-container">
        <h3>{video.title}</h3>
        <p>{video.description}</p>
        <div className="likes-views">
          <span>Likes: {video.likes}</span>
          <span>Views: {video.views}</span>
        </div>
      </div>
    </div>
  );
};

export default Video;
