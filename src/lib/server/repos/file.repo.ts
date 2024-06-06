import { db } from '../db'
import { files, type FileDbCreate } from '../db/schema'

export async function createFile(create: FileDbCreate) {
	return (await db.insert(files).values(create).returning())[0]
}
