import { createClient } from '@supabase/supabase-js'
import {
  createClientComponentClient,
  createServerComponentClient,
} from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy-key'
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy-service-key'

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side Supabase client
export const createServerSupabaseClient = () => {
  return createServerComponentClient({ cookies })
}

// Client component Supabase client
export const createClientSupabaseClient = () => {
  return createClientComponentClient()
}

// Admin client with service role key (for server-side operations)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Database types
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          avatar_url: string | null
          role: 'super_admin' | 'admin' | 'user'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          avatar_url?: string | null
          role?: 'super_admin' | 'admin' | 'user'
        }
        Update: {
          id?: string
          email?: string
          name?: string
          avatar_url?: string | null
          role?: 'super_admin' | 'admin' | 'user'
        }
      }
      teams: {
        Row: {
          id: string
          name: string
          slug: string
          plan: 'free' | 'starter' | 'pro' | 'enterprise'
          credits: number
          max_credits: number
          owner_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          plan?: 'free' | 'starter' | 'pro' | 'enterprise'
          credits?: number
          max_credits?: number
          owner_id: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          plan?: 'free' | 'starter' | 'pro' | 'enterprise'
          credits?: number
          max_credits?: number
          owner_id?: string
        }
      }
      team_members: {
        Row: {
          id: string
          team_id: string
          user_id: string
          role: 'owner' | 'admin' | 'member' | 'viewer'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          team_id: string
          user_id: string
          role?: 'owner' | 'admin' | 'member' | 'viewer'
        }
        Update: {
          id?: string
          team_id?: string
          user_id?: string
          role?: 'owner' | 'admin' | 'member' | 'viewer'
        }
      }
      subscriptions: {
        Row: {
          id: string
          team_id: string
          stripe_subscription_id: string | null
          stripe_customer_id: string | null
          plan: 'free' | 'starter' | 'pro' | 'enterprise'
          status:
            | 'active'
            | 'canceled'
            | 'incomplete'
            | 'incomplete_expired'
            | 'past_due'
            | 'trialing'
            | 'unpaid'
          current_period_start: string | null
          current_period_end: string | null
          cancel_at_period_end: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          team_id: string
          stripe_subscription_id?: string | null
          stripe_customer_id?: string | null
          plan?: 'free' | 'starter' | 'pro' | 'enterprise'
          status?:
            | 'active'
            | 'canceled'
            | 'incomplete'
            | 'incomplete_expired'
            | 'past_due'
            | 'trialing'
            | 'unpaid'
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
        }
        Update: {
          id?: string
          team_id?: string
          stripe_subscription_id?: string | null
          stripe_customer_id?: string | null
          plan?: 'free' | 'starter' | 'pro' | 'enterprise'
          status?:
            | 'active'
            | 'canceled'
            | 'incomplete'
            | 'incomplete_expired'
            | 'past_due'
            | 'trialing'
            | 'unpaid'
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
        }
      }
      credit_transactions: {
        Row: {
          id: string
          team_id: string
          user_id: string
          amount: number
          type: 'purchase' | 'usage' | 'refund' | 'bonus' | 'expiry'
          description: string
          metadata: any | null
          created_at: string
        }
        Insert: {
          id?: string
          team_id: string
          user_id: string
          amount: number
          type: 'purchase' | 'usage' | 'refund' | 'bonus' | 'expiry'
          description: string
          metadata?: any | null
        }
        Update: {
          id?: string
          team_id?: string
          user_id?: string
          amount?: number
          type?: 'purchase' | 'usage' | 'refund' | 'bonus' | 'expiry'
          description?: string
          metadata?: any | null
        }
      }
      api_usage: {
        Row: {
          id: string
          team_id: string
          user_id: string
          endpoint: string
          credits_used: number
          request_data: any | null
          response_data: any | null
          created_at: string
        }
        Insert: {
          id?: string
          team_id: string
          user_id: string
          endpoint: string
          credits_used: number
          request_data?: any | null
          response_data?: any | null
        }
        Update: {
          id?: string
          team_id?: string
          user_id?: string
          endpoint?: string
          credits_used?: number
          request_data?: any | null
          response_data?: any | null
        }
      }
    }
    Functions: {
      deduct_credits: {
        Args: {
          team_uuid: string
          user_uuid: string
          credit_amount: number
          usage_description: string
          usage_metadata?: any
        }
        Returns: boolean
      }
    }
  }
}
