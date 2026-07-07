import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as extension from '../../extension';
import * as markdownLinks from '../../generateMarkdownReferenceLinks';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Sample test', () => {
		assert.strictEqual(-1, [1, 2, 3].indexOf(5));
		assert.strictEqual(-1, [1, 2, 3].indexOf(0));
	});

	suite('parseNumberSpec', () => {
		test('should parse a:b format with positive integers', () => {
			const result = extension.parseNumberSpec('3:7');
			assert.deepStrictEqual(result, [3, 4, 5, 6, 7]);
		});

		test('should parse a:b format with negative to positive', () => {
			const result = extension.parseNumberSpec('-2:2');
			assert.deepStrictEqual(result, [-2, -1, 0, 1, 2]);
		});

		test('should parse a:b format in descending order', () => {
			const result = extension.parseNumberSpec('7:3');
			assert.deepStrictEqual(result, [7, 6, 5, 4, 3]);
		});

		test('should parse a:b:s format with positive step', () => {
			const result = extension.parseNumberSpec('2:10:2');
			assert.deepStrictEqual(result, [2, 4, 6, 8, 10]);
		});

		test('should parse a:b:s format with decimal step', () => {
			const result = extension.parseNumberSpec('0:1:0.25');
			assert.deepStrictEqual(result, [0, 0.25, 0.5, 0.75, 1]);
		});

		test('should parse a:b:s format with negative step', () => {
			const result = extension.parseNumberSpec('10:2:-2');
			assert.deepStrictEqual(result, [10, 8, 6, 4, 2]);
		});

		test('should handle single value range', () => {
			const result = extension.parseNumberSpec('5:5');
			assert.deepStrictEqual(result, [5]);
		});

		test('should handle single value range with step', () => {
			const result = extension.parseNumberSpec('5:5:1');
			assert.deepStrictEqual(result, [5]);
		});

		test('should handle single value range with negative step', () => {
			const result = extension.parseNumberSpec('5:5:-1');
			assert.deepStrictEqual(result, [5]);
		});

		test('should return null for invalid format (too few parts)', () => {
			const result = extension.parseNumberSpec('5');
			assert.strictEqual(result, null);
		});

		test('should return null for invalid format (too many parts)', () => {
			const result = extension.parseNumberSpec('1:2:3:4');
			assert.strictEqual(result, null);
		});

		test('should return null for non-numeric values', () => {
			const result = extension.parseNumberSpec('a:b');
			assert.strictEqual(result, null);
		});

		test('should return null for zero step', () => {
			const result = extension.parseNumberSpec('1:10:0');
			assert.strictEqual(result, null);
		});

		test('should return null for mismatched step direction', () => {
			const result = extension.parseNumberSpec('1:10:-1');
			assert.strictEqual(result, null);
		});

		test('should handle whitespace in input', () => {
			const result = extension.parseNumberSpec('  3:7  ');
			assert.deepStrictEqual(result, [3, 4, 5, 6, 7]);
		});
	});

	suite('generateSlug', () => {
		test('should convert to lowercase', () => {
			const result = markdownLinks.generateSlug('Fibonacci Sequence');
			assert.strictEqual(result, 'fibonacci-sequence');
		});

		test('should replace spaces with hyphens', () => {
			const result = markdownLinks.generateSlug('My Heading Text');
			assert.strictEqual(result, 'my-heading-text');
		});

		test('should remove special characters', () => {
			const result = markdownLinks.generateSlug('Hello! World? #Test');
			assert.strictEqual(result, 'hello-world-test');
		});

		test('should collapse multiple hyphens', () => {
			const result = markdownLinks.generateSlug('Hello   World');
			assert.strictEqual(result, 'hello-world');
		});

		test('should trim leading and trailing whitespace', () => {
			const result = markdownLinks.generateSlug('  Heading  ');
			assert.strictEqual(result, 'heading');
		});

		test('should remove leading and trailing hyphens', () => {
			const result = markdownLinks.generateSlug('---Heading---');
			assert.strictEqual(result, 'heading');
		});

		test('should handle mixed alphanumeric characters', () => {
			const result = markdownLinks.generateSlug('Test123 Example');
			assert.strictEqual(result, 'test123-example');
		});

		test('should handle empty string', () => {
			const result = markdownLinks.generateSlug('');
			assert.strictEqual(result, '');
		});

		test('should handle string with only special characters', () => {
			const result = markdownLinks.generateSlug('!@#$%^&*()');
			assert.strictEqual(result, '');
		});

		test('should preserve hyphens in original text', () => {
			const result = markdownLinks.generateSlug('Hello-World');
			assert.strictEqual(result, 'hello-world');
		});
	});

	suite('disambiguateSlugs', () => {
		test('should keep unique slugs unchanged', () => {
			const result = markdownLinks.disambiguateSlugs(['heading1', 'heading2', 'heading3']);
			assert.deepStrictEqual(result, ['heading1', 'heading2', 'heading3']);
		});

		test('should add numeric suffix to duplicates', () => {
			const result = markdownLinks.disambiguateSlugs(['heading', 'heading', 'heading']);
			assert.deepStrictEqual(result, ['heading', 'heading-1', 'heading-2']);
		});

		test('should handle mixed duplicates', () => {
			const result = markdownLinks.disambiguateSlugs(['a', 'b', 'a', 'c', 'b', 'a']);
			assert.deepStrictEqual(result, ['a', 'b', 'a-1', 'c', 'b-1', 'a-2']);
		});

		test('should handle empty array', () => {
			const result = markdownLinks.disambiguateSlugs([]);
			assert.deepStrictEqual(result, []);
		});

		test('should handle single item', () => {
			const result = markdownLinks.disambiguateSlugs(['heading']);
			assert.deepStrictEqual(result, ['heading']);
		});

		test('should handle all duplicates', () => {
			const result = markdownLinks.disambiguateSlugs(['same', 'same', 'same', 'same']);
			assert.deepStrictEqual(result, ['same', 'same-1', 'same-2', 'same-3']);
		});
	});
});
