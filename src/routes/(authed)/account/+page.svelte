<script lang="ts">
	const { data } = $props();
	const user = $derived(data.user);
</script>

<main class="container mt-16 flex flex-col gap-4">
	<h1 class="text-3xl font-bold">Account</h1>
	{user.username}
</main>