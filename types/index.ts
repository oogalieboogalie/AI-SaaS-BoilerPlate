// Core types for the AI-SaaS application

export interface User {
  id: string
  email: string
  name: string
  avatar_url?: string
  role: UserRole
  created_at: string
  updated_at: string
}

export interface Team {
  id: string
  name: string
  slug: string
  plan: SubscriptionPlan
  credits: number
  max_credits: number
  owner_id: string
  created_at: string
  updated_at: string
}

export interface TeamMember {
  id: string
  team_id: string
  user_id: string
  role: TeamRole
  permissions: Permission[]
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  team_id: string
  stripe_subscription_id: string
  stripe_customer_id: string
  plan: SubscriptionPlan
  status: SubscriptionStatus
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  created_at: string
  updated_at: string
}

export interface CreditTransaction {
  id: string
  team_id: string
  user_id: string
  amount: number
  type: CreditTransactionType
  description: string
  metadata?: Record<string, any>
  created_at: string
}

export interface ApiUsage {
  id: string
  team_id: string
  user_id: string
  endpoint: string
  credits_used: number
  request_data?: Record<string, any>
  response_data?: Record<string, any>
  created_at: string
}

// Enums
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  USER = 'user',
}

export enum TeamRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
  VIEWER = 'viewer',
}

export enum Permission {
  // Team management
  TEAM_READ = 'team:read',
  TEAM_UPDATE = 'team:update',
  TEAM_DELETE = 'team:delete',

  // Member management
  MEMBER_INVITE = 'member:invite',
  MEMBER_REMOVE = 'member:remove',
  MEMBER_UPDATE_ROLE = 'member:update_role',

  // Billing
  BILLING_READ = 'billing:read',
  BILLING_UPDATE = 'billing:update',

  // Credits
  CREDITS_READ = 'credits:read',
  CREDITS_PURCHASE = 'credits:purchase',

  // API usage
  API_USE = 'api:use',
  API_READ_USAGE = 'api:read_usage',
}

export enum SubscriptionPlan {
  FREE = 'free',
  STARTER = 'starter',
  PRO = 'pro',
  ENTERPRISE = 'enterprise',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELED = 'canceled',
  INCOMPLETE = 'incomplete',
  INCOMPLETE_EXPIRED = 'incomplete_expired',
  PAST_DUE = 'past_due',
  TRIALING = 'trialing',
  UNPAID = 'unpaid',
}

export enum CreditTransactionType {
  PURCHASE = 'purchase',
  USAGE = 'usage',
  REFUND = 'refund',
  BONUS = 'bonus',
  EXPIRY = 'expiry',
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T = any> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    total_pages: number
  }
}

// Plan configurations
export interface PlanConfig {
  name: string
  price: number
  credits: number
  features: string[]
  stripe_price_id?: string
}

export const PLAN_CONFIGS: Record<SubscriptionPlan, PlanConfig> = {
  [SubscriptionPlan.FREE]: {
    name: 'Free',
    price: 0,
    credits: 100,
    features: ['100 API calls/month', 'Basic support', '1 team member'],
  },
  [SubscriptionPlan.STARTER]: {
    name: 'Starter',
    price: 29,
    credits: 1000,
    features: ['1,000 API calls/month', 'Email support', '5 team members'],
    stripe_price_id: 'price_starter_monthly',
  },
  [SubscriptionPlan.PRO]: {
    name: 'Pro',
    price: 99,
    credits: 5000,
    features: ['5,000 API calls/month', 'Priority support', '20 team members'],
    stripe_price_id: 'price_pro_monthly',
  },
  [SubscriptionPlan.ENTERPRISE]: {
    name: 'Enterprise',
    price: 299,
    credits: 20000,
    features: [
      '20,000 API calls/month',
      '24/7 support',
      'Unlimited team members',
    ],
    stripe_price_id: 'price_enterprise_monthly',
  },
}

// Role-based permissions mapping
export const ROLE_PERMISSIONS: Record<TeamRole, Permission[]> = {
  [TeamRole.OWNER]: [
    Permission.TEAM_READ,
    Permission.TEAM_UPDATE,
    Permission.TEAM_DELETE,
    Permission.MEMBER_INVITE,
    Permission.MEMBER_REMOVE,
    Permission.MEMBER_UPDATE_ROLE,
    Permission.BILLING_READ,
    Permission.BILLING_UPDATE,
    Permission.CREDITS_READ,
    Permission.CREDITS_PURCHASE,
    Permission.API_USE,
    Permission.API_READ_USAGE,
  ],
  [TeamRole.ADMIN]: [
    Permission.TEAM_READ,
    Permission.TEAM_UPDATE,
    Permission.MEMBER_INVITE,
    Permission.MEMBER_REMOVE,
    Permission.BILLING_READ,
    Permission.CREDITS_READ,
    Permission.API_USE,
    Permission.API_READ_USAGE,
  ],
  [TeamRole.MEMBER]: [
    Permission.TEAM_READ,
    Permission.CREDITS_READ,
    Permission.API_USE,
    Permission.API_READ_USAGE,
  ],
  [TeamRole.VIEWER]: [
    Permission.TEAM_READ,
    Permission.CREDITS_READ,
    Permission.API_READ_USAGE,
  ],
}
