import assert from 'node:assert/strict'
import test from 'node:test'
import { readFile } from 'node:fs/promises'
import { cateringHref, isSiteRoute } from '../src/components/sites/sea-crown/siteData.ts'

test('builds localized catering links for both call-to-action targets', () => {
  assert.equal(cateringHref('vi', 'booking'), '/vi/catering#catering-booking')
  assert.equal(cateringHref('vi', 'preorder'), '/vi/catering#catering-preorder')
  assert.equal(cateringHref('en', 'booking'), '/en/catering#catering-booking')
})

test('recognizes every public Sea Crown route as internal navigation', () => {
  for (const language of ['vi', 'en']) {
    for (const page of [
      '',
      '/menu',
      '/catering',
      '/privacy',
      '/terms',
      '/reservation-status',
      '/payment/result',
    ]) {
      assert.equal(isSiteRoute(`/${language}${page}`), true, `/${language}${page}`)
    }
  }
  assert.equal(isSiteRoute('/staff/login'), false)
  assert.equal(isSiteRoute('/vi/not-found'), false)
})

test('catering page exposes the sections targeted by the homepage actions', async () => {
  const source = await readFile(
    new URL('../src/components/sites/sea-crown/CateringPage.tsx', import.meta.url),
    'utf8',
  )
  assert.match(source, /id="catering-booking"/)

  const preorder = await readFile(
    new URL('../src/components/sites/sea-crown/catering/PreorderMenu.tsx', import.meta.url),
    'utf8',
  )
  assert.match(preorder, /id="catering-preorder"/)
})

test('social icons and video previews keep their visuals without stale outbound links', async () => {
  const shared = await readFile(
    new URL('../src/components/sites/sea-crown/Shared.tsx', import.meta.url),
    'utf8',
  )
  assert.match(shared, /className="sb-social-icon"/)
  assert.doesNotMatch(shared, /instagram\.com|tiktok\.com/)

  const home = await readFile(
    new URL('../src/components/sites/sea-crown/HomePage.tsx', import.meta.url),
    'utf8',
  )
  assert.match(home, /className="sb-video-preview"/)
  assert.doesNotMatch(home, /thesandwichbar|the-sandwich-bar|instagram\.com|tiktok\.com/)
})
