// ---------------------------------------------------------------------------
// Auto-generated-ish Database type — extend as your schema grows.
// Maps to the tables defined in schema.sql.
// ---------------------------------------------------------------------------

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
      blog_posts: {
        Row: {
          id: string
          slug: string
          title: string
          date: string
          excerpt: string
          tags: Json
          cover_image: string | null
          content: string
          reading_time: number
          published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          date?: string
          excerpt?: string
          tags?: Json
          cover_image?: string | null
          content?: string
          reading_time?: number
          published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          date?: string
          excerpt?: string
          tags?: Json
          cover_image?: string | null
          content?: string
          reading_time?: number
          published?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          slug: string
          title: string
          tagline: string
          description: string
          technologies: Json
          year: string
          cover_image: string | null
          live_url: string | null
          repo_url: string | null
          featured: boolean
          thinking: Json
          results: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          tagline?: string
          description?: string
          technologies?: Json
          year: string
          cover_image?: string | null
          live_url?: string | null
          repo_url?: string | null
          featured?: boolean
          thinking?: Json
          results?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          tagline?: string
          description?: string
          technologies?: Json
          year?: string
          cover_image?: string | null
          live_url?: string | null
          repo_url?: string | null
          featured?: boolean
          thinking?: Json
          results?: Json
          created_at?: string
          updated_at?: string
        }
      }
      education: {
        Row: {
          id: string
          institution: string
          degree: string
          field: string
          start_date: string
          end_date: string
          description: string
          highlights: Json
          gpa: string | null
          courses: Json
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          institution: string
          degree: string
          field?: string
          start_date: string
          end_date: string
          description?: string
          highlights?: Json
          gpa?: string | null
          courses?: Json
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          institution?: string
          degree?: string
          field?: string
          start_date?: string
          end_date?: string
          description?: string
          highlights?: Json
          gpa?: string | null
          courses?: Json
          sort_order?: number
          created_at?: string
        }
      }
      activities: {
        Row: {
          id: string
          title: string
          organization: string
          type: "program" | "ambassadorship" | "involvement"
          start_date: string
          end_date: string | null
          description: string
          contributions: Json
          takeaway: string | null
          image: string | null
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          organization: string
          type: "program" | "ambassadorship" | "involvement"
          start_date: string
          end_date?: string | null
          description?: string
          contributions?: Json
          takeaway?: string | null
          image?: string | null
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          organization?: string
          type?: "program" | "ambassadorship" | "involvement"
          start_date?: string
          end_date?: string | null
          description?: string
          contributions?: Json
          takeaway?: string | null
          image?: string | null
          sort_order?: number
          created_at?: string
        }
      }
      certificates: {
        Row: {
          id: string
          slug: string
          title: string
          issuer: string
          date: string
          description: string | null
          image: string | null
          url: string
          credential_id: string | null
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          issuer: string
          date: string
          description?: string | null
          image?: string | null
          url: string
          credential_id?: string | null
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          issuer?: string
          date?: string
          description?: string | null
          image?: string | null
          url?: string
          credential_id?: string | null
          sort_order?: number
          created_at?: string
        }
      }
    }
  }
}
