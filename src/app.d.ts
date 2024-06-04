// See https://kit.svelte.dev/docs/types#app

import type { UserDbDeep } from '$lib/types'

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: UserDbDeep | null
			session: import("lucia").Session | null
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export { }
