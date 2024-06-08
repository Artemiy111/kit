<script lang="ts">
	import { enhance } from '$app/forms'
	import { Button, buttonVariants } from '$lib/components/ui/button'
	import { Input } from '$lib/components/ui/input'
	import type { UserDto } from '$lib/types'
	import { cn } from '$lib/utils'
	import { ImagePlus } from 'lucide-svelte'
	import type { HTMLAttributes } from 'svelte/elements'

	let {
		parentMessageId,
		user,
		onCreate,
		classes = ''
	}: {
		parentMessageId: number | null
		user: UserDto
		onCreate: (target: HTMLFormElement) => void
		classes?: HTMLAttributes<HTMLFormElement>['class']
	} = $props()

	let message = $state('')
	let files: File[] = $state([])
	let images: string[] = $derived(files.map((file) => URL.createObjectURL(file)))
	let fileInput: HTMLInputElement = $state(null!)

	$effect(() => {
		fileInput.files = null
	})

	function onsubmit(event: Event) {
		event.preventDefault()
		onCreate(event.target as HTMLFormElement)
	}

	function handleFileUpload(event: Event) {
		const newFiles = [...((event.target as HTMLInputElement).files || [])]
		files = [...files, ...newFiles]
		newFiles.forEach((file) => {
			const url = URL.createObjectURL(file)
			images.push(url)
		})
	}
	function removeFile(index: number) {
		files = files.splice(index, 1)
		// images = images.slice(index, 1)
	}
	const id = crypto.randomUUID()
</script>

<form
	action="?/create-message"
	method="post"
	{onsubmit}
	use:enhance
	enctype="multipart/form-data"
	class={cn('flex flex-col gap-4', classes)}
>
	{#if images.length}
		<div
			class="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 overflow-x-auto rounded-md border-2 border-secondary bg-slate-50 p-4"
		>
			{#each images as imageurl, i (i)}
				<div class="relative h-[200px] w-[200px]">
					<button class="absolute right-2 top-2 h-4 w-4" onclick={() => removeFile(i)}>x</button>
					<img class="border object-contain" alt="img" src={imageurl} />
				</div>
			{/each}
		</div>
	{/if}
	<div class="flex items-center gap-4">
		<label
			for={`images-upload-${id}`}
			class={cn(buttonVariants({ variant: 'outline' }), 'cursor-pointer')}
		>
			<ImagePlus /></label
		>
		<input
			bind:this={fileInput}
			id={`images-upload-${id}`}
			accept="image/jpg,image/jpg,image/png,image/webp"
			type="file"
			hidden
			class="hidden w-16"
			onchange={handleFileUpload}
			multiple
		/>
		<Input name="text" bind:value={message} placeholder="Start typing..." />
		<Button type="submit">+</Button>
		<input name="images" type="hidden" value={images} />
		<input name="authorId" type="hidden" value={user.id} />
		<input name="parentMessageId" type="hidden" value={parentMessageId} />
	</div>
</form>
