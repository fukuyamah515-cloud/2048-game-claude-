import { createWorker } from 'tesseract.js'
import type { BusinessCardInput } from './types'

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
const PHONE_REGEX = /0\d{1,4}-\d{1,4}-\d{3,4}|0\d{9,10}/

/**
 * Best-effort field extraction from raw OCR text. Japanese business cards have no
 * fixed layout, so this only picks out email/phone by pattern and guesses
 * company/name from the remaining line order — the caller must let the user
 * review and correct the result before saving.
 */
export function parseCardFields(text: string): Partial<BusinessCardInput> {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  const result: Partial<BusinessCardInput> = {}

  const emailLine = lines.find((line) => EMAIL_REGEX.test(line))
  const email = emailLine?.match(EMAIL_REGEX)?.[0]
  if (email) result.email = email

  const phoneLine = lines.find((line) => PHONE_REGEX.test(line))
  const phone = phoneLine?.match(PHONE_REGEX)?.[0]
  if (phone) result.phone = phone

  const remaining = lines.filter((line) => line !== emailLine && line !== phoneLine)
  if (remaining[0]) result.company = remaining[0]
  if (remaining[1]) result.name = remaining[1]

  return result
}

const ROTATIONS = [0, 90, 180, 270] as const
// eng+jpn covers ordinary horizontal layouts (including Latin text like phone/email);
// jpn_vert covers the vertical-text company/name blocks common on Japanese cards.
const LANGUAGE_SETS = ['eng+jpn', 'jpn_vert'] as const

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('画像の読み込みに失敗しました'))
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Converts to grayscale and stretches the result to fill the full 0-255
 * range. This helps when a photo's contrast is muted (dim lighting, a faint
 * background pattern showing through the card) — it does not undo heavier
 * visual noise like a stamp or logo overlapping the text.
 */
function enhanceContrast(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data

  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
    data[i] = gray
    data[i + 1] = gray
    data[i + 2] = gray
  }

  let min = 255
  let max = 0
  for (let i = 0; i < data.length; i += 4) {
    if (data[i] < min) min = data[i]
    if (data[i] > max) max = data[i]
  }

  const range = max - min || 1
  for (let i = 0; i < data.length; i += 4) {
    const stretched = ((data[i] - min) / range) * 255
    data[i] = stretched
    data[i + 1] = stretched
    data[i + 2] = stretched
  }

  ctx.putImageData(imageData, 0, 0)
}

function rotateToCanvas(
  source: CanvasImageSource,
  width: number,
  height: number,
  degrees: (typeof ROTATIONS)[number],
): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  const swapDimensions = degrees === 90 || degrees === 270
  canvas.width = swapDimensions ? height : width
  canvas.height = swapDimensions ? width : height

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas context を取得できませんでした')
  ctx.translate(canvas.width / 2, canvas.height / 2)
  ctx.rotate((degrees * Math.PI) / 180)
  ctx.drawImage(source, -width / 2, -height / 2)
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  enhanceContrast(ctx, canvas.width, canvas.height)
  return canvas
}

export interface CardOcrEngine {
  /**
   * Tries every 90-degree rotation against both a horizontal and a vertical
   * language model and returns whichever combination tesseract reports the
   * highest confidence for. Reuse one engine across many pages/photos so the
   * (expensive) worker + language-model setup only happens once.
   */
  recognizeBestText(source: CanvasImageSource, width: number, height: number): Promise<string>
  terminate(): Promise<void>
}

export async function createCardOcrEngine(): Promise<CardOcrEngine> {
  const workers = await Promise.all(LANGUAGE_SETS.map((langs) => createWorker(langs)))

  return {
    async recognizeBestText(source, width, height) {
      let bestText = ''
      let bestConfidence = -1

      for (const degrees of ROTATIONS) {
        const canvas = rotateToCanvas(source, width, height, degrees)
        for (const worker of workers) {
          const { data } = await worker.recognize(canvas)
          if (data.confidence > bestConfidence) {
            bestConfidence = data.confidence
            bestText = data.text
          }
        }
      }

      return bestText
    },
    async terminate() {
      await Promise.all(workers.map((worker) => worker.terminate()))
    },
  }
}

export async function extractCardFieldsFromImage(
  file: File,
): Promise<Partial<BusinessCardInput>> {
  const engine = await createCardOcrEngine()
  try {
    const img = await loadImage(file)
    try {
      const text = await engine.recognizeBestText(img, img.naturalWidth, img.naturalHeight)
      return parseCardFields(text)
    } finally {
      URL.revokeObjectURL(img.src)
    }
  } finally {
    await engine.terminate()
  }
}
