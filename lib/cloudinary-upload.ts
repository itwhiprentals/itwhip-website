// lib/cloudinary-upload.ts

export interface UploadResult {
    url: string
    name: string
    type: string
    size: number
    publicId: string
  }
  
  export interface UploadProgress {
    loaded: number
    total: number
    percentage: number
  }
  
  /**
   * Upload a file to Cloudinary via the message upload API
   * @param file - File to upload
   * @param onProgress - Optional progress callback
   * @returns Upload result with URL and metadata
   */
  export async function uploadMessageAttachment(
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    const formData = new FormData()
    formData.append('file', file)
  
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
  
      // Track upload progress
      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            onProgress({
              loaded: e.loaded,
              total: e.total,
              percentage: Math.round((e.loaded / e.total) * 100)
            })
          }
        })
      }
  
      // Handle completion
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText)
            if (response.success) {
              resolve(response.data)
            } else {
              reject(new Error(response.error || 'Upload failed'))
            }
          } catch (error) {
            reject(new Error('Failed to parse upload response'))
          }
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`))
        }
      })
  
      // Handle errors
      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'))
      })
  
      xhr.addEventListener('abort', () => {
        reject(new Error('Upload cancelled'))
      })
  
      // Send request
      xhr.open('POST', '/fleet/api/messages/upload?key=phoenix-fleet-2847')
      xhr.send(formData)
    })
  }
  
  /**
   * Upload multiple files sequentially
   * @param files - Array of files to upload
   * @param onFileProgress - Callback for individual file progress
   * @param onTotalProgress - Callback for overall progress
   * @returns Array of upload results
   */
  export async function uploadMultipleAttachments(
    files: File[],
    onFileProgress?: (fileIndex: number, progress: UploadProgress) => void,
    onTotalProgress?: (completed: number, total: number) => void
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = []
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      try {
        const result = await uploadMessageAttachment(file, (progress) => {
          if (onFileProgress) {
            onFileProgress(i, progress)
          }
        })
        
        results.push(result)
        
        if (onTotalProgress) {
          onTotalProgress(i + 1, files.length)
        }
      } catch (error) {
        console.error(`Failed to upload file ${file.name}:`, error)
        throw error
      }
    }
    
    return results
  }
  
  /**
   * Validate file before upload
   * @param file - File to validate
   * @returns Validation result with error message if invalid
   */
  export function validateFile(file: File): { valid: boolean; error?: string } {
    const MAX_SIZE = 5 * 1024 * 1024 // 5MB
    
    const ALLOWED_TYPES = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ]
  
    // Check file size
    if (file.size > MAX_SIZE) {
      return {
        valid: false,
        error: 'File too large. Maximum size is 5MB.'
      }
    }
  
    // Check file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: 'File type not allowed. Please upload images, PDFs, or documents.'
      }
    }
  
    return { valid: true }
  }
  
  /**
   * Format file size to human-readable string
   * @param bytes - File size in bytes
   * @returns Formatted string (e.g., "2.5 MB")
   */
  export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }
  
  /**
   * Get file icon based on file type
   * @param type - MIME type
   * @returns Icon identifier
   */
  export function getFileIcon(type: string): 'image' | 'pdf' | 'doc' | 'file' {
    if (type.startsWith('image/')) return 'image'
    if (type === 'application/pdf') return 'pdf'
    if (type.includes('word') || type.includes('document')) return 'doc'
    return 'file'
  }