---
name: watermark-social-image
description: Use when an image is about to be posted to Instagram or any social account, or when preparing a product/catalogue photo for posting — these arrive with no shop name, no phone number, and often in an aspect ratio the platform crops.
---

# Watermark a social image

## Overview

Product photos on this site carry no contact details. Once a post is reshared or
screenshotted, an unbranded photo is an advert for nobody. This stamps the shop
name and phone onto the image and fixes the aspect ratio before it goes out.

**One command:**

```bash
npx tsx scripts/watermark-image.ts <input.jpg> <output.jpg> --corner bottom-left
```

Defaults: `Mod Fancy Dress` / `+91 99537 64137`, bottom-right, padded to 4:5.
Override with `--name`, `--phone`, `--corner`, `--ratio`, `--no-pad`.

## This is not the catalogue watermark

`scripts/lib/watermark.ts` tiles `@modfancydress` faintly across the whole canvas
at 0.14 opacity so branding survives a client screenshotting the private supplier
catalogue. It is anti-theft and deliberately hard to read.

A marketing post wants the opposite: **one legible badge a stranger can read and
dial**. Use `scripts/lib/social-watermark.ts` for anything public-facing.

## Pick the corner by looking at the image

The default corner is not always right. Choose the emptiest region:

| Corner | Use when |
|---|---|
| `bottom-left` | Subject sits right of centre, or floor/background is clear on the left |
| `bottom-right` | Subject sits left of centre |
| `bottom-center` | Symmetrical flat-lays with margin at the bottom |
| `top-left` / `top-right` | Anything with a busy lower half |

A collage is the common trap: a badge dropped in the default corner lands on the
face panel. On the Gandhi Jayanti post, `bottom-right` covered the child's chin
and `bottom-left` sat on empty floor.

## Aspect ratio

Instagram feed accepts **0.80 (4:5) to 1.91**. Outside that it crops or rejects.

Portrait product shots are often 2:3 (0.667) and get their edges chopped. The
script pads with white bars rather than cropping, so nothing is lost, and it
**exits non-zero** if the result is still out of range.

## Always look at the output before posting

```bash
ffmpeg -y -i out.jpg -vf "crop=iw:460:0:ih-460,scale=900:-1" check.png
```

Then read `check.png`. Verify: text not clipped, badge not covering a face or the
garment, phone digits correct. Posting is public and hard to take back — the
badge is the one part no reviewer will catch for you.

## Common mistakes

| Mistake | Fix |
|---|---|
| Posting the raw product image | It has no phone number on it. Watermark first. |
| Using the tiled catalogue watermark | Unreadable by design. Wrong tool for a post. |
| Trusting the default corner | Look at the image. Collages especially. |
| Skipping the visual check | Text clipping and face-covering only show up visually. |
| Cropping to fix the ratio | Pad instead — cropping loses the product. |
