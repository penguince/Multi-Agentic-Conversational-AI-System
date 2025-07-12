// lib/api/crm.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/crm'

export interface CRMUser {
  id: string
  name?: string
  email?: string
  phone?: string
  company?: string
  job_title?: string
  preferences?: {
    communication_channel?: string
    product_interests?: string[]
    budget_range?: string
    timezone?: string
    language?: string
  }
  tags?: string[]
  notes?: string
  created_at: string
  updated_at: string
  last_interaction?: string
  total_conversations: number
}

export interface CreateUserData {
  name?: string
  email?: string
  phone?: string
  company?: string
  job_title?: string
  preferences?: {
    communication_channel?: string
    product_interests?: string[]
    budget_range?: string
    timezone?: string
    language?: string
  }
  tags?: string[]
  notes?: string
}

export interface UpdateUserData extends Partial<CreateUserData> {}

class CRMApiClient {
  private baseURL: string

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
  }

  async getUsers(params?: { skip?: number; limit?: number; search?: string }): Promise<CRMUser[]> {
    const searchParams = new URLSearchParams()
    if (params?.skip) searchParams.append('skip', params.skip.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.search) searchParams.append('search', params.search)

    const url = `${this.baseURL}/users${searchParams.toString() ? `?${searchParams}` : ''}`
    console.log('Fetching users from:', url)
    
    try {
      const response = await fetch(url)
      console.log('Response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error:', errorText)
        throw new Error(`Failed to fetch users: ${response.status} - ${errorText}`)
      }
      
      const data = await response.json()
      console.log('Users fetched successfully:', data)
      return data
    } catch (error) {
      console.error('Network error:', error)
      throw error
    }
  }

  async getUser(userId: string): Promise<CRMUser> {
    const response = await fetch(`${this.baseURL}/users/${userId}`)
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to fetch user: ${response.status} - ${errorText}`)
    }
    return response.json()
  }

  async createUser(userData: CreateUserData): Promise<CRMUser> {
    console.log('Creating user with data:', userData)
    
    try {
      const response = await fetch(`${this.baseURL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })
      
      console.log('Create user response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Create user error:', errorText)
        throw new Error(`Failed to create user: ${response.status} - ${errorText}`)
      }
      
      const data = await response.json()
      console.log('User created successfully:', data)
      return data
    } catch (error) {
      console.error('Network error creating user:', error)
      throw error
    }
  }

  async updateUser(userId: string, userData: UpdateUserData): Promise<CRMUser> {
    const response = await fetch(`${this.baseURL}/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to update user: ${response.status} - ${errorText}`)
    }
    return response.json()
  }

  async deleteUser(userId: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/users/${userId}`, {
      method: 'DELETE',
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to delete user: ${response.status} - ${errorText}`)
    }
  }

  async extractUserData(conversationId: string): Promise<any> {
    const response = await fetch(`${this.baseURL}/extract-user-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ conversation_id: conversationId }),
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to extract user data: ${response.status} - ${errorText}`)
    }
    return response.json()
  }
}

export const crmApi = new CRMApiClient()