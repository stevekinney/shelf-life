<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/button.svelte';
	import Input from '$lib/components/input.svelte';
	import PageHeader from '$lib/components/page-header.svelte';
	import SurfaceCard from '$lib/components/surface-card.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<div class="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
	<div class="space-y-4">
		<PageHeader
			eyebrow="Welcome back"
			title="Sign in to Shelf."
			description="Use your email and password to open your shelf, search for books, and keep your reading goal moving."
		/>

		<SurfaceCard
			title="Everything tied to your account"
			description="Shelf keeps your reading history attached to you, not the browser you happened to be using."
		>
			<ul class="space-y-3 text-sm text-[var(--color-muted)]">
				<li>Keep your shelf, reading status, and ratings in sync.</li>
				<li>Create an account without leaving this screen.</li>
				<li>Return to the page you originally wanted after signing in.</li>
			</ul>
		</SurfaceCard>
	</div>

	<SurfaceCard
		title="Email and password"
		description="Sign in with an existing account, or register a new one with the same form."
	>
		<form class="space-y-5" method="POST" action="?/signInEmail" use:enhance>
			<input type="hidden" name="returnTo" value={data.returnTo} />
			<Input
				label="Email"
				name="email"
				type="email"
				autocomplete="email"
				required
				hint="Use the address you want attached to your shelf and reading history."
			/>
			<Input
				label="Password"
				name="password"
				type="password"
				autocomplete="current-password"
				required
			/>
			<Input
				label="Display name"
				name="name"
				autocomplete="name"
				hint="This is used when creating a new account."
			/>

			{#if form?.message}
				<p class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
					{form.message}
				</p>
			{/if}

			<div class="flex flex-wrap gap-3">
				<Button type="submit">Sign in</Button>
				<Button type="submit" kind="secondary" formaction="?/signUpEmail">Create account</Button>
			</div>
		</form>
	</SurfaceCard>
</div>
