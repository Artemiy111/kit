<script lang="ts">
	import { Input } from '$lib/components/ui/input'
	import * as Avatar from '$lib/components/ui/avatar'
	import Button from '$lib/components/ui/button/button.svelte'
	import Label from '$lib/components/ui/label/label.svelte'
	import { buttonVariants } from '$lib/components/ui/button'
	import { ImagePlus } from 'lucide-svelte'
	import { cn } from '$lib/utils'
	import { type MessageDbTreeDto } from '$lib/types'
	import { enhance } from '$app/forms'

	const { data } = $props()
	const { messages, user } = data

	let message = $state('')
</script>

{#snippet message_box( message: MessageDbTreeDto)}
	{@const isMe = message.authorId === user?.id}
	<div class="grid grid-cols-[max-content,1fr] gap-4 p-2 {isMe ? 'bg-blue-200' : 'bg-green-200'}">
		<Avatar.Root>
			<Avatar.Image src="https://github.com/shadcn.png" alt="shadcn" />
			<Avatar.Fallback></Avatar.Fallback>
		</Avatar.Root>
		<p>
			{message.text}
		</p>
		<div class="ml-4">
			{#each message.replies as reply}
				{@render message_box(reply)}
			{/each}
		</div>
	</div>
{/snippet}

<main class="container max-w-[600px]">
	{#if user}
		<form
			action="?/create-message"
			method="post"
			enctype="multipart/form-data"
			use:enhance
			class="mt-8 flex flex-col gap-4"
		>
			<div
				class="grid auto-rows-auto grid-cols-[repeat(auto-fit,minmax(100px,1fr))] gap-4 rounded-md border-2 border-secondary bg-slate-50 p-4"
			>
				<img
					class="max-h-48 w-fit object-contain"
					alt="img"
					src="https://sun1-56.userapi.com/impg/yz7CDsNecx1dj9CVtQyL77HkcgqSb1jw5t8bVQ/KhsICPL7yYM.jpg?size=828x823&quality=96&sign=88cd8f34060c5ba2e8642963a95e571f&c_uniq_tag=VDRCLz3zfnKXma70HH0omMw6Z2JHWY01Z2iHpBTy94M&type=album"
				/>
				<img
					class="max-h-48 w-fit object-contain"
					alt="img"
					src="https://sun1-56.userapi.com/impg/yz7CDsNecx1dj9CVtQyL77HkcgqSb1jw5t8bVQ/KhsICPL7yYM.jpg?size=828x823&quality=96&sign=88cd8f34060c5ba2e8642963a95e571f&c_uniq_tag=VDRCLz3zfnKXma70HH0omMw6Z2JHWY01Z2iHpBTy94M&type=album"
				/>
				<img
					class="max-h-48 w-fit object-contain"
					alt="img"
					src="https://sun1-56.userapi.com/impg/yz7CDsNecx1dj9CVtQyL77HkcgqSb1jw5t8bVQ/KhsICPL7yYM.jpg?size=828x823&quality=96&sign=88cd8f34060c5ba2e8642963a95e571f&c_uniq_tag=VDRCLz3zfnKXma70HH0omMw6Z2JHWY01Z2iHpBTy94M&type=album"
				/>
			</div>
			<div class="flex items-center gap-4">
				<label for="images" class={cn(buttonVariants({ variant: 'outline' }), 'cursor-pointer')}>
					<ImagePlus /></label
				>
				<input
					id="images"
					name="images"
					accept="image/jpg,image/jpg,image/png,image/webp"
					type="file"
					class="hidden w-16"
					multiple
				/>
				<Input name="text" bind:value={message} placeholder="Start typing..." />
				<Button type="submit">+</Button>
				<input name="authorId" type="text" bind:value={user.id} class="hidden" />
			</div>
		</form>
	{/if}
	<div class="mx-auto my-8 grid max-w-[600px] grid-cols-1 gap-4 bg-slate-50 p-4">
		{#if !messages.length}
			<div class="flex">Здесь пока ничего нет</div>
		{/if}

		{#each messages as msg (msg.id)}
			{@render message_box(msg)}
		{/each}
	</div>
</main>
