/**
 * WebSocket Server for Real-time Updates
 * 监听~/.claude/目录变化并推送到连接的客户端
 */

import { WebSocketServer, WebSocket } from 'ws'
import { watch } from 'chokidar'
import { homedir } from 'os'
import path from 'path'
import { existsSync } from 'fs'

const TEAMS_DIR = path.join(homedir(), '.claude', 'teams')
const TASKS_DIR = path.join(homedir(), '.claude', 'tasks')
const CONVERSATIONS_DIR = path.join(homedir(), '.claude', 'conversations')

interface WsMessage {
  type: 'teams:update' | 'tasks:update' | 'conversations:update' | 'ping'
  data?: any
  timestamp: number
}

const clients = new Set<WebSocket>()

export function createWebSocketServer(port: number = 3001) {
  const wss = new WebSocketServer({ port })

  wss.on('connection', (ws) => {
    console.log('Client connected')
    clients.add(ws)

    // 发送初始数据
    sendToClient(ws, {
      type: 'ping',
      timestamp: Date.now(),
    })

    ws.on('close', () => {
      console.log('Client disconnected')
      clients.delete(ws)
    })

    ws.on('error', (error) => {
      console.error('WebSocket error:', error)
      clients.delete(ws)
    })

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString())
        // Handle client messages if needed
        console.log('Received:', message)
      } catch (error) {
        console.error('Failed to parse message:', error)
      }
    })
  })

  // 设置文件监听
  setupFileWatchers()

  // 定期ping保持连接
  setInterval(() => {
    broadcast({
      type: 'ping',
      timestamp: Date.now(),
    })
  }, 30000)

  console.log(`WebSocket server running on port ${port}`)
  return wss
}

function setupFileWatchers() {
  const watcherOptions = {
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 500,
      pollInterval: 100,
    },
  }

  // 监听teams目录
  if (existsSync(TEAMS_DIR)) {
    const teamsWatcher = watch(TEAMS_DIR, watcherOptions)
    teamsWatcher.on('change', (path) => {
      if (path.endsWith('config.json')) {
        broadcast({
          type: 'teams:update',
          timestamp: Date.now(),
        })
      }
    })
  }

  // 监听tasks目录
  if (existsSync(TASKS_DIR)) {
    const tasksWatcher = watch(TASKS_DIR, watcherOptions)
    tasksWatcher.on('all', (event, path) => {
      if (path && !path.endsWith('.lock')) {
        broadcast({
          type: 'tasks:update',
          timestamp: Date.now(),
        })
      }
    })
  }

  // 监听conversations目录
  if (existsSync(CONVERSATIONS_DIR)) {
    const convsWatcher = watch(CONVERSATIONS_DIR, watcherOptions)
    convsWatcher.on('all', () => {
      broadcast({
        type: 'conversations:update',
        timestamp: Date.now(),
      })
    })
  }
}

function broadcast(message: WsMessage) {
  const data = JSON.stringify(message)
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data)
    }
  })
}

function sendToClient(client: WebSocket, message: WsMessage) {
  if (client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify(message))
  }
}

// CLI运行支持
if (require.main === module) {
  const port = parseInt(process.env.WS_PORT || '3001')
  createWebSocketServer(port)
}
