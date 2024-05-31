<script lang="ts">
	import '../app.css';
	let { children } = $props();

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
</script>

<nav class="container flex justify-center gap-4 bg-slate-50 p-4">
	{#each routes as route (route.url)}
		<a href={route.url}>{route.title}</a>
	{/each}
</nav>

{@render children()}
