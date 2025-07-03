// Represents the standard paginated response structure.
export interface SearchResult<T> {
  items: T[];
  total: number;
}

// Represents a user application.
export interface Application {
  id: string;
  name: string;
  ownerId: string;
}

// Represents a single attempt to complete a stage.
export interface Attempt {
  id:string;
  status: 'RUNNING' | 'SUCCESSFUL' | 'FAILED';
  errorMessage: string | null;
}

// Represents a major step within an Exchange (e.g., BACKEND, FRONTEND).
export interface Stage {
  id: string;
  type: string;
  status: 'GENERATING' | 'COMMITTING' | 'SUCCESSFUL' | 'FAILED';
  attempts: Attempt[];
}

// Represents a single, complete AI generation interaction.
export interface Exchange {
  id: string;
  appId: string;
  userId: string;
  first: boolean;
  prompt: string;
  status: 'PLANNING' | 'GENERATING' | 'SUCCESSFUL' | 'FAILED' | 'CANCELLED';
  stages: Stage[];
  errorMessage: string | null;
  productURL: string | null;
  managementURL: string | null;
}