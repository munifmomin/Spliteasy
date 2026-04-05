export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string
          email: string
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          display_name: string
          email: string
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          display_name?: string
          avatar_url?: string | null
        }
      }
      groups: {
        Row: {
          id: string
          name: string
          description: string | null
          created_by: string | null
          invite_code: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_by?: string | null
          invite_code?: string
          created_at?: string
        }
        Update: {
          name?: string
          description?: string | null
        }
      }
      group_members: {
        Row: {
          id: string
          group_id: string
          user_id: string
          role: 'admin' | 'member'
          joined_at: string
        }
        Insert: {
          id?: string
          group_id: string
          user_id: string
          role?: 'admin' | 'member'
          joined_at?: string
        }
        Update: {
          role?: 'admin' | 'member'
        }
      }
      expenses: {
        Row: {
          id: string
          group_id: string
          paid_by: string
          title: string
          amount: number
          split_type: 'equal' | 'custom'
          notes: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          group_id: string
          paid_by: string
          title: string
          amount: number
          split_type?: 'equal' | 'custom'
          notes?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          title?: string
          amount?: number
          split_type?: 'equal' | 'custom'
          notes?: string | null
        }
      }
      expense_splits: {
        Row: {
          id: string
          expense_id: string
          user_id: string
          amount: number
          is_settled: boolean
        }
        Insert: {
          id?: string
          expense_id: string
          user_id: string
          amount: number
          is_settled?: boolean
        }
        Update: {
          amount?: number
          is_settled?: boolean
        }
      }
      settlements: {
        Row: {
          id: string
          group_id: string
          paid_by: string
          paid_to: string
          amount: number
          confirmed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          group_id: string
          paid_by: string
          paid_to: string
          amount: number
          confirmed?: boolean
          created_at?: string
        }
        Update: {
          confirmed?: boolean
        }
      }
    }
  }
}

// Convenience types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Group = Database['public']['Tables']['groups']['Row']
export type GroupMember = Database['public']['Tables']['group_members']['Row']
export type Expense = Database['public']['Tables']['expenses']['Row']
export type ExpenseSplit = Database['public']['Tables']['expense_splits']['Row']
export type Settlement = Database['public']['Tables']['settlements']['Row']
