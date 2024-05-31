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
		action="?/register"
		method="POST"
		use:enhance
		class="grid max-w-[600px] grid-cols-[max-content,1fr] items-center gap-4 rounded-lg bg-slate-50 p-4"
	>
		<Label for="name">Ник</Label>
		<Input name="name" id="name" required />
		<Label for="password">Пароль</Label>
		<Input name="password" id="password" type="password" required />
		<Label for="repeat-password">Повторите пароль</Label>
		<Input name="repeat-password" id="repeat-password" type="password" required />
		{#if form?.message}
			<p class="col-span-2 rounded-md bg-red-100 p-2 text-red-500">
				{form.message}
			</p>
		{/if}
		<Button type="submit" class="col-span-2">Зарегистрироваться</Button>
		<a href="/user/sign-in" class={buttonVariants({ variant: 'link' })}>Есть аккаунт? Войти</a>
	</form>
</main>
