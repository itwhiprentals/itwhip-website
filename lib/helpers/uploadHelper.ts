// lib/helpers/uploadHelper.ts

/**
 * Upload Helper for Appeal Evidence
 * Handles file validation, size checks, and Cloudinary URL formatting
 */

// ============================================
// CONFIGURATION
// ============================================

export const UPLOAD_CONFIG = {
    maxFiles: 5,
    maxFileSize: 5 * 1024 * 1024, // 5MB in bytes
    allowedImageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    allowedDocTypes: ['application/pdf'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.pdf']
  }
  
  // ============================================
  // TYPES
  // ============================================
  
  export interface FileValidationResult {
    isValid: boolean
    error?: string
    fileName?: string
    fileSize?: number
    fileType?: string
  }
  
  export interface EvidenceFile {
    url: string
    fileName: string
    fileSize: number
    fileType: string
    uploadedAt: Date
  }
  
  // ============================================
  // FILE VALIDATION
  // ============================================
  
  /**
   * Validate a single file
   */
  export function validateFile(file: File): FileValidationResult {
    // Check if file exists
    if (!file) {
      return {
        isValid: false,
        error: 'No file provided'
      }
    }
  
    // Check file size
    if (file.size > UPLOAD_CONFIG.maxFileSize) {
      return {
        isValid: false,
        error: `File size exceeds ${UPLOAD_CONFIG.maxFileSize / 1024 / 1024}MB limit`,
        fileName: file.name,
        fileSize: file.size
      }
    }
  
    // Check file type
    const allowedTypes = [
      ...UPLOAD_CONFIG.allowedImageTypes,
      ...UPLOAD_CONFIG.allowedDocTypes
    ]
  
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'Invalid file type. Only images (JPG, PNG, WEBP) and PDFs are allowed',
        fileName: file.name,
        fileType: file.type
      }
    }
  
    // Check file extension
    const fileExtension = file.name.toLowerCase().match(/\.[^.]+$/)?.[0]
    if (!fileExtension || !UPLOAD_CONFIG.allowedExtensions.includes(fileExtension)) {
      return {
        isValid: false,
        error: 'Invalid file extension',
        fileName: file.name
      }
    }
  
    return {
      isValid: true,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    }
  }
  
  /**
   * Validate multiple files
   */
  export function validateFiles(files: File[]): {
    isValid: boolean
    errors: string[]
    validFiles: File[]
  } {
    const errors: string[] = []
    const validFiles: File[] = []
  
    // Check file count
    if (files.length > UPLOAD_CONFIG.maxFiles) {
      return {
        isValid: false,
        errors: [`Maximum ${UPLOAD_CONFIG.maxFiles} files allowed`],
        validFiles: []
      }
    }
  
    // Validate each file
    files.forEach((file, index) => {
      const result = validateFile(file)
      if (result.isValid) {
        validFiles.push(file)
      } else {
        errors.push(`File ${index + 1} (${file.name}): ${result.error}`)
      }
    })
  
    return {
      isValid: errors.length === 0,
      errors,
      validFiles
    }
  }
  
  // ============================================
  // URL VALIDATION
  // ============================================
  
  /**
   * Validate Cloudinary URL
   */
  export function isValidCloudinaryUrl(url: string): boolean {
    if (!url || typeof url !== 'string') return false
  
    try {
      const urlObj = new URL(url)
      
      // Check if it's a Cloudinary URL
      return (
        urlObj.hostname.includes('cloudinary.com') ||
        urlObj.hostname.includes('res.cloudinary.com')
      )
    } catch {
      return false
    }
  }
  
  /**
   * Validate evidence URL array
   */
  export function validateEvidenceUrls(urls: string[]): {
    isValid: boolean
    errors: string[]
    validUrls: string[]
  } {
    const errors: string[] = []
    const validUrls: string[] = []
  
    if (!Array.isArray(urls)) {
      return {
        isValid: false,
        errors: ['Evidence must be an array of URLs'],
        validUrls: []
      }
    }
  
    if (urls.length > UPLOAD_CONFIG.maxFiles) {
      return {
        isValid: false,
        errors: [`Maximum ${UPLOAD_CONFIG.maxFiles} files allowed`],
        validUrls: []
      }
    }
  
    urls.forEach((url, index) => {
      if (isValidCloudinaryUrl(url)) {
        validUrls.push(url)
      } else {
        errors.push(`Invalid URL at position ${index + 1}`)
      }
    })
  
    return {
      isValid: errors.length === 0,
      errors,
      validUrls
    }
  }
  
  // ============================================
  // EVIDENCE FORMATTING
  // ============================================
  
  /**
   * Format evidence for database storage
   */
  export function formatEvidenceForStorage(urls: string[]): EvidenceFile[] {
    return urls.map(url => ({
      url,
      fileName: extractFileNameFromUrl(url),
      fileSize: 0, // Unknown from URL
      fileType: extractFileTypeFromUrl(url),
      uploadedAt: new Date()
    }))
  }
  
  /**
   * Extract filename from Cloudinary URL
   */
  export function extractFileNameFromUrl(url: string): string {
    try {
      const urlObj = new URL(url)
      const pathParts = urlObj.pathname.split('/')
      const fileName = pathParts[pathParts.length - 1]
      return decodeURIComponent(fileName)
    } catch {
      return 'unknown'
    }
  }
  
  /**
   * Extract file type from URL
   */
  export function extractFileTypeFromUrl(url: string): string {
    const extension = url.toLowerCase().match(/\.[^.]+$/)?.[0]
    
    const typeMap: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.pdf': 'application/pdf'
    }
  
    return extension ? typeMap[extension] || 'unknown' : 'unknown'
  }
  
  // ============================================
  // HELPER FUNCTIONS
  // ============================================
  
  /**
   * Format file size for display
   */
  export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
  
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
  
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }
  
  /**
   * Check if file is an image
   */
  export function isImageFile(fileType: string): boolean {
    return UPLOAD_CONFIG.allowedImageTypes.includes(fileType)
  }
  
  /**
   * Check if file is a PDF
   */
  export function isPdfFile(fileType: string): boolean {
    return UPLOAD_CONFIG.allowedDocTypes.includes(fileType)
  }
  
  /**
   * Sanitize filename for safe storage
   */
  export function sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars with underscore
      .replace(/_{2,}/g, '_') // Replace multiple underscores with single
      .toLowerCase()
  }
  
  /**
   * Generate unique filename
   */
  export function generateUniqueFileName(originalName: string): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    const extension = originalName.match(/\.[^.]+$/)?.[0] || ''
    const baseName = originalName.replace(/\.[^.]+$/, '').substring(0, 20)
    
    return `${sanitizeFileName(baseName)}_${timestamp}_${random}${extension}`
  }
  
  // ============================================
  // CLOUDINARY HELPERS
  // ============================================
  
  /**
   * Get Cloudinary upload preset based on file type
   */
  export function getCloudinaryPreset(fileType: string): string {
    if (isImageFile(fileType)) {
      return 'appeal_images' // You'll need to create this preset in Cloudinary
    }
    if (isPdfFile(fileType)) {
      return 'appeal_documents' // You'll need to create this preset in Cloudinary
    }
    return 'appeal_general'
  }
  
  /**
   * Build Cloudinary upload options
   */
  export function getCloudinaryUploadOptions(file: File) {
    return {
      folder: 'appeals/evidence',
      resource_type: isPdfFile(file.type) ? 'raw' : 'image',
      allowed_formats: UPLOAD_CONFIG.allowedExtensions.map(ext => ext.replace('.', '')),
      max_file_size: UPLOAD_CONFIG.maxFileSize,
      unique_filename: true,
      overwrite: false,
      tags: ['appeal', 'evidence']
    }
  }
  
  // ============================================
  // VALIDATION ERROR MESSAGES
  // ============================================
  
  export const VALIDATION_MESSAGES = {
    FILE_TOO_LARGE: `File size must be less than ${UPLOAD_CONFIG.maxFileSize / 1024 / 1024}MB`,
    INVALID_TYPE: 'Only images (JPG, PNG, WEBP) and PDFs are allowed',
    TOO_MANY_FILES: `Maximum ${UPLOAD_CONFIG.maxFiles} files allowed`,
    NO_FILE: 'Please select a file to upload',
    INVALID_URL: 'Invalid file URL',
    UPLOAD_FAILED: 'Failed to upload file. Please try again.'
  }