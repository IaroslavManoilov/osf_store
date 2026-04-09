import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const publicDir = path.resolve(process.cwd(), 'public')
const supportedExtensions = new Set(['.png', '.jpg', '.jpeg'])
const skipFiles = new Set(['favicon.ico'])

const entries = await fs.readdir(publicDir, { withFileTypes: true })
const imageFiles = entries
  .filter((entry) => entry.isFile())
  .map((entry) => entry.name)
  .filter((name) => !skipFiles.has(name))
  .filter((name) => supportedExtensions.has(path.extname(name).toLowerCase()))

if (!imageFiles.length) {
  console.log('No source images found in /public.')
  process.exit(0)
}

for (const fileName of imageFiles) {
  const sourcePath = path.join(publicDir, fileName)
  const parsed = path.parse(fileName)
  const avifPath = path.join(publicDir, `${parsed.name}.avif`)
  const webpPath = path.join(publicDir, `${parsed.name}.webp`)

  const input = sharp(sourcePath).rotate()

  await input
    .clone()
    .avif({
      quality: 52,
      effort: 5
    })
    .toFile(avifPath)

  await input
    .clone()
    .webp({
      quality: 76,
      effort: 5
    })
    .toFile(webpPath)

  console.log(`Optimized: ${fileName} -> ${path.basename(avifPath)}, ${path.basename(webpPath)}`)
}

console.log(`Done. Optimized ${imageFiles.length} images.`)

