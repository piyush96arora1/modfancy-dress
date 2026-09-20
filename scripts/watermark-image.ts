/**
 * CLI: brand an image for social before posting.
 *
 *   npx tsx scripts/watermark-image.ts <input> <output> [--corner bottom-right] [--ratio 0.8]
 *   npx tsx scripts/watermark-image.ts <input> <output> --no-pad
 *
 * Defaults come from lib/constants so the shop name and phone are not retyped
 * (and therefore not mistyped) at each call site.
 */
import { readFileSync, writeFileSync } from 'fs'
import { watermarkForSocial, type Corner } from './lib/social-watermark'

const SHOP_NAME = 'Mod Fancy Dress'
const PHONE = '+91 99537 64137'

const args = process.argv.slice(2)
const positional = args.filter((a) => !a.startsWith('--'))
const flag = (name: string) => {
  const i = args.indexOf(`--${name}`)
  return i === -1 ? undefined : args[i + 1]
}

const [input, output] = positional
if (!input || !output) {
  console.error('usage: watermark-image.ts <input> <output> [--corner <pos>] [--ratio <n>] [--no-pad]')
  process.exit(1)
}

const corner = (flag('corner') ?? 'bottom-right') as Corner
// --ratio forces an exact ratio; by default the image is only padded when it
// falls outside Instagram's accepted range.
const forced = flag('ratio') ? Number(flag('ratio')) : undefined
const fit = args.includes('--no-pad')
  ? null
  : forced !== undefined
    ? { min: forced, max: forced }
    : undefined

watermarkForSocial(readFileSync(input), {
  shopName: flag('name') ?? SHOP_NAME,
  phone: flag('phone') ?? PHONE,
  corner,
  fit,
})
  .then(({ buffer, width, height, ratio }) => {
    writeFileSync(output, buffer)
    console.log(`${output}  ${width}x${height}  ratio ${ratio.toFixed(3)}  corner ${corner}`)
    if (ratio < 0.7999 || ratio > 1.9101) {
      console.error(`WARNING: ratio ${ratio.toFixed(3)} is outside Instagram's 0.80–1.91 range`)
      process.exit(1)
    }
  })
  .catch((e) => {
    console.error(e.message)
    process.exit(1)
  })
