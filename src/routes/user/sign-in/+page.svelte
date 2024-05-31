<script lang="ts">
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
</script>

<main class="container mt-16 flex flex-col">
	<form
		action="?/register"
		method="POST"
		class="grid max-w-[600px] grid-cols-[max-content,1fr] items-center gap-4 rounded-lg bg-slate-50 p-4"
	>
		<Label for="name">Ник</Label>
		<Input id="name" />
		<Label for="password">Пароль</Label>
		<Input id="password" type="password" />
		<Button type="submit" class="col-span-2">Войти</Button>
		<a href="/user/sign-up" class={buttonVariants({ variant: 'link' })}
			>Нет аккаунта? Зарегистрироваться</a
		>
	</form>
</main>
