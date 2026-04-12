<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { defaultAuthenticatedPath } from '$lib/authentication-navigation';
	import Button from '$lib/components/button.svelte';
	import Input from '$lib/components/input.svelte';
	import PageHeader from '$lib/components/page-header.svelte';
	import SurfaceCard from '$lib/components/surface-card.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const isCreateAccountMode = $derived(data.mode === 'create-account');
	const pageEyebrow = $derived(isCreateAccountMode ? 'New here?' : 'Welcome back');
	const pageTitle = $derived(
		isCreateAccountMode ? 'Create your Shelf account.' : 'Sign in to Shelf.'
	);
	const pageDescription = $derived(
		isCreateAccountMode
			? 'Create an account to start building your shelf, tracking finished books, and setting your yearly reading goal.'
			: 'Pick up where you left off. Sign in to update your shelf, log finished books, and keep your reading goal moving.'
	);
	const formTitle = $derived(isCreateAccountMode ? 'Create account' : 'Email and password');
	const formDescription = $derived(
		isCreateAccountMode
			? 'Start with your email and password, then choose the display name that will appear on your shelf.'
			: 'Sign in with your existing Shelf account.'
	);
	const submitButtonLabel = $derived(isCreateAccountMode ? 'Create account' : 'Sign in');
</script>

<div class="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
	<div class="space-y-4">
		<PageHeader eyebrow={pageEyebrow} title={pageTitle} description={pageDescription} />

		<SurfaceCard
			title="Your reading history lives here"
			description="Shelf keeps your to-read list, finished books, ratings, and yearly goal in one place."
		>
			<ul class="space-y-3 text-sm text-[var(--color-muted)]">
				<li>Keep your shelf and reading progress in sync.</li>
				<li>Create an account without leaving this screen.</li>
				<li>Return to the page you originally wanted after you sign in.</li>
			</ul>
		</SurfaceCard>
	</div>

	<SurfaceCard title={formTitle} description={formDescription}>
		<form
			class="space-y-5"
			method="POST"
			action={isCreateAccountMode ? '?/signUpEmail' : '?/signInEmail'}
			use:enhance
		>
			<input type="hidden" name="returnTo" value={data.returnTo} />
			<Input
				label="Email"
				name="email"
				type="email"
				autocomplete="email"
				required
				hint="Use the email address you want to sign in with."
			/>
			<Input
				label="Password"
				name="password"
				type="password"
				autocomplete={isCreateAccountMode ? 'new-password' : 'current-password'}
				required
			/>
			{#if isCreateAccountMode}
				<Input
					label="Display name"
					name="name"
					autocomplete="name"
					hint="This is what readers will see on your shelf."
				/>
			{/if}

			{#if form?.message}
				<p class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
					{form.message}
				</p>
			{/if}

			<Button type="submit">{submitButtonLabel}</Button>
		</form>

		{#if isCreateAccountMode}
			<form method="GET" action={resolve('/login')} class="mt-4">
				{#if data.returnTo !== defaultAuthenticatedPath}
					<input type="hidden" name="returnTo" value={data.returnTo} />
				{/if}

				<button
					type="submit"
					class="text-sm font-medium text-[var(--color-muted)] underline-offset-4 transition hover:text-[var(--color-ink)] hover:underline"
				>
					Already have an account? Sign in instead.
				</button>
			</form>
		{:else}
			<form method="GET" action={resolve('/login')} class="mt-4">
				<input type="hidden" name="mode" value="create-account" />
				{#if data.returnTo !== defaultAuthenticatedPath}
					<input type="hidden" name="returnTo" value={data.returnTo} />
				{/if}

				<button
					type="submit"
					class="text-sm font-medium text-[var(--color-muted)] underline-offset-4 transition hover:text-[var(--color-ink)] hover:underline"
				>
					Need an account? Create one instead.
				</button>
			</form>
		{/if}
	</SurfaceCard>
</div>
