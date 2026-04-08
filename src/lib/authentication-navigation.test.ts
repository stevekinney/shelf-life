import { describe, expect, it } from 'vitest';
import {
	createLoginPath,
	defaultAuthenticatedPath,
	isValidEmailAddress,
	resolveAuthenticatedPath
} from './authentication-navigation';

describe('resolveAuthenticatedPath', () => {
	it('falls back to the default authenticated path for empty values', () => {
		expect(resolveAuthenticatedPath('')).toBe(defaultAuthenticatedPath);
		expect(resolveAuthenticatedPath(null)).toBe(defaultAuthenticatedPath);
	});

	it('keeps internal paths, search parameters, and hashes intact', () => {
		expect(resolveAuthenticatedPath('/search?query=piranesi#results')).toBe(
			'/search?query=piranesi#results'
		);
	});

	it('rejects external or malformed redirect targets', () => {
		expect(resolveAuthenticatedPath('https://example.com/search')).toBe(defaultAuthenticatedPath);
		expect(resolveAuthenticatedPath('//example.com/search')).toBe(defaultAuthenticatedPath);
		expect(resolveAuthenticatedPath('search')).toBe(defaultAuthenticatedPath);
	});
});

describe('createLoginPath', () => {
	it('encodes the return path for login redirects', () => {
		expect(createLoginPath('/search?query=piranesi')).toBe(
			'/login?returnTo=%2Fsearch%3Fquery%3Dpiranesi'
		);
	});
});

describe('isValidEmailAddress', () => {
	it('accepts normal email addresses', () => {
		expect(isValidEmailAddress('reader@example.com')).toBe(true);
	});

	it('rejects malformed email addresses', () => {
		expect(isValidEmailAddress('reader')).toBe(false);
		expect(isValidEmailAddress('reader@')).toBe(false);
		expect(isValidEmailAddress('reader@example')).toBe(false);
	});
});
