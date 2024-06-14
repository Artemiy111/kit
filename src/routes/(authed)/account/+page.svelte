<script lang="ts">
	import { goto } from '$app/navigation'
	import { Button } from '$lib/components/ui/button'

	const { data } = $props()
	const user = $derived(data.user)

	async function deleteAccount() {
		await fetch(`/account/${user.id}`, {
			method: 'DELETE'
		})
		await goto('/auth/logout')
	}
</script>

<main class="container mt-8 flex flex-col gap-8">
	<h1 class="text-3xl font-bold">Account</h1>
	<div class="grid grid-cols-[max-content,1fr] gap-x-8 gap-y-2">
		<span>Username</span>
		<span>{user.username}</span>
		<span>Email</span>
		<span>{user.email}</span>
		<span>Providers</span>
		<span>{@html user.providers.join('&nbsp;&nbsp;')}</span>
	</div>

	<div class="flex flex-col gap-2">
		<h6 class="font-bold text-red-500">Danger zone</h6>
		<Button type="submit" class="w-fit" variant="destructive" onclick={deleteAccount}
			>Delete account</Button
		>
	</div>
</main>
