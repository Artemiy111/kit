<script lang="ts">
	import { Input } from '$lib/components/ui/input'
	import * as Avatar from '$lib/components/ui/avatar'
	import Button from '$lib/components/ui/button/button.svelte'
	import Label from '$lib/components/ui/label/label.svelte'
	import { buttonVariants } from '$lib/components/ui/button'
	import { ImagePlus } from 'lucide-svelte'
	import { cn } from '$lib/utils'
	import { type MessageDbTreeDto } from '$lib/types'
	import { applyAction, deserialize, enhance } from '$app/forms'
	import { invalidate, invalidateAll } from '$app/navigation'
	import { redirect, type ActionResult } from '@sveltejs/kit'
	import Message from './Message.svelte'
	import MessageInput from './MessageInput.svelte'

	let { data, form } = $props()
	let messages = $derived(data.messages)
	let user = $derived(data.user)
	let message = $state('')

	$effect(() => {
		console.log(user)
	})

	async function createMessage(target: HTMLFormElement) {
		// const data = new FormData(target)
		// const response = await fetch(target.action, {
		// 	method: 'POST',
		// 	body: data
		// })
		// const result: ActionResult = deserialize(await response.text())
		// await applyAction(result)
	}
</script>

<main class="container max-w-[800px]">
	{#if user}
		<MessageInput classes="mt-8" parentMessageId={null} onCreate={createMessage} {user} />
	{/if}
	<div class="mx-auto my-4 grid grid-cols-1 gap-4">
		{#if !messages.length}
			<div class="flex">Здесь пока ничего нет</div>
		{/if}

		{#each messages as msg (msg.id)}
			<Message message={msg} {user} />
		{/each}
	</div>
</main>
