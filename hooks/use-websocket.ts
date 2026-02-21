'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { toast } from 'sonner'

interface WebSocketMessage {
  type: 'teams:update' | 'tasks:update' | 'conversations:update' | 'ping'
  data?: any
  timestamp: number
}

interface UseWebSocketOptions {
  onTeamsUpdate?: () => void
  onTasksUpdate?: () => void
  onConversationsUpdate?: () => void
  enabled?: boolean
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    onTeamsUpdate,
    onTasksUpdate,
    onConversationsUpdate,
    enabled = true,
  } = options

  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected')
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttempts = useRef(0)
  const MAX_RECONNECT_ATTEMPTS = 5

  const connect = useCallback(() => {
    if (!enabled || wsRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    setConnectionStatus('connecting')

    try {
      const wsUrl = `ws://localhost:3001`
      const ws = new WebSocket(wsUrl)

      ws.onopen = () => {
        console.log('WebSocket connected')
        setIsConnected(true)
        setConnectionStatus('connected')
        reconnectAttempts.current = 0

        // 启动ping检查
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current)
        }
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }))
          } else {
            setIsConnected(false)
            setConnectionStatus('disconnected')
          }
        }, 30000)
      }

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)

          switch (message.type) {
            case 'teams:update':
              onTeamsUpdate?.()
              toast.info('Teams数据已更新')
              break
            case 'tasks:update':
              onTasksUpdate?.()
              toast.info('任务数据已更新')
              break
            case 'conversations:update':
              onConversationsUpdate?.()
              toast.info('对话数据已更新')
              break
            case 'ping':
              // 响应ping，保持连接
              break
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        toast.error('WebSocket连接错误')
      }

      ws.onclose = () => {
        console.log('WebSocket disconnected')
        setIsConnected(false)
        setConnectionStatus('disconnected')

        // 清理ping间隔
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current)
        }

        // 尝试重连
        if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttempts.current++
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000)

          toast.info(`WebSocket断开，${delay / 1000}秒后重连...`)

          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current)
          }
          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, delay)
        } else {
          toast.error('WebSocket连接失败，请刷新页面重试')
        }
      }

      wsRef.current = ws
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error)
      setConnectionStatus('disconnected')
    }
  }, [enabled, onTeamsUpdate, onTasksUpdate, onConversationsUpdate])

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current)
    }
    setIsConnected(false)
    setConnectionStatus('disconnected')
  }, [])

  const reconnect = useCallback(() => {
    disconnect()
    reconnectAttempts.current = 0
    setTimeout(() => connect(), 1000)
  }, [connect, disconnect])

  useEffect(() => {
    if (enabled) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [enabled, connect, disconnect])

  return {
    isConnected,
    connectionStatus,
    reconnect,
  }
}
