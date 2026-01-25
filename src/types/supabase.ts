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
            activity_logs: {
                Row: {
                    count: number | null
                    date: string
                    id: string
                    user_id: string
                }
                Insert: {
                    count?: number | null
                    date?: string
                    id?: string
                    user_id: string
                }
                Update: {
                    count?: number | null
                    date?: string
                    id?: string
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "activity_logs_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            profiles: {
                Row: {
                    avatar_url: string | null
                    email: string | null
                    full_name: string | null
                    id: string
                    level: number | null
                    streak: number | null
                    updated_at: string | null
                    xp: number | null
                }
                Insert: {
                    avatar_url?: string | null
                    email?: string | null
                    full_name?: string | null
                    id: string
                    level?: number | null
                    streak?: number | null
                    updated_at?: string | null
                    xp?: number | null
                }
                Update: {
                    avatar_url?: string | null
                    email?: string | null
                    full_name?: string | null
                    id?: string
                    level?: number | null
                    streak?: number | null
                    updated_at?: string | null
                    xp?: number | null
                }
                Relationships: [
                    {
                        foreignKeyName: "profiles_id_fkey"
                        columns: ["id"]
                        isOneToOne: true
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            tasks: {
                Row: {
                    actual_pomodoros: number | null
                    category: string | null
                    created_at: string | null
                    description: string | null
                    due_date: string | null
                    estimated_pomodoros: number | null
                    id: string
                    priority: string | null
                    status: string | null
                    subtasks: Json | null
                    tags: Json | null
                    title: string
                    updated_at: string | null
                    user_id: string
                    xp_awarded: boolean | null
                }
                Insert: {
                    actual_pomodoros?: number | null
                    category?: string | null
                    created_at?: string | null
                    description?: string | null
                    due_date?: string | null
                    estimated_pomodoros?: number | null
                    id?: string
                    priority?: string | null
                    status?: string | null
                    subtasks?: Json | null
                    tags?: Json | null
                    title: string
                    updated_at?: string | null
                    user_id: string
                    xp_awarded?: boolean | null
                }
                Update: {
                    actual_pomodoros?: number | null
                    category?: string | null
                    created_at?: string | null
                    description?: string | null
                    due_date?: string | null
                    estimated_pomodoros?: number | null
                    id?: string
                    priority?: string | null
                    status?: string | null
                    subtasks?: Json | null
                    tags?: Json | null
                    title?: string
                    updated_at?: string | null
                    user_id?: string
                    xp_awarded?: boolean | null
                }
                Relationships: [
                    {
                        foreignKeyName: "tasks_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
