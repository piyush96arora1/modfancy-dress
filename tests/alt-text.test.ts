import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildAltText, inferAudience } from '../lib/seo/alt-text'

test('primary image: name + category + shop', () =>
  assert.equal(buildAltText({ name: 'Ravan Costume', categoryName: 'Ramleela Costumes' }, 0),
    'Ravan Costume – Ramleela Costumes, Mod Fancy Dress Delhi'))
test('secondary images are distinguished by view number', () =>
  assert.equal(buildAltText({ name: 'Ravan Costume', categoryName: 'Ramleela Costumes' }, 2),
    'Ravan Costume – view 3, Ramleela Costumes, Mod Fancy Dress Delhi'))
test('audience is added when known and not already in the name', () => {
  assert.equal(buildAltText({ name: 'Mirror Work Lehenga', categoryName: 'Dandiya Dress', audience: 'women' }, 0),
    'Mirror Work Lehenga for women – Dandiya Dress, Mod Fancy Dress Delhi')
  assert.equal(buildAltText({ name: 'Garba Dress for Women', categoryName: 'Garba Dress', audience: 'women' }, 0),
    'Garba Dress for Women – Garba Dress, Mod Fancy Dress Delhi')
})
test('never exceeds 125 chars (screen-reader guidance)', () =>
  assert.ok(buildAltText({ name: 'x'.repeat(200), categoryName: 'y' }, 0).length <= 125))
test('no category: name and shop only', () =>
  assert.equal(buildAltText({ name: 'Ravan Costume' }, 0), 'Ravan Costume – Mod Fancy Dress Delhi'))

test('audience: kids category or kids words in the name', () => {
  assert.equal(inferAudience('Krishna Dress', ['Kids Costumes']), 'kids')
  assert.equal(inferAudience('Baby Krishna Dress', []), 'kids')
  assert.equal(inferAudience('Hanuman Fancy Dress for Boys', []), 'kids')
})
test('audience: women and men', () => {
  assert.equal(inferAudience('Mirror Work Lehenga', ['Garba Dress'], 'Flared chaniya. Adult free size.'), 'women')
  assert.equal(inferAudience('Ladies Chaniya Choli', []), 'women')
  assert.equal(inferAudience('Kediyu for Men', ['Dandiya Dress']), 'men')
})
test('audience: character names are not audiences', () => {
  assert.equal(inferAudience('Iron Man Muscle Fancy Dress', ['Superhero Costumes']), null)
  assert.equal(inferAudience('Wonder Woman Costume', []), null)
})
test('audience: a lehenga is only for women when the copy says adult-sized', () => {
  assert.equal(inferAudience('Navratri Chaniya Choli', ['Garba Dress'], 'Available for kids at Mod Fancy Dress.'), 'kids')
  assert.equal(inferAudience('Navratri Chaniya Choli', ['Garba Dress']), null)
  assert.equal(inferAudience('Rajasthani Lehenga', [], 'Stocked in 7-9 yrs (primary school) and Adult (teens and adults).'), null)
  assert.equal(inferAudience('Police Fancy Dress', [], 'Sized for adults.'), 'adults')
  assert.equal(inferAudience('Ravan Dress', [], 'Fits most school-age kids. Adult sizes for teachers are priced separately.'), null)
})
test('audience: unknown stays null', () =>
  assert.equal(inferAudience('Ravan Costume', ['Ramleela Costumes']), null))
