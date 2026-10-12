import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as extension from '../../extension';
import * as markdownLinks from '../../generateMarkdownReferenceLinks';
import * as wordWrap from '../../wordWrapStatusBar';

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

		test('should expand a: to one number per cursor', () => {
			assert.deepStrictEqual(extension.parseNumberSpec('3:', 4), [3, 4, 5, 6]);
			assert.deepStrictEqual(extension.parseNumberSpec('-1.5:', 3), [-1, 0, 1]);
		});

		test('should treat a: as a single number with one cursor', () => {
			assert.deepStrictEqual(extension.parseNumberSpec('3:'), [3]);
		});

		test('should expand a::s to one number per cursor', () => {
			assert.deepStrictEqual(extension.parseNumberSpec('10::-2', 3), [10, 8, 6]);
		});

		test('should return null for a::0', () => {
			assert.strictEqual(extension.parseNumberSpec('1::0', 3), null);
		});
	});

	suite('fitNumbersToCursors', () => {
		test('should recycle values when there are more cursors', () => {
			assert.deepStrictEqual(extension.fitNumbersToCursors([1, 2], 5), [1, 2, 1, 2, 1]);
		});

		test('should drop surplus values', () => {
			assert.deepStrictEqual(extension.fitNumbersToCursors([1, 2, 3, 4], 2), [1, 2]);
		});

		test('should keep the whole sequence for a single cursor', () => {
			assert.deepStrictEqual(extension.fitNumbersToCursors([1, 2, 3], 1), [1, 2, 3]);
		});
	});

	suite('formatNumbersPreview', () => {
		test('should list short sequences in full', () => {
			assert.strictEqual(extension.formatNumbersPreview([1, 2, 1]), '1, 2, 1');
		});

		test('should abbreviate long sequences', () => {
			const numbers = Array.from({ length: 100 }, (_, i) => i + 1);
			assert.strictEqual(extension.formatNumbersPreview(numbers, 4), '1, 2, 3, ..., 100 (100 values)');
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

	suite('stripHeadingMarkup', () => {
		test('should strip the leading hashes reported by the symbol provider', () => {
			assert.strictEqual(markdownLinks.stripHeadingMarkup('## Cloning / Pulling'), 'Cloning / Pulling');
		});

		test('should strip hashes at every heading level', () => {
			assert.strictEqual(markdownLinks.stripHeadingMarkup('# Top'), 'Top');
			assert.strictEqual(markdownLinks.stripHeadingMarkup('###### Deep'), 'Deep');
		});

		test('should strip the trailing hashes of a closed ATX heading', () => {
			assert.strictEqual(markdownLinks.stripHeadingMarkup('## Title ##'), 'Title');
		});

		test('should leave a heading without markup unchanged', () => {
			assert.strictEqual(markdownLinks.stripHeadingMarkup('Relevant Links'), 'Relevant Links');
		});

		test('should keep hashes that are part of the text', () => {
			assert.strictEqual(markdownLinks.stripHeadingMarkup('## Issue #42'), 'Issue #42');
		});

		test('should tolerate missing space after the hashes', () => {
			assert.strictEqual(markdownLinks.stripHeadingMarkup('##Tight'), 'Tight');
		});

		test('should return an empty string for markup without text', () => {
			assert.strictEqual(markdownLinks.stripHeadingMarkup('##'), '');
		});
	});

	suite('generateReferenceLinksBlock', () => {
		test('should write labels without heading markup', () => {
			const block = markdownLinks.generateReferenceLinksBlock(['Cloning / Pulling', 'Relevant Links']);
			assert.strictEqual(block, [
				'<!-- Start Reference Links (Autogenerated) -->',
				'[Cloning / Pulling]: #cloning-pulling',
				'[Relevant Links]: #relevant-links',
				'<!-- End Reference Links (Autogenerated) -->',
			].join('\n'));
		});

		test('should disambiguate repeated headings', () => {
			const block = markdownLinks.generateReferenceLinksBlock(['Notes', 'Notes']);
			assert.ok(block.includes('[Notes]: #notes'));
			assert.ok(block.includes('[Notes]: #notes-1'));
		});

		test('should emit just the markers when there are no headings', () => {
			const block = markdownLinks.generateReferenceLinksBlock([]);
			assert.strictEqual(block, [
				'<!-- Start Reference Links (Autogenerated) -->',
				'<!-- End Reference Links (Autogenerated) -->',
			].join('\n'));
		});
	});

	suite('formatWrapLabel', () => {
		test('should show the mode when wrapping is off', () => {
			assert.strictEqual(wordWrap.formatWrapLabel('off', 80), 'Wrap: off');
		});

		test('should show the mode when wrapping follows the viewport', () => {
			assert.strictEqual(wordWrap.formatWrapLabel('on', 80), 'Wrap: on');
		});

		test('should show the column for bounded wrapping', () => {
			assert.strictEqual(wordWrap.formatWrapLabel('bounded', 66), 'Wrap: 66');
		});

		test('should show the column for wordWrapColumn wrapping', () => {
			assert.strictEqual(wordWrap.formatWrapLabel('wordWrapColumn', 72), 'Wrap: 72');
		});

		test('should fall back to the VS Code default column', () => {
			assert.strictEqual(wordWrap.formatWrapLabel('bounded', undefined), 'Wrap: 80');
		});

		test('should treat an unset or unknown mode as off', () => {
			assert.strictEqual(wordWrap.formatWrapLabel(undefined, 66), 'Wrap: off');
			assert.strictEqual(wordWrap.formatWrapLabel('nonsense', 66), 'Wrap: off');
		});
	});

	suite('formatRewrapLabel', () => {
		test('should always show a column', () => {
			assert.strictEqual(wordWrap.formatRewrapLabel({ column: 66, source: 'rewrap' }), 'Rewrap: 66');
			assert.strictEqual(wordWrap.formatRewrapLabel({ column: 80, source: 'fallback' }), 'Rewrap: 80');
		});
	});

	suite('resolveRewrapColumn', () => {
		test('should prefer an explicit rewrap column', () => {
			assert.deepStrictEqual(
				wordWrap.resolveRewrapColumn(66, [72], 80),
				{ column: 66, source: 'rewrap' });
		});

		test('should fall back to the first ruler', () => {
			assert.deepStrictEqual(
				wordWrap.resolveRewrapColumn(undefined, [72, 100], 80),
				{ column: 72, source: 'rulers' });
		});

		test('should read a ruler given as an object', () => {
			assert.deepStrictEqual(
				wordWrap.resolveRewrapColumn(undefined, [{ column: 66, color: '#333' }], 80),
				{ column: 66, source: 'rulers' });
		});

		test('should fall back to editor.wordWrapColumn without rulers', () => {
			assert.deepStrictEqual(
				wordWrap.resolveRewrapColumn(undefined, [], 100),
				{ column: 100, source: 'editor' });
		});

		test('should fall back to 80 when nothing is set', () => {
			assert.deepStrictEqual(
				wordWrap.resolveRewrapColumn(undefined, undefined, undefined),
				{ column: 80, source: 'fallback' });
		});

		test('should ignore zero and malformed entries', () => {
			assert.deepStrictEqual(
				wordWrap.resolveRewrapColumn(0, [0, null, 'x', 66], 0),
				{ column: 66, source: 'rulers' });
		});
	});

	suite('nextWrapMode', () => {
		test('should cycle off -> on -> bounded -> off', () => {
			assert.strictEqual(wordWrap.nextWrapMode('off'), 'on');
			assert.strictEqual(wordWrap.nextWrapMode('on'), 'bounded');
			assert.strictEqual(wordWrap.nextWrapMode('bounded'), 'off');
		});

		test('should treat wordWrapColumn as bounded', () => {
			assert.strictEqual(wordWrap.nextWrapMode('wordWrapColumn'), 'off');
		});

		test('should start the cycle when the mode is unset or unknown', () => {
			assert.strictEqual(wordWrap.nextWrapMode(undefined), 'on');
			assert.strictEqual(wordWrap.nextWrapMode('nonsense'), 'off');
		});
	});

	suite('parseColumn', () => {
		test('should accept a plain number', () => {
			assert.strictEqual(wordWrap.parseColumn('66'), 66);
		});

		test('should ignore surrounding whitespace', () => {
			assert.strictEqual(wordWrap.parseColumn('  72  '), 72);
		});

		test('should reject zero and negative values', () => {
			assert.strictEqual(wordWrap.parseColumn('0'), null);
			assert.strictEqual(wordWrap.parseColumn('-10'), null);
		});

		test('should reject non-integers and non-numbers', () => {
			assert.strictEqual(wordWrap.parseColumn('66.5'), null);
			assert.strictEqual(wordWrap.parseColumn('eighty'), null);
			assert.strictEqual(wordWrap.parseColumn(''), null);
		});

		test('should reject absurd columns', () => {
			assert.strictEqual(wordWrap.parseColumn('1000'), 1000);
			assert.strictEqual(wordWrap.parseColumn('1001'), null);
		});
	});
});
