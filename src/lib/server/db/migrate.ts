import 'dotenv/config'
import { migrate } from 'drizzle-orm/libsql/migrator'
import { db, client } from '.'
await migrate(db, { migrationsFolder: './drizzle' })
client.close() 