// app/fleet/messages/components/ReplyBox.tsx
'use client'

import { useState, useRef, useCallback } from 'react'
import FilePreview, { FileWithPreview } from './FilePreview'
import { uploadMultipleAttachments, validateFile, UploadResult } from '@/lib/cloudinary-upload'

interface ReplyBoxProps {
  onSendReply: (reply: string, attachments?: UploadResult[]) => Promise<void>
  sending: boolean
}

export default function ReplyBox({ onSendReply, sending }: ReplyBoxProps) {
  const [reply, setReply] = useState('')
  const [showTemplates, setShowTemplates] = useState(false)
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const templates = [
    {
      id: 'approved',
      label: '✅ Approved',
      text: 'Your request has been approved. We will proceed with your booking.'
    },
    {
      id: 'need-info',
      label: '📋 Need More Info',
      text: 'Thank you for reaching out. Could you please provide more details about your inquiry?'
    },
    {
      id: 'received',
      label: '👍 Received',
      text: 'We have received your message and will get back to you within 24 hours.'
    },
    {
      id: 'resolved',
      label: '✓ Resolved',
      text: 'Your issue has been resolved. Please let us know if you need any further assistance.'
    }
  ]

  const handleSend = async () => {
    if ((!reply.trim() && files.length === 0) || sending || uploading) return

    try {
      let uploadedFiles: UploadResult[] = []

      // Upload files if any
      if (files.length > 0) {
        setUploading(true)
        uploadedFiles = await uploadMultipleAttachments(
          files.map(f => f.file),
          (fileIndex, progress) => {
            const fileId = files[fileIndex].id
            setUploadProgress(prev => ({
              ...prev,
              [fileId]: progress.percentage
            }))
          }
        )
      }

      // Send reply with attachments
      await onSendReply(reply, uploadedFiles)
      
      // Clear form
      setReply('')
      setFiles([])
      setUploadProgress({})
      setShowTemplates(false)
    } catch (error) {
      console.error('Failed to send reply:', error)
      alert('Failed to send message. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleTemplateSelect = (template: string) => {
    setReply(template)
    setShowTemplates(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Ctrl/Cmd + Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFileSelect = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles) return

    const newFiles: FileWithPreview[] = []
    
    Array.from(selectedFiles).forEach((file) => {
      // Validate file
      const validation = validateFile(file)
      if (!validation.valid) {
        alert(validation.error)
        return
      }

      // Create preview for images
      const id = `${Date.now()}-${Math.random()}`
      const fileWithPreview: FileWithPreview = {
        file,
        id
      }

      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setFiles(prev => prev.map(f => 
            f.id === id ? { ...f, preview: e.target?.result as string } : f
          ))
        }
        reader.readAsDataURL(file)
      }

      newFiles.push(fileWithPreview)
    })

    setFiles(prev => [...prev, ...newFiles])
  }, [])

  const handleRemoveFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
    setUploadProgress(prev => {
      const newProgress = { ...prev }
      delete newProgress[id]
      return newProgress
    })
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files)
    }
  }, [handleFileSelect])

  const isDisabled = sending || uploading

  return (
    <div className="space-y-3">
      {/* Quick Templates */}
      {showTemplates && (
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 sm:p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
              Quick Replies
            </h4>
            <button
              onClick={() => setShowTemplates(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleTemplateSelect(template.text)}
                className="text-left px-3 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-sm"
              >
                <div className="font-medium text-gray-900 dark:text-white mb-1">
                  {template.label}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                  {template.text}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* File Preview */}
      {files.length > 0 && (
        <FilePreview
          files={files}
          onRemove={handleRemoveFile}
          uploading={uploading}
          uploadProgress={uploadProgress}
        />
      )}

      {/* Reply Textarea with Drag & Drop */}
      <div
        className="relative"
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your reply... (Ctrl/Cmd + Enter to send)"
          disabled={isDisabled}
          className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          rows={4}
        />
        
        {/* Drag & Drop Overlay */}
        {dragActive && (
          <div className="absolute inset-0 bg-blue-500/10 border-2 border-dashed border-blue-500 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <svg className="w-12 h-12 text-blue-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                Drop files here
              </p>
            </div>
          </div>
        )}
        
        {/* Character Count */}
        <div className="absolute bottom-2 right-2 text-xs text-gray-400 dark:text-gray-500">
          {reply.length} chars
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Left Side - Template & Attach Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            disabled={isDisabled}
            className="flex items-center justify-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            <span className="hidden sm:inline">Quick Replies</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx,.txt"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isDisabled}
            className="flex items-center justify-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
            <span className="hidden sm:inline">Attach</span>
          </button>
        </div>

        {/* Right Side - Send Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSend}
            disabled={(!reply.trim() && files.length === 0) || isDisabled}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Uploading...</span>
              </>
            ) : sending ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Sending...</span>
              </>
            ) : (
              <>
                <span>Send Reply</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </>
            )}
          </button>

          {/* Keyboard Shortcut Hint - Desktop Only */}
          <div className="hidden lg:block text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
            ⌘/Ctrl + Enter
          </div>
        </div>
      </div>
    </div>
  )
}