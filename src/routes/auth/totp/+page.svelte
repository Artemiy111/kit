<script lang="ts">
	import { enhance } from '$app/forms'
	import { Label } from '$lib/components/ui/label'
	import { Input } from '$lib/components/ui/input'
	import { Button } from '$lib/components/ui/button'
	import { OTPInput, OTPRoot } from '@jimmyverburgt/svelte-input-otp'
	import { Minus } from 'lucide-svelte'
	import { toast } from 'svelte-sonner'
	import { tick } from 'svelte'

	let totp = $state('')
	let buttonref: HTMLButtonElement = $state(null!)
</script>

<main class="container mx-auto flex flex-col items-center justify-center">
	<form
		action="?/verify"
		method="POST"
		class="mt-16 flex w-full max-w-[500px] flex-col gap-4 rounded-lg bg-slate-50 p-4"
	>
		<input type="hidden" name="totp" value={totp} />
		<button bind:this={buttonref} type="submit" hidden></button>
		<OTPRoot
			maxLength={6}
			bind:value={totp}
			autoFocus={true}
			onComplete={async () => {
				await tick()
				buttonref.click()
				await tick()
				totp = ''
			}}
			className="flex items-center gap-2"
		>
			<div class="flex items-center">
				<OTPInput
					index={0}
					className="relative flex h-20 w-16 items-center justify-center border-y border-r border-input text-3xl transition-all first:rounded-l-md first:border-l last:rounded-r-md"
					focusClassName="z-10 ring-2 ring-ring ring-offset-background"
				/>
				<OTPInput
					index={1}
					className="relative flex h-20 w-16 items-center justify-center border-y border-r border-input text-3xl transition-all first:rounded-l-md first:border-l last:rounded-r-md"
					focusClassName="z-10 ring-2 ring-ring ring-offset-background"
				/>
				<OTPInput
					index={2}
					className="relative flex h-20 w-16 items-center justify-center border-y border-r border-input text-3xl transition-all first:rounded-l-md first:border-l last:rounded-r-md"
					focusClassName="z-10 ring-2 ring-ring ring-offset-background"
				/>
			</div>
			<div class="mx-1">
				<Minus />
			</div>
			<div class="flex items-center">
				<OTPInput
					index={3}
					className="relative flex h-20 w-16 items-center justify-center border-y border-r border-input text-3xl transition-all first:rounded-l-md first:border-l last:rounded-r-md"
					focusClassName="z-10 ring-2 ring-ring ring-offset-background"
				/>
				<OTPInput
					index={4}
					className="relative flex h-20 w-16 items-center justify-center border-y border-r border-input text-3xl transition-all first:rounded-l-md first:border-l last:rounded-r-md"
					focusClassName="z-10 ring-2 ring-ring ring-offset-background"
				/>
				<OTPInput
					index={5}
					className="relative flex h-20 w-16 items-center justify-center border-y border-r border-input text-3xl transition-all first:rounded-l-md first:border-l last:rounded-r-md"
					focusClassName="z-10 ring-2 ring-ring ring-offset-background"
				/>
			</div>
		</OTPRoot>
	</form>
</main>
