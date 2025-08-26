import { useState, useEffect, useRef } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { Plane, KeyboardControls, useKeyboardControls, PointerLockControls } from '@react-three/drei';
import * as THREE from 'three';

// Define el mapa de controles de teclado para el movimiento WASD
const keyboardMap = [
  { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
  { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
  { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
  { name: 'right', keys: ['ArrowRight', 'KeyD'] },
];

// Componente para el control de movimiento en primera persona
function FirstPersonControls() {
  const { camera } = useThree();
  const [subscribe, getKeys] = useKeyboardControls();

  const movementSpeed = 0.05;

  useFrame(() => {
    const keys = getKeys();
    const { forward, backward, left, right } = keys;

    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    direction.y = 0;
    direction.normalize();

    const rightVector = new THREE.Vector3().crossVectors(camera.up, direction);

    if (forward) {
      camera.position.addScaledVector(direction, movementSpeed);
    }
    if (backward) {
      camera.position.addScaledVector(direction, -movementSpeed);
    }
    if (left) {
      camera.position.addScaledVector(rightVector, movementSpeed);
    }
    if (right) {
      camera.position.addScaledVector(rightVector, -movementSpeed);
    }

    camera.position.y = 1.5;
  });

  return null;
}

// Componente para el suelo
function Floor() {
  return (
    <Plane args={[100, 100]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
      <meshStandardMaterial color="gray" />
    </Plane>
  );
}

// Componente único para los planos de video, ahora más flexible
function VideoPlane({ videoUrl, onVideoClick, position }) {
  const [video] = useState(() => {
    const el = document.createElement('video');
    el.src = videoUrl;
    el.crossOrigin = 'Anonymous';
    el.loop = true;
    el.playsInline = true;
    el.play();
    return el;
  });

  return (
    <Plane
      args={[2, 4]}
      position={position}
      onClick={() => onVideoClick(video)}
    >
      <meshBasicMaterial toneMapped={false}>
        <videoTexture attach="map" args={[video]} />
      </meshBasicMaterial>
    </Plane>
  );
}

// Componente principal de la aplicación
export default function App() {
  const videoSource1 = '/Download1.mp4';
  const videoSource2 = '/Download2.mp4';
  const videoSource3 = '/Download.mp4';
  const controlsRef = useRef();

  // Esta función ahora también se encarga del sonido
  const handleVideoClick = (videoElement) => {
    if (controlsRef.current) {
      controlsRef.current.unlock();
    }
    
    // Si el video está en pausa o silenciado, lo reproducimos y le activamos el sonido
    if (videoElement.paused || videoElement.muted) {
      videoElement.play();
      videoElement.muted = false; // Aquí se activa el sonido
      console.log('Video playing');
    } else {
      videoElement.pause();
      videoElement.muted = true; // Aquí se silencia
      console.log('Video paused');
    }
  };
  
  return (
    <Canvas
      camera={{ position: [0, 1.5, 4], fov: 50 }}
      style={{ position: 'fixed', inset: 0 }}
    >
      <ambientLight intensity={1} />
      <directionalLight position={[10, 10, 5]} intensity={1} />

      <KeyboardControls map={keyboardMap}>
        <FirstPersonControls />
      </KeyboardControls>

      <PointerLockControls ref={controlsRef} />

      {/* Usamos el componente VideoPlane de manera reutilizable */}
      <VideoPlane videoUrl={videoSource1} onVideoClick={handleVideoClick} position={[0, 1.5, -5]} />
      <VideoPlane videoUrl={videoSource2} onVideoClick={handleVideoClick} position={[2.2, 1.5, -5]} />
      <VideoPlane videoUrl={videoSource3} onVideoClick={handleVideoClick} position={[-2.2, 1.5, -5]} />

      {/* Tu cubo original */}
      <mesh rotation={[-0.5, 0, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="skyblue" />
      </mesh>
      
      {/* Agregamos el suelo a la escena */}
      <Floor />
    </Canvas>
  );
}
