import { useState } from 'react'
import type { ChangeEvent } from 'react'
import { extractCardFieldsFromFile } from '../../cards/cardImport'
import type { BusinessCardInput } from '../../cards/types'

interface CardImageImportProps {
  onExtracted: (fieldsList: Partial<BusinessCardInput>[]) => void
  onCancel: () => void
}

export function CardImageImport({ onExtracted, onCancel }: CardImageImportProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setStatus('loading')
    try {
      const fieldsList = await extractCardFieldsFromFile(file)
      onExtracted(fieldsList.length > 0 ? fieldsList : [{}])
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="card-image-import">
      <label className="card-image-import-input">
        名刺の画像またはPDFを選択（複数ページのPDFは1ページ=1枚として登録できます）
        <input
          type="file"
          accept="image/*,application/pdf"
          capture="environment"
          onChange={handleFileChange}
          disabled={status === 'loading'}
        />
      </label>
      {status === 'loading' && <p>読み取り中…（複数ページのPDFは時間がかかります）</p>}
      {status === 'error' && (
        <>
          <p className="card-image-import-error">読み取りに失敗しました。手動で入力してください。</p>
          <button type="button" onClick={() => onExtracted([{}])}>
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
