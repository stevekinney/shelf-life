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
			eyebrow="App-native authentication"
			title="Sign in to your Shelf starter."
			description="This route replaces the generated demo auth pages. It is intentionally simple, accessible, and ready for the later course exercises."
		/>

		<SurfaceCard
			title="What this page is for"
			description="The login route is now the single entry point for starter auth flows."
		>
			<ul class="space-y-3 text-sm text-[var(--color-muted)]">
				<li>Use email and password auth through Better Auth.</li>
				<li>Create a starter account without leaving this screen.</li>
				<li>Land in the protected app surface after successful auth.</li>
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
				hint="Use a real-looking address so later fixtures and tests read cleanly."
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
