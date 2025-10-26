import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import StartupScreen from './components/StartupScreen'
import Chat from './components/Chat'
import Sidebar from './components/Sidebar'
import { useBackend } from './hooks/useBackend'

function App() {
  const [loaded, setLoaded] = useState(false)
  const { isConnected, reconnect } = useBackend()

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 2600)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-[#0f1115] to-[#1a1e27] text-gray-100">
      <AnimatePresence mode="wait">
        {!loaded ? (
          <StartupScreen key="startup" />
        ) : (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex h-full w-full"
          >
            {/* Sidebar */}
            <Sidebar isConnected={isConnected} onReconnect={reconnect} />
            
            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
              <Chat />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
