<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { toast } from 'svelte-sonner';
	import Icon from '@iconify/svelte';

	const { form } = $props();

	$effect(() => {
		if (!form) return;
		if (form.success) toast('Вход выполнен');
		else toast('Не удалось войти в аккаунт');
	});
</script>

<main class="container mx-auto flex flex-col items-center justify-center">
	<form
		method="POST"
		use:enhance
		class="mt-16 flex w-full max-w-[500px] flex-col gap-4 rounded-lg bg-slate-50 p-4"
	>
		<div class="grid grid-cols-2 gap-4">
			<a
				class="flex items-center justify-center gap-4 rounded-md bg-white p-4 transition-colors hover:bg-slate-200"
				href="/auth/login/github"
			>
				<Icon width={40} icon="mdi:github"></Icon></a
			>
			<a
				class="flex items-center justify-center gap-4 rounded-md bg-white p-4 transition-colors hover:bg-slate-200"
				href="/auth/login/yandex"
			>
				<Icon width={40} icon="ri:vk-fill"></Icon></a
			>
		</div>

		<span class="w-full text-center">or</span>

		<div class="grid w-full grid-cols-[max-content,1fr] items-center gap-4">
			<Label for="email">Email</Label>
			<Input name="email" id="email" required />
			<Label for="password">Password</Label>
			<Input name="password" id="password" type="password" required />
		</div>

		{#if form?.message}
			<p class="col-span-2 rounded-md bg-red-100 p-2 text-red-500">
				{form.message}
			</p>
		{/if}

		<Button type="submit" class="">Login</Button>
		<a href="/auth/login" class={buttonVariants({ variant: 'link' })}>Register</a>
	</form>
</main>
