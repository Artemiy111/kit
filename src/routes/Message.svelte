<script lang="ts">
	import * as Avatar from '$lib/components/ui/avatar'
	import { Button } from '$lib/components/ui/form'
	import { Input } from '$lib/components/ui/input'
	import type { MessageDbTreeDto, UserDto } from '$lib/types'
	import MessageInput from './MessageInput.svelte'

	let { message, user }: { message: MessageDbTreeDto; user: UserDto | null } = $props()
	let isMe = $derived(message.authorId === user?.id)
	let isOnReply = $state(false)

	function formatDate(date: Date) {
		const timeZoneOffset = new Date().getTimezoneOffset()
		const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
		const zonedDate = new Date(date.getTime() - timeZoneOffset * 60 * 1000)
		const formatter = new Intl.DateTimeFormat('ru-RU', {
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			timeZone
		})
		return formatter.format(zonedDate)
	}
</script>

<div class="flex flex-col rounded-md border pb-4">
	<div class="group relative flex gap-4 p-4">
		<Avatar.Root>
			<Avatar.Image src="https://github.com/shadcn.png" alt="shadcn" />
			<Avatar.Fallback></Avatar.Fallback>
		</Avatar.Root>
		<div class="">
			<div class="flex gap-4">
				<span class="font-bold {isMe ? 'text-blue-500' : 'text-black'}">
					{message.author.username}
				</span>
				<span>{formatDate(new Date(message.createdAt))}</span>
			</div>
			<p>
				{message.text}
			</p>
		</div>
		{#if user}
			<Button
				variant="ghost"
				class="absolute right-2 top-2 cursor-pointer opacity-0 transition-all duration-500 group-hover:opacity-100"
				onclick={() => (isOnReply = !isOnReply)}
			>
				Reply
			</Button>
		{/if}
	</div>
	<div class="flex w-full flex-col gap-1 pl-4 pr-1">
		{#if user && isOnReply}
			<MessageInput {user} classes="mb-2 mr-3" parentMessageId={message.id} onCreate={() => {}}
			></MessageInput>
		{/if}
		{#if message.replies.length}
			<div class="flex flex-col gap-4">
				{#each message.replies as reply}
					<svelte:self message={reply} {user}></svelte:self>
				{/each}
			</div>
		{/if}
	</div>
</div>
