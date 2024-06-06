import type { UserDbDeep, UserDto } from '../db/schema'

class UserMapper {
	toDto(db: UserDbDeep): UserDto {
		return {
			id: db.id,
			email: db.email,
			createdAt: db.createdAt,
			username: db.username,
			providers: db.oauths.map((o) => o.provider)
		}
	}
}
export const userMapper = new UserMapper()
