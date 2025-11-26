/**
 * useBackend.ts
 * Hook for monitoring backend connectivity/health with robust retry logic
 * Handles model loading states and provides backoff retry during boot
 * Privacy: Performs local HTTP calls to the bundled backend only; no external network use.
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import { checkHealth, checkDetailedHealth } from '../utils/api'
import type { SimpleHealthResponse } from '../utils/api'

export type BackendState = 
  | 'connecting'    // Initial connection attempt
  | 'booting'       // Backend is starting/loading model
  | 'healthy'       // Fully operational
  | 'degraded'      // Backend running but model not loaded
  | 'offline'       // Cannot connect

export function useBackend() {
  const [state, setState] = useState<BackendState>('connecting')
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [healthData, setHealthData] = useState<SimpleHealthResponse | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [retryDelay, setRetryDelay] = useState(1000) // Start with 1s
  
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isCheckingRef = useRef(false)

  const checkConnection = useCallback(async () => {
    // Prevent concurrent checks
    if (isCheckingRef.current) {
      return
    }
    
    isCheckingRef.current = true
    
    try {
      setError(null)

      const health = await checkHealth()
      const status = health.status
      
      setHealthData(health)
      
      // Determine backend state based on response
      if (status === 'ok' || status === 'healthy') {
        setState('healthy')
        setIsConnected(true)
        setRetryCount(0)
        setRetryDelay(1000) // Reset delay
      } else if (status === 'booting') {
        setState('booting')
        setIsConnected(false)
        // Keep retrying during boot with current delay
      } else if (status === 'degraded') {
        setState('degraded')
        setIsConnected(true) // Backend is up, just no model
        setRetryCount(0)
        setRetryDelay(1000)
      } else {
        // warning, error, unknown
        setState('offline')
        setIsConnected(false)
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Connection failed'
      
      // Don't spam console during expected boot phase
      if (retryCount < 36) { // First 3 minutes (36 * 5s intervals)
        console.debug(`Backend check ${retryCount + 1}: ${errorMessage}`)
      } else {
        console.warn(`Backend still not responding after ${retryCount} attempts`)
      }
      
      setState('offline')
      setIsConnected(false)
      setError(errorMessage)
      setHealthData(null)
      
      // Increment retry count
      setRetryCount(prev => prev + 1)
      
      // Exponential backoff: 1s -> 2s -> 4s -> 8s -> max 20s
      setRetryDelay(prev => Math.min(prev * 2, 20000))
      
    } finally {
      isCheckingRef.current = false
    }
  }, [retryCount])

  const reconnect = useCallback(async () => {
    setRetryCount(0)
    setRetryDelay(1000)
    await checkConnection()
  }, [checkConnection])

  const getDetailedHealth = useCallback(async () => {
    try {
      const health = await checkDetailedHealth()
      return health
    } catch (err) {
      throw err
    }
  }, [])

  // Initial check and periodic polling
  useEffect(() => {
    checkConnection()
    
    // Clear any existing timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
    }
    
    // Schedule next check based on state
    let nextCheckDelay: number
    
    if (state === 'healthy' || state === 'degraded') {
      // Normal operation: check every 30 seconds
      nextCheckDelay = 30000
    } else if (state === 'booting') {
      // Model loading: check more frequently (every 5 seconds)
      nextCheckDelay = 5000
    } else {
      // Offline/connecting: use backoff delay
      nextCheckDelay = retryDelay
    }
    
    retryTimeoutRef.current = setTimeout(checkConnection, nextCheckDelay)
    
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
    }
  }, [checkConnection, state, retryDelay])

  return {
    state,
    isConnected,
    error,
    healthData,
    retryCount,
    retryDelay,
    checkConnection,
    reconnect,
    getDetailedHealth,
  }
}
