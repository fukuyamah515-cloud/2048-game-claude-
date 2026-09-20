import { recognize } from 'tesseract.js'
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

export async function extractCardFieldsFromImage(
  file: File,
): Promise<Partial<BusinessCardInput>> {
  const { data } = await recognize(file, 'eng+jpn')
  return parseCardFields(data.text)
}
