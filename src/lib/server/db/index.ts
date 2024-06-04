import 'dotenv/config'
import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import { DB_URL, DB_TOKEN } from '$env/static/private'
import * as schema from './schema'

export const client = createClient({ url: process.env.DB_URL!, authToken: process.env.DB_TOKEN! })
export const db = drizzle(client, { schema })
