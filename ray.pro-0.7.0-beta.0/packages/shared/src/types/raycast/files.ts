export interface RaycastAiFiles {
  id: string
  key: string
  filename: string // Get from request
  content_type: string // Get from request
  metadata: Record<string, any>
  service_name: string
  byte_size: number // Get from request
  checksum: string // Get from request
  created_at: string
  attachable_sgid: string
  signed_id: string
  direct_upload: {
    url: string
    headers: {
      'Content-Type': string
      'Content-MD5': string
      'Content-Disposition': string
    }
  }
}

export interface RaycastAiFilesRequest {
  chat_id: string
  blob: {
    filename: string
    checksum: string
    byte_size: number
    content_type: string
  }
}

export interface RaycastAiFilesGet {
  id: string // Get from request
  attachment_url: string
  expires_at: number
}
