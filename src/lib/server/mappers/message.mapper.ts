import type { MessageTreeDb, MessageTreeDto } from '../db/schema'
import { getFileUrl } from '../repos/file.repo'

class MessageMapper {
  toDto(db: MessageTreeDb): MessageTreeDto {
    return {
      ...db,
      files: db.files.map(file => ({
        messageId: file.messageId,
        id: file.file.id,
        url: getFileUrl(file.file.id)
      }))
    }
  }
}
export const messageMapper = new MessageMapper()