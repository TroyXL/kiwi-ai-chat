type Nullable<T> = T | null
type Optional<T> = T | undefined
type Nilable<T> = T | null | undefined

type Theme = 'light' | 'dark' | 'system'

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
  type: string
  status: 'GENERATING' | 'COMMITTING' | 'SUCCESSFUL' | 'FAILED'
  attempts: Attempt[]
}

// Represents a single, complete AI generation interaction.
interface Exchange {
  id: string
  appId: string
  userId: string
  first: boolean
  prompt: string
  status:
    | 'PLANNING'
    | 'GENERATING'
    | 'SUCCESSFUL'
    | 'FAILED'
    | 'CANCELLED'
    | 'REVERTED'
  stages: Stage[]
  errorMessage: string | null
  productURL: string | null
  managementURL: string | null
}

type PreviewMode = 'desktop' | 'mobile' | 'disabled'
