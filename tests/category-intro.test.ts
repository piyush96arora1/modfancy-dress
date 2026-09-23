import { test } from 'node:test'
import assert from 'node:assert/strict'
import { categoryIntro, plainText } from '../lib/utils/category-intro'

test('takes the first paragraph only', () =>
  assert.equal(categoryIntro('First para.\n\nSecond para.'), 'First para.'))
test('skips a leading heading block', () =>
  assert.equal(categoryIntro('## Dandiya dress\n\nMirror-work lehengas.\n\nMore.'), 'Mirror-work lehengas.'))
test('strips markdown links and bold to plain text', () =>
  assert.equal(categoryIntro('Rent a **Kathak dress** or see [Bharatnatyam](/category/bharatnatyam).'),
    'Rent a Kathak dress or see Bharatnatyam.'))
test('caps very long intros at a sentence boundary under 320 chars', () => {
  const s = 'A'.repeat(200) + '. ' + 'B'.repeat(200) + '.'
  assert.equal(categoryIntro(s), 'A'.repeat(200) + '.')
})
test('empty or null input → empty string', () => {
  assert.equal(categoryIntro(null), '')
  assert.equal(categoryIntro('   '), '')
})
test('plainText flattens the whole description for meta and JSON-LD', () =>
  assert.equal(plainText('## Heading\n\nSee [Assam](/products/assam) and **Kerala**.\n\n- one\n- two'),
    'Heading See Assam and Kerala. one two'))
