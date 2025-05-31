'use server'

import fs from 'fs/promises'
import path from 'path'

const TOKENS_FILE = path.join(process.cwd(), 'app/data/tokens.json')

export async function subscribeUser(token: string) {
  try {
    const data = await fs.readFile(TOKENS_FILE, 'utf-8')
    const tokens = JSON.parse(data)
    
    if (!tokens.tokens.includes(token)) {
      tokens.tokens.push(token)
      await fs.writeFile(TOKENS_FILE, JSON.stringify(tokens, null, 2))
    }
    
    return { success: true }
  } catch (error) {
    console.error('Error saving token:', error)
    return { success: false, error: 'Failed to save token' }
  }
}

export async function unsubscribeUser(token: string) {
  try {
    const data = await fs.readFile(TOKENS_FILE, 'utf-8')
    const tokens = JSON.parse(data)
    
    tokens.tokens = tokens.tokens.filter((t: string) => t !== token)
    await fs.writeFile(TOKENS_FILE, JSON.stringify(tokens, null, 2))
    
    return { success: true }
  } catch (error) {
    console.error('Error removing token:', error)
    return { success: false, error: 'Failed to remove token' }
  }
}

export async function getAllTokens() {
  try {
    const data = await fs.readFile(TOKENS_FILE, 'utf-8')
    const tokens = JSON.parse(data)
    return { success: true, tokens: tokens.tokens }
  } catch (error) {
    console.error('Error reading tokens:', error)
    return { success: false, error: 'Failed to read tokens' }
  }
}