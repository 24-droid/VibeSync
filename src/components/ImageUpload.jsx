import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, ImageIcon } from 'lucide-react'

export default function ImageUpload({ onUpload, isLoading }) {
  const [preview, setPreview] = useState(null)

  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      const reader = new FileReader()
      reader.onload = (e) => { setPreview(e.target.result); onUpload(file) }
      reader.readAsDataURL(file)
    }
  }, [onUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] },
    multiple: false,
  })

  return (
    <div className="h-full">
      {preview ? (
        <div className="relative rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
          <img src={preview} alt="Preview" className="w-full max-h-96 object-cover" />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <button
            onClick={() => setPreview(null)}
            className="absolute top-3 right-3 p-2 rounded-xl bg-black/50 text-white/70 hover:text-white hover:bg-black/70 transition-all backdrop-blur-sm"
          >
            <X className="w-4 h-4" />
          </button>
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center"
              style={{ background: 'rgba(7,7,17,0.75)', backdropFilter: 'blur(4px)' }}>
              <div
                className="w-10 h-10 rounded-full border-2 border-white/10 border-t-indigo-400 mb-4"
                style={{ animation: 'spin-slow 0.8s linear infinite' }}
              />
              <p className="text-white/70 text-sm font-medium">Analyzing your vibe...</p>
            </div>
          )}
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`cursor-pointer rounded-2xl transition-all duration-300 flex flex-col items-center justify-center py-16 px-8 text-center ${isDragActive
              ? 'border-indigo-500/60 bg-indigo-500/10'
              : 'hover:border-indigo-500/40 hover:bg-indigo-500/5'
            }`}
          style={{
            background: isDragActive ? undefined : 'rgba(255,255,255,0.02)',
            border: `2px dashed ${isDragActive ? 'rgba(99,102,241,0.6)' : 'rgba(255,255,255,0.09)'}`,
          }}
        >
          <input {...getInputProps()} />
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
            style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.2),rgba(236,72,153,0.2))', border: '1px solid rgba(99,102,241,0.2)' }}
          >
            {isDragActive
              ? <Upload className="w-7 h-7 text-indigo-400" />
              : <ImageIcon className="w-7 h-7 text-indigo-400" />
            }
          </div>
          <p className="text-lg font-bold text-white mb-1.5">
            {isDragActive ? 'Drop it here!' : 'Drop an image here'}
          </p>
          <p className="text-white/35 text-sm mb-4">or click to browse your files</p>
          <span className="px-3 py-1 rounded-full text-xs text-white/25 border border-white/[0.07]">
            PNG · JPG · WEBP · GIF
          </span>
        </div>
      )}
    </div>
  )
}
