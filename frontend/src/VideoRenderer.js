import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ARButton } from './ARButton.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FlyControls } from 'three/examples/jsm/controls/FlyControls.js';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';
import { useParams } from 'react-router-dom';

const VideoRenderer = () => {
  const { id } = useParams(); // Get video ID from URL
  const videoRef = useRef(null);
  const containerRef = useRef();
  let alreadyInitialized = false;

  useEffect(() => {
    let scene, camera, renderer, videoTexture, customMaterial, mesh;
    let controls;
    let controller, controller2;
    let container;
    let requestId;

    ///////////
    // declares for camera movement in webxr
    // borrowed from https://stackoverflow.com/questions/62476426/webxr-controllers-for-button-pressing-in-three-js
    //
    let dolly;
    var cameraVector = new THREE.Vector3(); // create once and reuse it!
    const prevGamePads = new Map();
    var speedFactor = [0.1, 0.1, 0.1, 0.1];
    //
    //////////////////////////////////////

    init();
    animate();

    function init() {
        if(alreadyInitialized)
          return;
        //alreadyInitialized = true;

        // Scene setup
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        renderer = new THREE.WebGLRenderer();
        //renderer.setPixelRatio( window.devicePixelRatio );
        //renderer.setSize(window.innerWidth, window.innerHeight);

        // Make the Three.js scene background transparent
        renderer.setClearColor(0x000000, 0); // Transparent background
        renderer.xr.enabled = true;

        //document.body.appendChild(renderer.domElement);
        //document.body.appendChild( ARButton.createButton( renderer ) );
        if(containerRef.current){                  
          const cwidth = containerRef.current.clientWidth;
          const cheight = containerRef.current.clientHeight;
          console.log(cheight);
          renderer.setSize(cwidth, cheight);
          camera.aspect = cwidth / cheight;
          camera.updateProjectionMatrix();
          
          container = containerRef.current;
          containerRef.current.appendChild(renderer.domElement);
          containerRef.current.appendChild(ARButton.createButton (renderer, function() {
            console.log('AR session started');
            dolly.position.set(0, 0, 7);
            renderer.setSize(window.innerWidth, window.innerHeight);
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
          }));
        }
        
        // Listen for AR session start
        renderer.xr.addEventListener('sessionstart', () => {

        });

        // Listen for AR session end
        renderer.xr.addEventListener('sessionend', () => {
          console.log('AR session ended');
          const cwidth = containerRef.current.clientWidth;
          const cheight = containerRef.current.clientHeight;
          console.log(cheight);
          renderer.setSize(cwidth, cheight);        
          camera.aspect = cwidth / cheight;
          camera.updateProjectionMatrix();
        });

        // Video setup
        const video = document.createElement('video');
        video.src = '/videos/elephant.mp4'; // Set your video path here
        video.load();
        video.loop = true;
        videoTexture = new THREE.VideoTexture(video);
        let videoPlaying = false;
        videoRef.current = video;

        // Wait for the video metadata to load
        video.addEventListener('loadedmetadata', function() {
            // Calculate the aspect ratio of the video
            const videoAspectRatio = video.videoWidth / video.videoHeight;

            // Set the height of the plane and adjust width based on video aspect ratio
            const planeHeight = 5;
            const planeWidth = planeHeight * videoAspectRatio;            

            // Plane geometry
            const geometry = new THREE.PlaneGeometry(5, 3, 1000, 1000); // Adjust size and segments

            // Custom shader material
            customMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    videoTexture: { value: videoTexture },
                    depthScale: { value: 1.5 } // Adjust depth scale factor
                },
                vertexShader: vertexShader(),
                fragmentShader: fragmentShader(),
                side: THREE.DoubleSide
            });

            mesh = new THREE.Mesh(geometry, customMaterial);
            scene.add(mesh);
            window.addEventListener( 'resize', onWindowResize );

    function onSelect() {
                if(!videoPlaying){
                    video.play();
                    videoPlaying = true;
                }else{
                    video.pause();
                    videoPlaying = false;
                }
            }

            controller = renderer.xr.getController(0);
            //controller.add(new THREE.line(geometry));
            controller.addEventListener('select', function(){
                onSelect();
            });
            scene.add(controller);

            controller2 = renderer.xr.getController(1);
            //controller2.add(new THREE.line(geometry));
            controller2.addEventListener('select', onSelect);
            scene.add(controller2);      
            
    const controllerModelFactory = new XRControllerModelFactory();

    const controllerGrip1 = renderer.xr.getControllerGrip( 0 );
    controllerGrip1.add( controllerModelFactory.createControllerModel( controllerGrip1 ) );
    scene.add( controllerGrip1 );

    const controllerGrip2 = renderer.xr.getControllerGrip( 1 );
    controllerGrip2.add( controllerModelFactory.createControllerModel( controllerGrip2 ) );
    scene.add( controllerGrip2 );               

            dolly = new THREE.Group();
            dolly.position.set(0, 0, -5);
            dolly.name = "dolly";
            scene.add(dolly);
            dolly.add(camera);
            dolly.add(controller);
            dolly.add(controller2);
            dolly.add(controllerGrip1);
            dolly.add(controllerGrip2);

            camera.position.z = 10;

            // Initialize OrbitControls
            
            controls = new OrbitControls(camera, renderer.domElement);
            controls.target.set( 0, 0, 0 );

            // Optional: Configure control
            controls.enableDamping = true; // Optional: an animation loop is required when either damping or auto-rotation are enabled
            controls.dampingFactor = 0.05;
            controls.screenSpacePanning = false;
            controls.enableZoom = true;
            controls.enableRotate = true;
            controls.update();
            
            //controls = new FlyControls(camera, renderer.domElement);
            //controls.update();                

        });   

        function onWindowResize() {
          const width = containerRef.current.clientWidth;
          const height = containerRef.current.clientHeight;
          renderer.setSize(width, height);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
        }
        //document.getElementById('startButton').addEventListener('click', function() {
            //video.play();               
        //});            

    }

    function animate() {
        requestId = renderer.setAnimationLoop(render);
    }

    function handleController(controller){

    }

    function render(){
        // Update controls
        if(controls){
            controls.update(); // Only required if controls.enableDamping is set to true, or if controls.autoRotate is set to true
            //handleController( controller );
      //handleController( controller2 );
        }

        // Update video texture
        if (videoTexture) videoTexture.needsUpdate = true;

        ////////////////////////////////////////
        //add gamepad polling for webxr to renderloop 
        //
        dollyMove();

        ////
        //////////////////////////////////////            

        //renderer.clearDepth();            
        renderer.render(scene, camera);
    }

    //////////////////////////////////
    // Function for camera movement.
    // Borrowed from https://stackoverflow.com/questions/62476426/webxr-controllers-for-button-pressing-in-three-js
    //
    function dollyMove() {
        var handedness = "unknown";

        //determine if we are in an xr session
        const session = renderer.xr.getSession();
        let i = 0;

        if (session) {
            let xrCamera = renderer.xr.getCamera(camera);
            xrCamera.getWorldDirection(cameraVector);

            //a check to prevent console errors if only one input source
            if (isIterable(session.inputSources)) {
                for (const source of session.inputSources) {
                    if (source && source.handedness) {
                        handedness = source.handedness; //left or right controllers
                    }
                    if (!source.gamepad) continue;
                    const controller = renderer.xr.getController(i++);
                    const old = prevGamePads.get(source);
                    const data = {
                        handedness: handedness,
                        buttons: source.gamepad.buttons.map((b) => b.value),
                        axes: source.gamepad.axes.slice(0)
                    };
                    if (old) {
                        data.buttons.forEach((value, i) => {
                            //handlers for buttons
                            if (value !== old.buttons[i] || Math.abs(value) > 0.8) {
                                //check if it is 'all the way pushed'
                                if (value === 1) {
                                    //console.log("Button" + i + "Down");
                                    if (data.handedness == "left") {
                                        //console.log("Left Paddle Down");
                                        if (i == 1) {
                                            //dolly.rotateY(-THREE.Math.degToRad(1));
                                            dolly.rotateY(-(1 * Math.PI / 180));
                                        }
                                        if (i == 3) {
                                            //reset teleport to home position
                                            dolly.position.x = 0;
                                            dolly.position.y = 5;
                                            dolly.position.z = 0;
                                        }
                                    } else {
                                        //console.log("Right Paddle Down");
                                        if (i == 1) {
                                            //dolly.rotateY(THREE.Math.degToRad(1));
                                            dolly.rotateY(-(1 * Math.PI / 180));
                                        }
                                    }
                                } else {
                                    // console.log("Button" + i + "Up");

                                    if (i == 1) {
                                        //use the paddle buttons to rotate
                                        if (data.handedness == "left") {
                                            //console.log("Left Paddle Down");
                                            //dolly.rotateY(-THREE.Math.degToRad(Math.abs(value)));
                                            dolly.rotateY(-(Math.abs(value) * Math.PI / 180));
                                        } else {
                                            //console.log("Right Paddle Down");
                                            dolly.rotateY((Math.abs(value) * Math.PI / 180));
                                        }
                                    }
                                }
                            }
                        });
                        data.axes.forEach((value, i) => {
                            //handlers for thumbsticks
                            //if thumbstick axis has moved beyond the minimum threshold from center, windows mixed reality seems to wander up to about .17 with no input
                            if (Math.abs(value) > 0.2) {
                                //set the speedFactor per axis, with acceleration when holding above threshold, up to a max speed
                                speedFactor[i] > 1 ? (speedFactor[i] = 1) : (speedFactor[i] *= 1.001);
                                console.log(value, speedFactor[i], i);
                                if (i == 2) {
                                    //left and right axis on thumbsticks
                                    if (data.handedness == "left") {
                                        // (data.axes[2] > 0) ? console.log('left on left thumbstick') : console.log('right on left thumbstick')

                                        //move our dolly
                                        //we reverse the vectors 90degrees so we can do straffing side to side movement
                                        dolly.position.x -= cameraVector.z * speedFactor[i] * data.axes[2];
                                        dolly.position.z += cameraVector.x * speedFactor[i] * data.axes[2];

                                        //provide haptic feedback if available in browser
                                        if (
                                            source.gamepad.hapticActuators &&
                                            source.gamepad.hapticActuators[0]
                                        ) {
                                            var pulseStrength = Math.abs(data.axes[2]) + Math.abs(data.axes[3]);
                                            if (pulseStrength > 0.75) {
                                                pulseStrength = 0.75;
                                            }

                                            var didPulse = source.gamepad.hapticActuators[0].pulse(
                                                pulseStrength,
                                                100
                                            );
                                        }
                                    } else {
                                        // (data.axes[2] > 0) ? console.log('left on right thumbstick') : console.log('right on right thumbstick')
                                        //dolly.rotateY(-THREE.Math.degToRad(data.axes[2]));
                                        dolly.rotateY(-(data.axes[2] * Math.PI / 180));
                                    }
                                    controls.update();
                                }

                                if (i == 3) {
                                    //up and down axis on thumbsticks
                                    if (data.handedness == "left") {
                                        // (data.axes[3] > 0) ? console.log('up on left thumbstick') : console.log('down on left thumbstick')
                                        dolly.position.y -= speedFactor[i] * data.axes[3];
                                        //provide haptic feedback if available in browser
                                        if (
                                            source.gamepad.hapticActuators &&
                                            source.gamepad.hapticActuators[0]
                                        ) {
                                            var pulseStrength = Math.abs(data.axes[3]);
                                            if (pulseStrength > 0.75) {
                                                pulseStrength = 0.75;
                                            }
                                            var didPulse = source.gamepad.hapticActuators[0].pulse(
                                                pulseStrength,
                                                100
                                            );
                                        }
                                    } else {
                                        // (data.axes[3] > 0) ? console.log('up on right thumbstick') : console.log('down on right thumbstick')
                                        dolly.position.x -= cameraVector.x * speedFactor[i] * data.axes[3];
                                        dolly.position.z -= cameraVector.z * speedFactor[i] * data.axes[3];

                                        //provide haptic feedback if available in browser
                                        if (
                                            source.gamepad.hapticActuators &&
                                            source.gamepad.hapticActuators[0]
                                        ) {
                                            var pulseStrength = Math.abs(data.axes[2]) + Math.abs(data.axes[3]);
                                            if (pulseStrength > 0.75) {
                                                pulseStrength = 0.75;
                                            }
                                            var didPulse = source.gamepad.hapticActuators[0].pulse(
                                                pulseStrength,
                                                100
                                            );
                                        }
                                    }
                                    controls.update();
                                }
                            } else {
                                //axis below threshold - reset the speedFactor if it is greater than zero  or 0.025 but below our threshold
                                if (Math.abs(value) > 0.025) {
                                    speedFactor[i] = 0.025;
                                }
                            }
                        });
                    }
                    ///store this frames data to compate with in the next frame
                    prevGamePads.set(source, data);
                }
            }
        }
    }

    function isIterable(obj) {  //function to check if object is iterable
        // checks for null and undefined
        if (obj == null) {
            return false;
        }
        return typeof obj[Symbol.iterator] === "function";
    }

    //
    /////////////////////////////////////////////

    function vertexShader() {
        return `
            uniform sampler2D videoTexture;
            uniform float depthScale;
            varying vec2 vUv;

            void main() {
                vUv = uv;
                vec2 depthUV = vec2(uv.x * 0.5, uv.y);
                vec3 depthColor = texture2D(videoTexture, depthUV).rgb;
                float depth = depthColor.r * 255.0 * 65536.0 + depthColor.g * 255.0 * 256.0 + depthColor.b * 255.0;
                depth /= (255.0 * 65536.0 + 255.0 * 256.0 + 255.0);
                vec3 displacedPosition = position;
                displacedPosition.z += (depth - 0.5) * depthScale;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPosition, 1.0);
            }
        `;
    }

    function fragmentShader() {
        return `
            uniform sampler2D videoTexture;
            varying vec2 vUv;

            void main() {
                vec2 colorUV = vec2(0.5 + vUv.x * 0.5, vUv.y);
                vec3 color = texture2D(videoTexture, colorUV).rgb;
                gl_FragColor = vec4(color, 1.0);
            }
        `;
    }

    function debugVertexShader(){
        return `
            uniform sampler2D videoTexture;
            uniform float depthScale;
            varying vec2 vUv;

            void main() {
                vUv = uv;
                vec2 depthUV = vec2(uv.x * 0.5, uv.y); // Assuming depth is on the left half
                vec3 depthColor = texture2D(videoTexture, depthUV).rgb;

                // Convert RGB depth to a single value (modify this based on your depth encoding)
                float depth = depthColor.r * 255.0 * 65536.0 + depthColor.g * 255.0 * 256.0 + depthColor.b * 255.0;
                depth /= (255.0 * 65536.0 + 255.0 * 256.0 + 255.0);

                vec3 displacedPosition = position;
                displacedPosition.z += (depth - 0.5) * depthScale;

                gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPosition, 1.0);
            }
        `;
    }

    function debugFragmentShader(){
        return `
            varying vec2 vUv;
            uniform sampler2D videoTexture;

            void main() {
                vec2 colorUV = vec2(0.5 + vUv.x * 0.5, vUv.y); // Assuming color is on the right half

                // Debug: Visualize depth map
                vec2 depthUV = vec2(vUv.x * 0.5, vUv.y);
                vec3 depthColor = texture2D(videoTexture, depthUV).rgb;
                gl_FragColor = vec4(depthColor, 1.0); // Render depth map directly for debugging
            }
        `;
    }

    return () => {
      // Cleanup when component unmounts
      // Remove Three.js event listeners, stop video playback, etc.  
      if(container){
        console.log('removing renderer child...');
        if(renderer.domElement.parentElement == container)
          container.removeChild(renderer.domElement);
        console.log('renderer child removed');
      }
      
      scene.children.forEach(child => {
        if (child.geometry) {
          child.geometry.dispose();
        }
        if (child.material) {
          if (child.material.length) {
            // For multi-materials
            child.material.forEach(material => material.dispose());
          } else {
            // For single material
            child.material.dispose();
          }
        }
        if (child.texture) {
          child.texture.dispose();
        }
      });      

      // Also consider stopping the animation frame when the component unmounts
      cancelAnimationFrame(requestId);

      if (videoRef.current) {
          videoRef.current.pause();
          videoRef.current.src = "";
          videoRef.current.load();
      }
    };
  }, [id]);

  const startARExperience = () => {
    // Logic to start the AR experience
    console.log('Starting AR Experience');
    // This is where you'd trigger any setup required to start AR.
  };  

  //return <div id="canvas-container"></div>; // Container for Three.js canvas
  return (
    <div>
        <div ref={containerRef} className="three-container"></div>
    </div>
  );  
};

export default VideoRenderer;
