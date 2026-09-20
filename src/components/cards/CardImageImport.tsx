import { useState } from 'react'
import type { ChangeEvent } from 'react'
import { extractCardFieldsFromImage } from '../../cards/ocr'
import type { BusinessCardInput } from '../../cards/types'

interface CardImageImportProps {
  onExtracted: (fields: Partial<BusinessCardInput>) => void
  onCancel: () => void
}

export function CardImageImport({ onExtracted, onCancel }: CardImageImportProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setStatus('loading')
    try {
      const fields = await extractCardFieldsFromImage(file)
      onExtracted(fields)
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="card-image-import">
      <label className="card-image-import-input">
        名刺の画像を選択（撮影 or ライブラリから選択）
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          disabled={status === 'loading'}
        />
      </label>
      {status === 'loading' && <p>画像を読み取り中…</p>}
      {status === 'error' && (
        <>
          <p className="card-image-import-error">読み取りに失敗しました。手動で入力してください。</p>
          <button type="button" onClick={() => onExtracted({})}>
            手動で入力する
          </button>
        </>
      )}
      <button type="button" onClick={onCancel}>
        キャンセル
      </button>
    </div>
  )
}
