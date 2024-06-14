<script lang="ts">
	import Message from './Message.svelte'
	import MessageInput from './MessageInput.svelte'

	let { data, form } = $props()
	let messages = $derived(data.messages)
	let user = $derived(data.user)

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
	<div class="mx-auto mt-4 grid grid-cols-1 gap-4">
		{#if !messages.length}
			<div class="flex justify-center py-4">Здесь пока ничего нет</div>
		{/if}

		{#each messages as msg (msg.id)}
			<Message message={msg} {user} />
		{/each}
	</div>
</main>
