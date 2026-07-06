import { useRef, useState } from 'react'
import { UploadCloud, X } from 'lucide-react'
import { API_BASE_URL, getApiMessage, readApiJson } from '../utils/api'

interface ImageUploadFieldProps {
  value: string
  onChange: (url: string) => void
}

export function ImageUploadField({ value, onChange }: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`${API_BASE_URL}/api/admin/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })
      const data = await readApiJson<{ url?: string; message?: string }>(response)
      if (!response.ok || !data?.url) {
        throw new Error(getApiMessage(data) ?? 'Không thể tải ảnh lên.')
      }
      onChange(data.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải ảnh lên.')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="image-upload-field">
      <div className="image-upload-preview">
        {value ? <img src={value} alt="Xem trước ảnh" /> : <span>Chưa có ảnh</span>}
      </div>
      <div className="image-upload-actions">
        <button type="button" className="secondary-btn" onClick={() => inputRef.current?.click()} disabled={uploading}>
          <UploadCloud size={15} />
          {uploading ? 'Đang tải lên...' : value ? 'Đổi ảnh khác' : 'Tải ảnh lên'}
        </button>
        {value ? (
          <button type="button" className="image-upload-clear" onClick={() => onChange('')} disabled={uploading}>
            <X size={14} /> Xoá ảnh
          </button>
        ) : null}
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={handleFileSelected}
          style={{ display: 'none' }}
        />
      </div>
      <label className="image-upload-manual">
        Hoặc dán đường dẫn ảnh thủ công
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="/assets/ten-anh.png hoặc https://..." />
      </label>
      {error ? <p className="status-message error compact">{error}</p> : null}
    </div>
  )
}