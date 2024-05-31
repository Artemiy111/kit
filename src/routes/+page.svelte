<script lang="ts">
	let { data } = $props();
	import { Input } from '$lib/components/ui/input';
	import * as Avatar from '$lib/components/ui/avatar/index.js';

	type Comment = {
		postId: number;
		likes: number;
		id: number;
		user: {
			id: number;
			username: string;
			fullname: string;
		};
		body: string;
	};

	let comments: Comment[] = $state([]);

	$effect(() => {
		// console.log(data);
		// new Promise(async (res) => {
		// 	const result = await fetch('https://dummyjson.com/comments');
		// 	const data = await result.json();
		// 	comments = data.comments as Comment[];
		// 	console.log(comments);
		// 	res(1);
		// });
	});

	let message = $state('');
</script>

{#snippet message_box(isMe: boolean, comment: Comment)}
	<div class="grid grid-cols-[max-content,1fr] gap-4 p-2 {isMe ? 'bg-blue-200' : 'bg-green-200'}">
		<Avatar.Root>
			<Avatar.Image src="https://github.com/shadcn.png" alt="@shadcn" />
			<Avatar.Fallback></Avatar.Fallback>
		</Avatar.Root>
		<p>
			{comment.body}
		</p>
	</div>
{/snippet}

<main class="container">
	<div class="mx-auto my-8 grid max-w-[600px] grid-cols-1 gap-4 bg-slate-50 p-4">
		{#each comments as comment, i}
			{@render message_box(i % 3 === 0, comment)}
		{/each}
	</div>
	<Input bind:value={message} />
</main>
