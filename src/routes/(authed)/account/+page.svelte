<script lang="ts">
	import { goto, invalidate } from '$app/navigation'
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

<main class="container mt-16 flex flex-col gap-4">
	<h1 class="text-3xl font-bold">Account</h1>
	{user.username}
	{user.providers}

	<Button type="submit" class="w-fit" variant="destructive" onclick={deleteAccount}
		>Удалить аккаунт</Button
	>
</main>
