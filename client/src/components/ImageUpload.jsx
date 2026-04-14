import React, { useState } from 'react'
import { useDropzone } from 'react-dropzone'

export default function ImageUpload({ onUpload, isLoading }) {
  const [preview, setPreview] = useState(null)

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      const reader = new FileReader()

      reader.onloadend = () => {
        setPreview(reader.result)
      }

      reader.readAsDataURL(file)
      onUpload(file)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
    },
    disabled: isLoading,
  })

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
        isDragActive
          ? 'border-primary bg-primary/10'
          : 'border-border hover:border-primary hover:bg-primary/5'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <input {...getInputProps()} />

      {preview ? (
        <div className="space-y-4">
          <img
            src={preview}
            alt="Preview"
            className="max-h-64 mx-auto rounded-lg border border-border"
          />
          <button
            onClick={(e) => {
              e.stopPropagation()
              setPreview(null)
            }}
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            Choose different image
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-4xl">🎵</div>
          <div>
            <p className="text-foreground font-semibold">
              {isDragActive
                ? 'Drop your image here'
                : 'Drag an image or click to select'}
            </p>
            <p className="text-sm text-muted mt-1">
              Supported formats: JPG, PNG, GIF, WebP
            </p>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
            <p className="text-sm text-foreground">Analyzing image...</p>
          </div>
        </div>
      )}
    </div>
  )
}
