<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { toast } from 'svelte-sonner';

	const { form } = $props();

	$effect(() => {
		if (!form) return;
		if (form.success) toast('Вход выполнен');
		else toast('Не удалось войти в аккаунт');
	});
</script>

<main class="container mt-16 flex flex-col">
	<form
		method="POST"
		use:enhance
		class="grid max-w-[600px] grid-cols-[max-content,1fr] items-center gap-4 rounded-lg bg-slate-50 p-4"
	>
		<Label for="email">Email</Label>
		<Input name="email" id="email" required />
		<Label for="password">Password</Label>
		<Input name="password" id="password" type="password" required />
		{#if form?.message}
			<p class="col-span-2 rounded-md bg-red-100 p-2 text-red-500">
				{form.message}
			</p>
		{/if}
		<Button type="submit" class="col-span-2">Login</Button>
		<a href="/auth/login" class={buttonVariants({ variant: 'link' })}>Register</a>
		<a class={buttonVariants()} href="/auth/login/github">With Github</a>
	</form>
</main>
