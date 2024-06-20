<script lang="ts">
	import { Toaster } from '$lib/components/ui/sonner'
	import '../app.css'
	let { children, data } = $props()
	let { user } = data

	type Route = {
		title: string
		url: string
	}
	const routes: Route[] = $derived(
		[
			{
				title: 'Flow',
				url: '/',
				show: true
			},
			{
				title: 'Login',
				url: '/auth/login',
				show: !user
			},
			{
				title: 'Register',
				url: '/auth/register',
				show: !user
			},
			{
				title: 'Account',
				url: '/account',
				show: !!user
			},
			{
				title: 'Logout',
				url: '/auth/logout',
				show: !!user
			}
		].filter((r) => r.show)
	)
</script>

<nav class="container flex justify-center gap-4 bg-slate-50 p-4">
	{#each routes as route (route.url)}
		<a href={route.url}>{route.title}</a>
	{/each}
</nav>

<Toaster theme="system" />
{@render children()}
