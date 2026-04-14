<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	const adminLinks = [
		{ href: '/admin', label: 'Dashboard' },
		{ href: '/admin/goals', label: 'Goals' }
	] as const;

	const baseLinkClasses =
		'rounded-(--radius-control) px-3 py-2 text-sm font-medium transition whitespace-nowrap';
	const activeLinkClasses = 'bg-(--color-surface-soft) text-(--color-ink)';
	const inactiveLinkClasses = 'text-(--color-muted) hover:bg-white/60 hover:text-(--color-ink)';

	const isCurrentPath = (href: string) =>
		page.url.pathname === href || page.url.pathname.startsWith(`${href}/`);
</script>

<div class="space-y-8">
	<section
		class="rounded-(--radius-card) border border-(--color-border) bg-(--color-surface) p-4 shadow-(--shadow-card)"
	>
		<div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
			<div class="space-y-1">
				<p class="text-xs font-semibold tracking-[0.22em] text-(--color-accent-strong) uppercase">
					Administrator tools
				</p>
				<p class="text-sm text-(--color-muted)">
					Manage the public home-page picks, administrator access, and the cross-reader goal
					reporting surface.
				</p>
			</div>

			<nav aria-label="Admin" class="overflow-x-auto">
				<div
					class="inline-flex items-center gap-1 rounded-(--radius-control) bg-(--color-surface-soft) p-1"
				>
					{#each adminLinks as link (link.href)}
						<a
							class={[
								baseLinkClasses,
								isCurrentPath(link.href) ? activeLinkClasses : inactiveLinkClasses
							]}
							href={resolve(link.href)}
						>
							{link.label}
						</a>
					{/each}
				</div>
			</nav>
		</div>
	</section>

	{@render children()}
</div>
