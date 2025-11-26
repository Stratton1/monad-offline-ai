/**
 * BootScreen.tsx
 * Purpose: Renders the cinematic 3D boot sequence with Three.js animation, progress bar, and boot messages.
 * Usage: Displayed on application startup before transitioning to SetupWizard or Dashboard.
 * Privacy: Reads user config from localStorage to personalize boot messages, no data transmission.
 */

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import { loadConfig } from "../lib/config";
import { isBrowser } from "../lib/env";
import { devResetApp } from "../lib/reset";

export default function BootScreen({ onComplete }: { onComplete: () => void }) {
  console.log("[BootScreen] Component mounted");
  
  const [progress, setProgress] = useState(0);
  const [bootText, setBootText] = useState("Initializing neural core...");
  const [userName, setUserName] = useState("");
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isBrowser()) return;
    const config = loadConfig();
    if (config?.userName) {
      setUserName(config.userName);
    }
  }, []);

  const bootMessages = [
    "Initializing neural core...",
    "Loading language models...",
    "Calibrating emotional matrix...",
    "Establishing secure connection...",
    "Optimizing cognitive pathways...",
    "Synchronizing preferences...",
    "MONAD is ready."
  ];

  useEffect(() => {
    if (!isBrowser()) return;
    console.log("🚀 BootScreen: Starting boot sequence");
    
    const interval = setInterval(() => {
      setProgress((p) => {
        const newProgress = p + Math.random() * 8 + 2;
        if (newProgress >= 100) {
          clearInterval(interval);
          console.log("✅ BootScreen: Progress complete, calling onComplete");
          setTimeout(() => {
            setBootText("MONAD is ready.");
            setTimeout(() => {
              console.log("✅ BootScreen: Calling onComplete callback");
              onComplete();
            }, 1000);
          }, 500);
          return 100;
        }
        return newProgress;
      });
    }, 300);

    return () => clearInterval(interval);
  }, [onComplete]);

  // Hard fallback: ensure onComplete is called even if progress fails
  useEffect(() => {
    const hardFailTimer = setTimeout(() => {
      console.warn("⚠️ BootScreen: Hard fallback triggered — forcing onComplete");
      onComplete();
    }, 15000); // hard fail after 15s
    
    return () => clearTimeout(hardFailTimer);
  }, [onComplete]);

  // Additional safety timer: force complete after 10s regardless
  useEffect(() => {
    const forceTimer = setTimeout(() => {
      console.log("✅ BootScreen: Forcing complete after 10 s");
      onComplete();
    }, 10000);
    return () => clearTimeout(forceTimer);
  }, [onComplete]);

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setBootText((prev) => {
        const currentIndex = bootMessages.indexOf(prev);
        const nextIndex = (currentIndex + 1) % bootMessages.length;
        return bootMessages[nextIndex];
      });
    }, 800);

    return () => clearInterval(messageInterval);
  }, []);

  useEffect(() => {
    if (!isBrowser()) return;
    if (!mountRef.current) return;

    // Create 3D scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    // Create torus knot geometry
    const geometry = new THREE.TorusKnotGeometry(1, 0.4, 100, 16);
    const material = new THREE.MeshStandardMaterial({ 
      color: 0x0099ff, 
      metalness: 0.8, 
      roughness: 0.3,
      emissive: 0x001122,
      emissiveIntensity: 0.2
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(3, 3, 3);
    scene.add(pointLight);

    const directionalLight = new THREE.DirectionalLight(0x0099ff, 0.5);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    camera.position.z = 4;

    // Animation loop
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      mesh.rotation.x += 0.005;
      mesh.rotation.y += 0.01;
      mesh.rotation.z += 0.002;
      renderer.render(scene, camera);
    };
    animate();

    sceneRef.current = scene;
    rendererRef.current = renderer;

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-black via-slate-900 to-blue-900 text-white font-sans overflow-hidden"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.5 }}
      >
        {/* 3D Background */}
        <div ref={mountRef} className="absolute inset-0 w-full h-full opacity-40" />
        
        {/* Logo */}
        <motion.div
          className="relative z-10 flex flex-col items-center"
          initial={{ opacity: 0, scale: 0.5, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 2, ease: "easeOut" }}
        >
          <div className="w-32 h-32 mb-8 relative">
            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse" />
            <img
              src="/MONAD_Logo.svg"
              alt="MONAD"
              className="w-full h-full relative z-10 drop-shadow-2xl"
            />
          </div>
          
          <motion.h1
            className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 1 }}
          >
            MONAD
          </motion.h1>
          
          {userName && (
            <motion.div
              className="text-lg text-slate-300 mb-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.8 }}
            >
              Hello, {userName}
            </motion.div>
          )}
          
          <motion.div
            className="text-lg text-slate-300 mb-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
          >
            {bootText}
          </motion.div>
          
          {/* Progress Bar */}
          <motion.div
            className="w-80 h-2 bg-slate-800 rounded-full overflow-hidden mb-4"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 1.8, duration: 0.8 }}
          >
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
          
          <motion.div
            className="text-sm text-slate-500"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            {Math.min(progress, 100).toFixed(0)}% complete
          </motion.div>
        </motion.div>

        {import.meta.env.DEV && (
          <button
            type="button"
            className="absolute bottom-4 left-4 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/20 hover:border-red-500/50 text-xs font-medium transition-all duration-200 backdrop-blur-sm shadow-lg hover:shadow-red-500/20"
            onClick={() => {
              console.log("[DevReset] Reset button clicked");
              void devResetApp();
            }}
            title="Wipe all local data and restart (Dev Mode Only)"
          >
            🔄 Reset App
            <span className="ml-1 text-red-500/60">(Dev)</span>
          </button>
        )}

        {/* Ambient particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-blue-400/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
