<script lang="ts">
	import * as Avatar from '$lib/components/ui/avatar'
	import { Button } from '$lib/components/ui/form'
	import type { MessageTreeDto, UserDto } from '$lib/types'
	import { Heart } from 'lucide-svelte'
	import MessageInput from './MessageInput.svelte'
	import { cn } from '$lib/utils'
	import { enhance } from '$app/forms'

	let { message, user }: { message: MessageTreeDto; user: UserDto | null } = $props()
	let isMe = $derived(message.authorId === user?.id)
	let isOnReply = $state(false)

	function formatDate(date: Date) {
		const timeZoneOffset = new Date().getTimezoneOffset()
		const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
		const zonedDate = new Date(date.getTime() - timeZoneOffset * 60 * 1000)
		const formatter = new Intl.DateTimeFormat('en-US', {
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			timeZone
		})
		return formatter.format(zonedDate)
	}
</script>

<div class="flex flex-col rounded-md border">
	<div class="group relative flex gap-4 p-4">
		<Avatar.Root>
			<Avatar.Image src="https://github.com/shadcn.png" alt="shadcn" />
			<Avatar.Fallback></Avatar.Fallback>
		</Avatar.Root>
		<div class="space-y-2">
			<div class="flex gap-4">
				<span class="font-bold {isMe ? 'text-blue-500' : 'text-black'}">
					{message.author.username}
				</span>
				<span>{formatDate(new Date(message.createdAt))}</span>
			</div>
			<span>
				{message.text}
			</span>

			{#if message.files.length}
				<div class="grid grid-cols-1 gap-4">
					{#each message.files as file (file)}
						<img
							class="h-full max-h-[50vh] w-full rounded-md object-contain"
							src={file.url}
							alt="img"
						/>
					{/each}
				</div>
			{/if}
		</div>

		{#if user}
			<div class="absolute right-4 top-4 flex items-center gap-4">
				<form
					use:enhance
					action="?/toggle-like"
					method="post"
					enctype="multipart/form-data"
					class="flex items-center"
				>
					<input name="messageId" type="hidden" value={message.id} />
					<button type="submit"
						><Heart
							class={cn(message.likes.find((l) => l.userId === user.id))
								? 'text-red-500'
								: 'text-black'}
						/></button
					>
				</form>
				<Button
					variant="ghost"
					class=" cursor-pointer opacity-0 transition-all duration-500 group-hover:opacity-100"
					onclick={() => (isOnReply = !isOnReply)}
				>
					Reply
				</Button>
			</div>
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
