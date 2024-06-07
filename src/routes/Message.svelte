<script lang="ts">
	import * as Avatar from '$lib/components/ui/avatar'
	import { Button } from '$lib/components/ui/form'
	import { Input } from '$lib/components/ui/input'
	import type { MessageDbTreeDto, UserDto } from '$lib/types'
	import MessageInput from './MessageInput.svelte'

	let { message, user }: { message: MessageDbTreeDto; user: UserDto | null } = $props()
	let isMe = $derived(message.authorId === user?.id)
	let isOnReply = $state(false)
</script>

<div class="group relative grid grid-cols-[max-content,1fr] gap-4 rounded-md border p-4">
	{#if user}
		<Button
			variant="ghost"
			class="absolute right-2 top-2 cursor-pointer opacity-0 transition-all duration-500 group-hover:opacity-100"
			onclick={() => (isOnReply = !isOnReply)}
		>
			Reply
		</Button>
	{/if}
	<div class="flex gap-4">
		<Avatar.Root>
			<Avatar.Image src="https://github.com/shadcn.png" alt="shadcn" />
			<Avatar.Fallback></Avatar.Fallback>
		</Avatar.Root>
	</div>
	<div class="flex w-full flex-col gap-1">
		<span class="font-bold {isMe ? 'text-blue-500' : 'text-black'}">
			{message.author.username}
		</span>
		<p>
			{message.text}
		</p>
		{#if user && isOnReply}
			<MessageInput {user} parentMessageId={message.id} onCreate={() => {}}></MessageInput>
		{/if}
		{#if message.replies.length}
			<div class="ml-4">
				{#each message.replies as reply}
					<svelte:self message={reply} {user}></svelte:self>
				{/each}
				<!-- {@render message_box(reply)} -->
			</div>
		{/if}
	</div>
</div>
