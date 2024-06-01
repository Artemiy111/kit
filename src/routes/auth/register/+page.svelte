<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { toast } from 'svelte-sonner';
	const { form, data } = $props();

	$effect(() => {
		if (!form) return;
		if (form.success) toast('Аккаунт создан');
		else toast('Ошибка');
	});
</script>

<main class="container mt-16 flex flex-col">
	<form
		method="POST"
		use:enhance
		class="grid max-w-[600px] grid-cols-[max-content,1fr] items-center gap-4 rounded-lg bg-slate-50 p-4"
	>
		<Label for="username">Username</Label>
		<Input name="username" id="username" required />
		<Label for="email">Email</Label>
		<Input name="email" id="email" required />
		<Label for="password">Password</Label>
		<Input name="password" id="password" type="password" required />
		<Label for="repeat-password">Repeat password</Label>
		<Input name="repeat-password" id="repeat-password" type="password" required />
		{#if form?.message}
			<p class="col-span-2 rounded-md bg-red-100 p-2 text-red-500">
				{form.message}
			</p>
		{/if}
		<Button type="submit" class="col-span-2">Register</Button>
		<a href="/auth/login" class={buttonVariants({ variant: 'link' })}>Login</a>
	</form>
</main>
