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
