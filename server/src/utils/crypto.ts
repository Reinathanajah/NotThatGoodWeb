import crypto from 'node:crypto'
import bcrypt from 'bcryptjs'
import jwt, { type SignOptions } from 'jsonwebtoken'
import { env } from '../config/env.js'

const BCRYPT_ROUNDS = 10

export interface AccessTokenPayload {
  sub: string
  role: string
  jti: string
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS)
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash)
}

export function sha256Hex(value: string | Buffer): string {
  return crypto.createHash('sha256').update(value).digest('hex')
}

export function generateOpaqueToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('hex')
}

export function signAccessToken(payload: AccessTokenPayload): string {
  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
  }
  return jwt.sign(payload, env.JWT_SECRET, options)
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET)
  if (
    typeof decoded !== 'object' ||
    decoded === null ||
    typeof decoded.sub !== 'string' ||
    typeof decoded.role !== 'string' ||
    typeof decoded.jti !== 'string'
  ) {
    throw new Error('Invalid token payload')
  }
  return {
    sub: decoded.sub,
    role: decoded.role,
    jti: decoded.jti,
  }
}

export function computeJwtExpiration(expiresIn = env.JWT_EXPIRES_IN): Date {
  const match = /^(\d+)([smhd])$/.exec(expiresIn.trim())
  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
  }
  if (!match) {
    return new Date(Date.now() + 7 * 86_400_000)
  }
  const amount = Number(match[1])
  const unitMs = multipliers[match[2]] ?? 86_400_000
  return new Date(Date.now() + amount * unitMs)
}
