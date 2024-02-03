import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from 'react-router-dom';
import videos from './mockData'; // Assuming this is your mock data file
import Video from './video';
import VideoRenderer from './VideoRenderer'; // Your new component for Three.js rendering

function App() {
  return (
    <Router>
      <div>
        <header className="App-header">
          <h1>DepthTube</h1>
        </header>
        <Routes>
          <Route path="/video/:id" children={<VideoRenderer />} />
          <Route path="/" exact>
            <div className="video-container">
              {videos.map(video => (
                // Update this to Link to your video renderer
                <Link to={`/video/${video.id}`} key={video.id}>
                  <Video video={video} />
                </Link>
              ))}
            </div>
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
