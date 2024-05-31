<script lang="ts">
	import { invalidate } from '$app/navigation';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Toaster } from '$lib/components/ui/sonner';
	import '../app.css';
	const { children, data } = $props();

	type Route = {
		title: string;
		url: string;
	};
	const routes: Route[] = [
		{
			title: 'Поток',
			url: '/'
		},
		{
			title: 'Войти',
			url: '/user/sign-in'
		},
		{
			title: 'Зарегистрироваться',
			url: '/user/sign-up'
		}
	];

	async function signOut() {
		await fetch('/api/user/sign-out');
		invalidate('app:user');
	}
</script>

<nav class="container flex justify-center gap-4 bg-slate-50 p-4">
	{#each routes as route (route.url)}
		<a href={route.url}>{route.title}</a>
	{/each}
	{#if data.user}
		<Button onclick={signOut}>Выйти</Button>
	{/if}
</nav>

<Toaster theme="system" />
{@render children()}
