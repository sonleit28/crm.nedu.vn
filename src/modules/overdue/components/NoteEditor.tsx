import { useState } from 'react'
import { Textarea } from '@shared/components/ui/Input'
import { Button } from '@shared/components/ui/Button'

interface NoteEditorProps {
  onSave: (note: string) => Promise<void> | void
  onCancel: () => void
  saving?: boolean
}

export function NoteEditor({ onSave, onCancel, saving = false }: NoteEditorProps) {
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    const trimmed = value.trim()
    if (trimmed.length < 3) {
      setError('Ghi chú phải có ít nhất 3 ký tự.')
      return
    }
    setError(null)
    await onSave(trimmed)
  }

  return (
    <div className="space-y-2 mt-2">
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Nhập ghi chú..."
        rows={3}
        autoFocus
      />
      {error && <div className="text-[11px] text-red">{error}</div>}
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={saving}>
          Hủy
        </Button>
        <Button variant="primary" size="sm" onClick={handleSave} loading={saving}>
          Lưu
        </Button>
      </div>
    </div>
  )
}
