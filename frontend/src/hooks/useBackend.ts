/**
 * useBackend.ts
 * Hook for monitoring backend connectivity/health for the local FastAPI service.
 * Used by chat input and status indicators to gate interactions when backend is offline.
 * Privacy: Performs local HTTP calls to the bundled backend only; no external network use.
 */
import { useState, useEffect, useCallback } from 'react'
import { checkHealth } from '../utils/api'
import type { SimpleHealthResponse } from '../utils/api'

export function useBackend() {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [healthData, setHealthData] = useState<SimpleHealthResponse | null>(null)

  const checkConnection = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const health = await checkHealth()
      const isHealthy = health.status === 'ok' || health.status === 'healthy'
      setIsConnected(isHealthy)
      setHealthData(health)
    } catch (err) {
      setIsConnected(false)
      setError(err instanceof Error ? err.message : 'Connection failed')
      setHealthData(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const reconnect = useCallback(async () => {
    await checkConnection()
  }, [checkConnection])

  const getDetailedHealth = useCallback(async () => {
    try {
      const health = await checkHealth()
      setHealthData(health)
      return health
    } catch (err) {
      throw err
    }
  }, [])

  // Check connection on mount and periodically
  useEffect(() => {
    checkConnection()
    
    const interval = setInterval(checkConnection, 30000) // Check every 30 seconds
    
    return () => clearInterval(interval)
  }, [checkConnection])

  return {
    isConnected,
    isLoading,
    error,
    healthData,
    checkConnection,
    reconnect,
    getDetailedHealth,
  }
}
