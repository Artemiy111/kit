import 'dotenv/config'
// import { drizzle } from 'drizzle-orm/libsql'
// import { createClient } from '@libsql/client'
// import { DB_URL, DB_TOKEN } from '$env/static/private'

import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'
// import { Database } from 'bun:sqlite'
import Database from 'better-sqlite3'

export const client = new Database('./sqlite.db')
export const db = drizzle(client, { schema })

// export const client = createClient({ url: process.env.DB_URL!, authToken: process.env.DB_TOKEN! })
// export const db = drizzle(client, { schema })
