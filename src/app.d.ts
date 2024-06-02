// See https://kit.svelte.dev/docs/types#app

import type { UserDto } from '$lib/types'

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: UserDto | null
			session: import("lucia").Session | null
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export { }
