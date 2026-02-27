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
      wrestlers: {
        Row: {
          id: string
          name: string
          brand: string
          alignment: string
          status: string
          title: string | null
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          brand?: string
          alignment?: string
          status?: string
          title?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          brand?: string
          alignment?: string
          status?: string
          title?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      feuds: {
        Row: {
          id: string
          wrestler1_id: string | null
          wrestler2_id: string | null
          description: string | null
          intensity: string
          status: string
          started_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          wrestler1_id?: string | null
          wrestler2_id?: string | null
          description?: string | null
          intensity?: string
          status?: string
          started_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          wrestler1_id?: string | null
          wrestler2_id?: string | null
          description?: string | null
          intensity?: string
          status?: string
          started_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      storylines: {
        Row: {
          id: string
          title: string
          description: string
          type: string
          participants: Json
          execution_steps: Json
          created_at: string
          favorited: boolean
        }
        Insert: {
          id?: string
          title: string
          description: string
          type: string
          participants?: Json
          execution_steps?: Json
          created_at?: string
          favorited?: boolean
        }
        Update: {
          id?: string
          title?: string
          description?: string
          type?: string
          participants?: Json
          execution_steps?: Json
          created_at?: string
          favorited?: boolean
        }
      }
    }
  }
}
