<script lang="ts">
	import { enhance } from '$app/forms';
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
			url: '/auth/login'
		},
		{
			title: 'Зарегистрироваться',
			url: '/auth/register'
		},
		{
			title: 'Аккаунт',
			url: '/account'
		}
	];

	// async function signOut() {
	// 	await fetch('/user/sign-out');
	// 	invalidate('app:user');
	// }
</script>

<nav class="container flex justify-center gap-4 bg-slate-50 p-4">
	{#each routes as route (route.url)}
		<a href={route.url}>{route.title}</a>
	{/each}
	{#if data.user}
		<a href="/auth/logout">Выйти</a>
	{/if}
</nav>

<Toaster theme="system" />
{@render children()}
