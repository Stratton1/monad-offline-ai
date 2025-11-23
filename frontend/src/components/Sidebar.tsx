/**
 * Sidebar.tsx
 * Purpose: Navigation sidebar component providing access to chat, settings, system status, and privacy controls.
 * Usage: Persistent sidebar in Dashboard layout, displays system information and navigation options.
 * Privacy: Shows local system status and privacy indicators, no external data transmission.
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  MessageSquare, 
  Settings, 
  RotateCcw, 
  Activity, 
  Cpu, 
  HardDrive,
  Wifi,
  WifiOff,
  ChevronLeft,
  ChevronRight,
  Palette
} from 'lucide-react'

import { MonadConfig } from '../lib/config'

interface SidebarProps {
  isConnected?: boolean
  onReconnect?: () => void
  config?: MonadConfig | null
}

function Sidebar({ isConnected = true, onReconnect = () => {}, config }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [theme, setTheme] = useState(config?.theme || "dark")

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  const cycleTheme = () => {
    const next = theme === "dark" ? "dim" : theme === "dim" ? "midnight" : "dark"
    setTheme(next)
    document.body.dataset.theme = next
  }

  if (isCollapsed) {
    return (
      <div className="w-16 glass-strong border-r border-white/10 flex flex-col items-center py-4 space-y-4">
        <button
          onClick={toggleSidebar}
          className="p-2 hover:glass rounded-lg transition-all duration-200"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
        
        <div className="flex flex-col space-y-4">
          <div className="p-2 glass rounded-lg">
            <MessageSquare className="w-5 h-5" />
          </div>
          
          <button
            onClick={onReconnect}
            className={`p-2 rounded-lg transition-all duration-200 ${
              isConnected ? 'glass' : 'bg-red-500/20 hover:bg-red-500/30'
            }`}
            title="Reconnect Backend"
          >
            {isConnected ? <Wifi className="w-5 h-5 text-green-400" /> : <WifiOff className="w-5 h-5 text-red-400" />}
          </button>
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:glass rounded-lg transition-all duration-200"
          >
            <Settings className="w-5 h-5" />
          </button>
          
          <button
            onClick={cycleTheme}
            className="p-2 hover:glass rounded-lg transition-all duration-200"
            title={`Theme: ${theme}`}
          >
            <Palette className="w-5 h-5" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <motion.aside
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="w-80 glass-strong border-r border-white/10 flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <h2 className="text-lg font-semibold gradient-text">MONAD</h2>
        <button
          onClick={toggleSidebar}
          className="p-1 hover:glass rounded transition-all duration-200"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Connection Status */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-300">Backend Status</span>
          <div className={`flex items-center space-x-2 ${
            isConnected ? 'text-green-400' : 'text-red-400'
          }`}>
            {isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            <span className="text-sm font-medium">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
        
        <button
          onClick={onReconnect}
          className="w-full button-secondary flex items-center justify-center space-x-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reconnect Backend</span>
        </button>
      </div>

      {/* System Info */}
      <div className="p-4 border-b border-white/10">
        <h3 className="text-sm font-medium text-gray-300 mb-3">System Status</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-blue-400" />
              <span className="text-gray-400">CPU</span>
            </div>
            <span className="text-gray-300">45%</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-green-400" />
              <span className="text-gray-400">Memory</span>
            </div>
            <span className="text-gray-300">2.1GB</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <HardDrive className="w-4 h-4 text-purple-400" />
              <span className="text-gray-400">Model</span>
            </div>
            <span className="text-gray-300">TinyLlama</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-b border-white/10">
        <h3 className="text-sm font-medium text-gray-300 mb-3">Quick Actions</h3>
        <div className="space-y-2">
          <button className="w-full text-left p-2 hover:glass rounded-lg transition-all duration-200 text-sm">
            Clear Chat History
          </button>
          <button className="w-full text-left p-2 hover:glass rounded-lg transition-all duration-200 text-sm">
            Export Conversation
          </button>
          <button className="w-full text-left p-2 hover:glass rounded-lg transition-all duration-200 text-sm">
            Model Settings
          </button>
          <button 
            onClick={cycleTheme}
            className="w-full text-left p-2 hover:glass rounded-lg transition-all duration-200 text-sm flex items-center space-x-2"
          >
            <Palette className="w-4 h-4" />
            <span>Theme ({theme})</span>
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="p-4 border-b border-white/10">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Settings</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Temperature</label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                defaultValue="0.7"
                className="w-full"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Max Tokens</label>
              <input
                type="range"
                min="100"
                max="1024"
                step="50"
                defaultValue="512"
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-auto p-4">
        <div className="text-xs text-gray-500 text-center">
          <p>MONAD v1.0.0</p>
          <p>Offline AI Assistant</p>
        </div>
      </div>
    </motion.aside>
  )
}

export default Sidebar
