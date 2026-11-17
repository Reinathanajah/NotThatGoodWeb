import { type FormEvent, useState } from 'react'

interface NewFolderInlineFormProps {
  creatingFolder: boolean
  folderError: string | null
  onCreateFolder: (name: string) => Promise<boolean>
  onClearFolderError: () => void
  onDone: () => void
}

export function NewFolderInlineForm({
  creatingFolder,
  folderError,
  onCreateFolder,
  onClearFolderError,
  onDone,
}: NewFolderInlineFormProps) {
  const [folderName, setFolderName] = useState('')

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (await onCreateFolder(folderName)) {
      setFolderName('')
      onDone()
    }
  }

  return (
    <form className="pf-folder-form" onSubmit={handleSubmit}>
      <div className="foundation-field" style={{ flex: '1 1 240px' }}>
        <label htmlFor="pf-new-folder-name">Folder name</label>
        <input
          id="pf-new-folder-name"
          type="text"
          maxLength={255}
          value={folderName}
          disabled={creatingFolder}
          aria-invalid={folderError ? 'true' : undefined}
          placeholder="e.g. Semester 4 Notes"
          onChange={(e) => {
            setFolderName(e.target.value)
            if (folderError) onClearFolderError()
          }}
        />
        {folderError ? <p className="foundation-field-error" role="alert">{folderError}</p> : null}
      </div>
      <button type="submit" className="sf-btn sf-btn--primary" disabled={creatingFolder}>
        {creatingFolder ? 'Creating...' : 'Create folder'}
      </button>
    </form>
  )
}
