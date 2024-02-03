import React, { useEffect } from 'react';
import * as THREE from 'https://unpkg.com/three@0.160.1/build/three.module.js';
import { Object3D } from "https://unpkg.com/three@0.160.1/build/three.module.js";
import { ARButton } from 'https://unpkg.com/three@0.160.1/examples/jsm/webxr/ARButton.js';
import { OrbitControls } from "https://unpkg.com/three@0.160.1/examples/jsm/controls/OrbitControls.js";
import { FlyControls } from "https://unpkg.com/three@0.160.1/examples/jsm/controls/FlyControls.js";
import { XRControllerModelFactory } from 'https://unpkg.com/three@0.160.1/examples/jsm/webxr/XRControllerModelFactory.js';
import { useParams } from 'react-router-dom';

const VideoRenderer = () => {
  const { id } = useParams(); // Get video ID from URL

  useEffect(() => {
    // Three.js setup...
    const scene = new THREE.Scene();
    // ... other Three.js setup code ...

    // Video setup
    const video = document.createElement('video');
    video.src = `videos/video-${id}.mp4`; // Dynamic video source based on ID
    // ... rest of your video setup code ...

    return () => {
      // Cleanup when component unmounts
      // Remove Three.js event listeners, stop video playback, etc.
    };
  }, [id]);

  return <div id="canvas-container"></div>; // Container for Three.js canvas
};

export default VideoRenderer;
