<script lang="ts">
	import { enhance } from '$app/forms'
	import { Button, buttonVariants } from '$lib/components/ui/button'
	import { Input } from '$lib/components/ui/input'
	import type { UserDto } from '$lib/types'
	import { cn } from '$lib/utils'
	import { ImagePlus } from 'lucide-svelte'
	import { tick } from 'svelte'
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
	let images: string[] = $derived(files.map((file) => generateURL(file)))
	let fileInput: HTMLInputElement = $state(null!)

	$effect(() => {
		// fileInput.value = ''
		const container = new DataTransfer()
		files.forEach((file) => container.items.add(file))
		fileInput.files = container.files
		// files.forEach((file) => (fileInput.files as unknown as File[]).push(file))
	})

	function generateURL(file: File) {
		const fileSrc = URL.createObjectURL(file)
		setTimeout(() => {
			URL.revokeObjectURL(fileSrc)
		}, 1000)
		return fileSrc
	}

	async function onsubmit(event: Event) {
		event.preventDefault()
		onCreate(event.target as HTMLFormElement)
		await tick()
		;(event.target as HTMLFormElement).reset()
		files = []
	}

	function handleFileUpload(event: Event) {
		const newFiles = [...((event.target as HTMLInputElement).files || [])]
		files = [...files, ...newFiles]
	}
	function removeFile(index: number) {
		files.splice(index, 1)
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
			class="flex h-full max-h-[400px] w-full gap-4 overflow-x-auto rounded-md border-2 border-secondary p-4"
		>
			{#each images as imageurl, i (imageurl)}
				<div class="group relative min-h-[100px] min-w-[300px] flex-1">
					<Button
						variant="destructive"
						class="absolute right-2 top-2 h-8 w-8 p-0 opacity-100 group-hover:opacity-100"
						onclick={() => removeFile(i)}>x</Button
					>
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
			accept="image/jpg,image/jpeg,image/png,image/webp"
			type="file"
			name="images"
			hidden
			class="hidden w-16"
			onchange={handleFileUpload}
			multiple
		/>
		<Input name="text" bind:value={message} placeholder="Start typing..." />
		<Button type="submit" disabled={!message}>+</Button>
		<input name="parentMessageId" type="hidden" value={parentMessageId} />
	</div>
</form>
