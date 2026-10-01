export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          timezone: string | null
          theme: string | null
          week_start: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          timezone?: string | null
          theme?: string | null
          week_start?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          timezone?: string | null
          theme?: string | null
          week_start?: number | null
          created_at?: string
          updated_at?: string
        },
        Relationships: []
      }
      challenges: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          start_date: string
          end_date: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          start_date: string
          end_date: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          start_date?: string
          end_date?: string
          status?: string
          created_at?: string
          updated_at?: string
        },
        Relationships: []
      }
      categories: {
        Row: {
          id: string
          user_id: string
          name: string
          icon: string | null
          color: string | null
          is_default: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          icon?: string | null
          color?: string | null
          is_default?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          icon?: string | null
          color?: string | null
          is_default?: boolean
          created_at?: string
        },
        Relationships: [
          {
            foreignKeyName: 'goals_category_id_fkey'
            columns: ['id']
            isOneToOne: false
            referencedRelation: 'goals'
            referencedColumns: ['category_id']
          }
        ]
      }
      goals: {
        Row: {
          id: string
          user_id: string
          challenge_id: string | null
          category_id: string | null
          title: string
          description: string | null
          goal_type: string
          unit: string | null
          target_value: number | null
          initial_value: number
          priority: string
          start_date: string
          due_date: string
          recurrence_config: Json | null
          status: string
          display_order: number | null
          created_at: string
          updated_at: string
          archived_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          challenge_id?: string | null
          category_id?: string | null
          title: string
          description?: string | null
          goal_type: string
          unit?: string | null
          target_value?: number | null
          initial_value?: number
          priority?: string
          start_date: string
          due_date: string
          recurrence_config?: Json | null
          status?: string
          display_order?: number | null
          created_at?: string
          updated_at?: string
          archived_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          challenge_id?: string | null
          category_id?: string | null
          title?: string
          description?: string | null
          goal_type?: string
          unit?: string | null
          target_value?: number | null
          initial_value?: number
          priority?: string
          start_date?: string
          due_date?: string
          recurrence_config?: Json | null
          status?: string
          display_order?: number | null
          created_at?: string
          updated_at?: string
          archived_at?: string | null
        },
        Relationships: [
          {
            foreignKeyName: 'goals_challenge_id_fkey'
            columns: ['challenge_id']
            isOneToOne: false
            referencedRelation: 'challenges'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'goals_category_id_fkey'
            columns: ['category_id']
            isOneToOne: false
            referencedRelation: 'categories'
            referencedColumns: ['id']
          }
        ]
      }
      activity_logs: {
        Row: {
          id: string
          user_id: string
          goal_id: string
          scheduled_date: string
          quantity: number | null
          duration_minutes: number | null
          status: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          goal_id: string
          scheduled_date: string
          quantity?: number | null
          duration_minutes?: number | null
          status: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          goal_id?: string
          scheduled_date?: string
          quantity?: number | null
          duration_minutes?: number | null
          status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        },
        Relationships: [
          {
            foreignKeyName: 'activity_logs_goal_id_fkey'
            columns: ['goal_id']
            isOneToOne: false
            referencedRelation: 'goals'
            referencedColumns: ['id']
          }
        ]
      },
      daily_reflections: {
        Row: {
          id: string
          user_id: string
          reflection_date: string
          productivity: number
          energy: number
          notes: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          reflection_date: string
          productivity: number
          energy: number
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          reflection_date?: string
          productivity?: number
          energy?: number
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    },
    Views: {},
    Functions: {}
  }
}
