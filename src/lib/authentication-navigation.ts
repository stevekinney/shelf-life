export const defaultAuthenticatedPath = '/shelf';

const safeAuthenticationOrigin = 'https://shelf.local';
const emailAddressPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Creates the login path for an unauthenticated request while preserving the intended destination.
 */
export const createLoginPath = (returnToPath: string) => {
	return `/login?returnTo=${encodeURIComponent(returnToPath)}`;
};

/**
 * Validates the minimal email shape before handing the request off to Better Auth.
 */
export const isValidEmailAddress = (value: string) => {
	return emailAddressPattern.test(value.trim());
};

/**
 * Resolves a post-authentication destination and rejects external or malformed redirects.
 */
export const resolveAuthenticatedPath = (value: string | null | undefined) => {
	if (!value) {
		return defaultAuthenticatedPath;
	}

	const trimmedValue = value.trim();

	if (!trimmedValue.startsWith('/') || trimmedValue.startsWith('//')) {
		return defaultAuthenticatedPath;
	}

	try {
		const parsedUrl = new URL(trimmedValue, safeAuthenticationOrigin);

		if (parsedUrl.origin !== safeAuthenticationOrigin) {
			return defaultAuthenticatedPath;
		}

		return `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
	} catch {
		return defaultAuthenticatedPath;
	}
};
