type EnvironmentVariables = Record<string, string | undefined>;

export type EnvironmentConfiguration = {
	authOrigin?: string;
	betterAuthSecret: string;
	databaseUrl: string;
	openLibraryBaseUrl: string;
};

export const DEFAULT_DATABASE_URL = 'file:./tmp/local.db';
export const DEFAULT_BETTER_AUTH_SECRET =
	'shelf-local-development-auth-secret-change-me-before-sharing';
export const DEFAULT_OPEN_LIBRARY_BASE_URL = 'https://openlibrary.org';

const readEnvironmentString = (value: string | undefined): string | undefined => {
	const trimmedValue = value?.trim();
	return trimmedValue ? trimmedValue : undefined;
};

/**
 * Resolves the environment-backed settings Shelf needs at runtime, applying
 * course-friendly local defaults whenever `.env` is missing or incomplete.
 */
export const resolveShelfEnvironmentConfiguration = (
	environmentVariables: EnvironmentVariables
): EnvironmentConfiguration => {
	const authOrigin = readEnvironmentString(environmentVariables.ORIGIN);

	return {
		...(authOrigin ? { authOrigin } : {}),
		betterAuthSecret:
			readEnvironmentString(environmentVariables.BETTER_AUTH_SECRET) ?? DEFAULT_BETTER_AUTH_SECRET,
		databaseUrl: readEnvironmentString(environmentVariables.DATABASE_URL) ?? DEFAULT_DATABASE_URL,
		openLibraryBaseUrl:
			readEnvironmentString(environmentVariables.OPEN_LIBRARY_BASE_URL) ??
			DEFAULT_OPEN_LIBRARY_BASE_URL
	};
};

/**
 * Enables the test seeding endpoint by default during local development while
 * staying closed unless explicitly enabled in non-development environments.
 */
export const resolveTestSeedEnabled = (
	environmentVariables: EnvironmentVariables,
	developmentMode: boolean
): boolean => {
	const configuredValue = readEnvironmentString(
		environmentVariables.ENABLE_TEST_SEED
	)?.toLowerCase();

	if (!configuredValue) {
		return developmentMode;
	}

	return configuredValue === 'true';
};
