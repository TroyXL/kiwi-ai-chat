type Nullable<T> = T | null
type Optional<T> = T | undefined
type Nilable<T> = T | null | undefined

interface ErrorResponse {
  code: number
  message: string
}

// 文件上传响应类型定义
interface MultiUploadResult {
  urls: string[]
}

interface UploadResult {
  url: string
}

interface FileInfo {
  id: string
  fileName: string
  contentType: string
  url: string
}

type Theme = 'light' | 'dark' | 'system'

interface UserData {
  id: string
  name: string
  allowSourceDownload: boolean
}

interface LoginResponse {
  token: string
  user: UserData
}

interface SearchResult<T> {
  items: T[]
  total: number
}

// Represents a user application.
interface Application {
  id: string
  name: string
  ownerId: string
}

// Represents a single attempt to complete a stage.
interface Attempt {
  id: string
  status: 'RUNNING' | 'SUCCESSFUL' | 'FAILED'
  errorMessage: string | null
}

// Represents a major step within an Exchange (e.g., BACKEND, FRONTEND).
interface Stage {
  id: string
  type: "FRONTEND" | "BACKEND" | "TEST"
  status: 'GENERATING' | 'COMMITTING' | 'SUCCESSFUL' | 'FAILED' | 'REJECTED'
}

// Represents a single, complete AI generation interaction.
interface Exchange {
  id: string
  appId: string
  prompt: string
  attachmentUrls?: string[]
  status:
    | 'PLANNING'
    | 'GENERATING'
    | 'TESTING'
    | 'SUCCESSFUL'
    | 'FAILED'
    | 'CANCELLED'
    | 'REVERTED'
  stages: Stage[]
  errorMessage: string | null
  productURL: string | null
  managementURL: string | null
  sourceCodeURL: string | null
  testPageId: string | null
  chainDepth: number
}

type PreviewMode = 'desktop' | 'mobile' | 'disabled'

interface GenerateCodeListeners {
  onMessage: (event: Exchange) => void
  onClose: () => void
  onError: (err: any) => void
}

type AutoTestActionType = "STEP" | "PASSED" | "FAILED"

interface AutoTestAction {
  type: AutoTestActionType
  desc: string
  content: string
}