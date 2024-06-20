<script lang="ts">
	import { goto } from '$app/navigation'
	import { Button } from '$lib/components/ui/button'
	import Icon from '@iconify/svelte'
	import { Plus, ShieldCheck, X } from 'lucide-svelte'
	import QRCode from '@castlenine/svelte-qrcode'
	import * as Dialog from '$lib/components/ui/dialog'

	const { data } = $props()
	const user = $derived(data.user)

	async function deleteAccount() {
		await fetch(`/account/${user.id}`, {
			method: 'DELETE'
		})
		await goto('/auth/logout')
	}

	const notLinkedProviders = $derived(
		['github', 'mailru', 'yandex'].filter((p) => !user.providers.includes(p as any))
	)

	let totpUri: string | null = $state(null)
	async function createTOTP() {
		const res = await fetch('/auth/totp', {
			method: 'post',
			body: JSON.stringify({
				userId: user.id
			})
		})
		const { uri }: { uri: string } = await res.json()
		return uri
	}
</script>

<main class="container mt-8 flex flex-col gap-8">
	<h1 class="text-3xl font-bold">Account</h1>
	<div class="grid grid-cols-[max-content,1fr] gap-x-8 gap-y-2">
		<span>Username</span>
		<span>{user.username}</span>
		<span>Email</span>
		<span>{user.email}</span>
		<span>Your Providers</span>
		<div class="flex gap-4">
			{#each user.providers as provider (provider)}
				<form
					action="?/remove-provider"
					method="post"
					class="group relative flex h-32 w-48 items-center justify-center rounded-lg border bg-primary-foreground"
				>
					<input type="hidden" name="provider" value={provider} />
					{#if user.providers.length > 1}
						<button
							class="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100"
						>
							<X />
						</button>
					{/if}

					{#if provider === 'github'}
						<Icon width={50} icon="mdi:github"></Icon>
					{:else if provider === 'yandex'}
						<Icon width={70} icon="cib:yandex"></Icon>
					{:else if provider === 'mailru'}
						<Icon width={45} icon="cib:mail-ru"></Icon>
					{/if}
				</form>
			{/each}
		</div>
		{#if notLinkedProviders.length}
			<span>Add Providers</span>
			<div class="flex gap-4">
				{#each notLinkedProviders as provider (provider)}
					<form
						action="?/remove-provider"
						method="post"
						class="group relative flex h-32 w-48 items-center justify-center rounded-lg border bg-primary-foreground"
					>
						<input type="hidden" name="provider" value={provider} />
						<a
							href={`/auth/login/${provider}`}
							class="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100"
						>
							<Plus />
						</a>

						{#if provider === 'github'}
							<Icon width={50} icon="mdi:github"></Icon>
						{:else if provider === 'yandex'}
							<Icon width={70} icon="cib:yandex"></Icon>
						{:else if provider === 'mailru'}
							<Icon width={45} icon="cib:mail-ru"></Icon>
						{/if}
					</form>
				{/each}
			</div>
		{/if}
	</div>

	{#if user.totp}
		<div class="flex w-fit gap-4 rounded-lg bg-green-50 p-8">
			2-factor authentication
			<ShieldCheck class="text-green-500" />
		</div>
	{/if}
	<div class="">
		<Dialog.Root
			onOpenChange={async (isOpen) => {
				if (isOpen) totpUri = await createTOTP()
				else totpUri = null
			}}
		>
			<Dialog.Trigger>
				<Button>{user.totp ? 'Change TOTP' : 'Add TOTP'}</Button>
				<Dialog.Content>
					<Dialog.Header>Scan Qr code</Dialog.Header>

					{#if totpUri}
						<QRCode data={totpUri} />
					{/if}
				</Dialog.Content>
			</Dialog.Trigger>
		</Dialog.Root>
	</div>

	<div class="flex flex-col gap-2">
		<h6 class="font-bold text-red-500">Danger zone</h6>
		<Button type="submit" class="w-fit" variant="destructive" onclick={deleteAccount}
			>Delete account</Button
		>
	</div>
</main>
