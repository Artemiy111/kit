import { db } from '../db'
import { files, type FileId, type FileDbCreate } from '../db/schema'
import { s3 } from '$lib/server/s3'
import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { BUCKET_NAME, ENDPOINT_URL } from '$env/static/private'
import { eq } from 'drizzle-orm'


export function getFileUrl(id: FileId) {
	return `${ENDPOINT_URL}/${BUCKET_NAME}/${id}`
}

export async function createFile(file: File) {
	const id = crypto.randomUUID()
	await s3.send(new PutObjectCommand({ Bucket: BUCKET_NAME, Key: id, Body: await file.arrayBuffer() }))

	return (await db.insert(files).values({ id }).returning())[0]
}

export async function deleteFile(id: FileId) {
	await s3.send(new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: id }))
	await db.delete(files).where(eq(files.id, id))
}
