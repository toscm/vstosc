import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as extension from '../../extension';

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
});
