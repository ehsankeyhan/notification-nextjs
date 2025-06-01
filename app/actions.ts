'use server'

import fs from 'fs/promises'
import path from 'path'

const TOKENS_FILE = path.join(process.cwd(), 'public/tokens.json')

// Ensure the tokens file exists with initial structure
async function ensureTokensFile() {
  try {
    await fs.access(TOKENS_FILE)
  } catch {
    // File doesn't exist, create it with initial structure
    await fs.writeFile(TOKENS_FILE, JSON.stringify({ tokens: [] }, null, 2))
  }
}

export async function subscribeUser(token: string) {
  try {
    await ensureTokensFile()
    const data = await fs.readFile(TOKENS_FILE, 'utf-8')
    const tokens = JSON.parse(data)
    
    // Check if token already exists
    const existingTokenIndex = tokens.tokens.findIndex((t: any) => t.token === token)
    
    if (existingTokenIndex === -1) {
      // Add new token with timestamp
      tokens.tokens.push({
        token,
        addedAt: new Date().toISOString()
      })
    } else {
      // Update timestamp for existing token
      tokens.tokens[existingTokenIndex].addedAt = new Date().toISOString()
    }
    
    await fs.writeFile(TOKENS_FILE, JSON.stringify(tokens, null, 2))
    return { success: true }
  } catch (error) {
    console.error('Error saving token:', error)
    return { success: false, error: 'Failed to save token' }
  }
}

export async function unsubscribeUser(token: string) {
  try {
    await ensureTokensFile()
    const data = await fs.readFile(TOKENS_FILE, 'utf-8')
    const tokens = JSON.parse(data)
    
    tokens.tokens = tokens.tokens.filter((t: any) => t.token !== token)
    await fs.writeFile(TOKENS_FILE, JSON.stringify(tokens, null, 2))
    
    return { success: true }
  } catch (error) {
    console.error('Error removing token:', error)
    return { success: false, error: 'Failed to remove token' }
  }
}

export async function getAllTokens() {
  try {
    await ensureTokensFile()
    const data = await fs.readFile(TOKENS_FILE, 'utf-8')
    const tokens = JSON.parse(data)
    return { success: true, tokens: tokens.tokens.map((t: any) => t.token) }
  } catch (error) {
    console.error('Error reading tokens:', error)
    return { success: false, error: 'Failed to read tokens' }
  }
}