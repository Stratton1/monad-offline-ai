import { useState, useEffect, useCallback } from 'react'
import { checkHealth } from '../utils/api'

export function useBackend() {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [healthData, setHealthData] = useState<any>(null)

  const checkConnection = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const isHealthy = await checkHealth()
      setIsConnected(isHealthy)
      setHealthData({ status: isHealthy ? 'ok' : 'error' })
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
      const isHealthy = await checkHealth()
      const health = { status: isHealthy ? 'ok' : 'error' }
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
