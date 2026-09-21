import { mkdir, writeFile, copyFile } from 'node:fs/promises'
import sharp from 'sharp'

const source = new URL('../mainsource-logo.png', import.meta.url)
const output = new URL('../public/', import.meta.url)
await mkdir(new URL('assets/', output), { recursive: true })
await mkdir(new URL('licenses/', output), { recursive: true })
for (const font of ['manrope', 'dm-sans']) {
  await copyFile(new URL(`../node_modules/@fontsource-variable/${font}/LICENSE`, import.meta.url), new URL(`licenses/${font}.txt`, output))
}

// Resizing and encoding only: the complete supplied logo stays unchanged.
await Promise.all([
  sharp(source.pathname).resize({ width: 428 }).webp({ quality: 90 }).toFile(new URL('assets/mainsource-logo.webp', output).pathname),
  sharp(source.pathname).resize({ width: 856 }).webp({ quality: 90 }).toFile(new URL('assets/mainsource-logo-large.webp', output).pathname),
])

// The favicon uses the existing mascot from the supplied artwork, not a new mark.
const mark = await sharp(source.pathname)
  .extract({ left: 190, top: 100, width: 380, height: 535 })
  .resize(180, 180, { fit: 'contain', background: '#ffffff' })
  .png().toBuffer()
await writeFile(new URL('apple-touch-icon.png', output), mark)
const favicon = await sharp(mark).resize(32, 32).png().toBuffer()
await writeFile(new URL('favicon-32.png', output), favicon)
// ICO directory pointing to a standards-compliant PNG payload.
const icoHeader = Buffer.alloc(22)
icoHeader.writeUInt16LE(1, 2)
icoHeader.writeUInt16LE(1, 4)
icoHeader[6] = 32
icoHeader[7] = 32
icoHeader.writeUInt16LE(1, 10)
icoHeader.writeUInt16LE(32, 12)
icoHeader.writeUInt32LE(favicon.length, 14)
icoHeader.writeUInt32LE(22, 18)
await writeFile(new URL('favicon.ico', output), Buffer.concat([icoHeader, favicon]))

const socialLogo = await sharp(source.pathname).resize({ width: 1030 }).png().toBuffer()
await sharp({ create: { width: 1200, height: 630, channels: 3, background: '#ffffff' } })
  .composite([{ input: socialLogo, gravity: 'centre' }])
  .png().toFile(new URL('og-image.png', output).pathname)
console.log('Generated web logos, original-artwork favicons and social preview.')
