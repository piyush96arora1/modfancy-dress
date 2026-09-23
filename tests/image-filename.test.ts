import { test } from 'node:test'
import assert from 'node:assert/strict'
import { imageFilename, imageStem } from '../lib/utils/image-filename'

test('primary image uses the bare slug', () => assert.equal(imageFilename('ravan-costume', 0, 'webp'), 'ravan-costume.webp'))
test('later images get -2, -3…', () => assert.equal(imageFilename('ravan-costume', 1, 'jpg'), 'ravan-costume-2.jpg'))
test('slug is sanitised', () => assert.equal(imageFilename('Ravan Costume!!', 0, 'webp'), 'ravan-costume.webp'))
test('stem without extension, for the uploader to append the real one', () =>
  assert.equal(imageStem('ravan-costume', 2), 'ravan-costume-3'))
test('empty slug falls back to a generic stem', () =>
  assert.equal(imageStem('!!', 0), 'product'))
