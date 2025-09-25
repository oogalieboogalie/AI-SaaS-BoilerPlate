# AI-SaaS Boilerplate

This is the foundational toolkit for any founder looking to launch a modern AI-powered web application. It directly solves the "production gap" by providing all the essential, non-differentiating features out of the box, saving hundreds of hours of development time.

## 🚀 Features

- **Next.js 14** with App Router and TypeScript
- **Supabase** for authentication and database
- **Enterprise Authentication** with email/password, magic links, and OAuth
- **Multi-tenancy** with team management and invitations
- **Role-Based Access Control (RBAC)** with granular permissions
- **Stripe Integration** for subscription billing and payments
- **Usage-based Credit System** for API tracking and limits
- **Row Level Security (RLS)** policies for data isolation
- **Responsive UI** with Tailwind CSS and modern components
- **Production-ready** with proper error handling and validation

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **Payments**: Stripe
- **Deployment**: Vercel-ready

### Directory Structure

```
├── app/                          # Next.js App Router
│   ├── (auth)/                  # Authentication pages
│   ├── dashboard/               # Protected dashboard pages
│   ├── api/                     # API routes
│   │   ├── auth/               # Auth endpoints
│   │   ├── teams/              # Team management
│   │   ├── billing/            # Stripe integration
│   │   └── webhooks/           # Webhook handlers
│   └── globals.css             # Global styles
├── components/                  # React components
│   ├── ui/                     # Reusable UI components
│   ├── auth/                   # Authentication components
│   ├── dashboard/              # Dashboard components
│   └── billing/                # Billing components
├── lib/                        # Utility libraries
│   ├── auth/                   # Authentication utilities
│   ├── database/               # Database client
│   ├── stripe/                 # Stripe integration
│   └── utils/                  # General utilities
├── types/                      # TypeScript type definitions
├── supabase/                   # Database schema and migrations
└── middleware.ts               # Next.js middleware
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- Stripe account

### 1. Clone and Install
```bash
git clone <repository-url>
cd AI-SaaS-BoilerPlate
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env.local` and fill in your values:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key  
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_PROJECT_ID=your_supabase_project_id

# Stripe
STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret

# App
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_key
```

### 3. Database Setup
1. Create a new Supabase project
2. Run the SQL schema from `supabase/schema.sql` in the Supabase SQL editor
3. This will create all tables, RLS policies, and functions

### 4. Stripe Setup
1. Create products and prices in Stripe Dashboard
2. Update the `stripe_price_id` values in `types/index.ts` with your Stripe price IDs
3. Set up webhook endpoint pointing to `/api/webhooks/stripe`

### 5. Run Development Server
```bash
npm run dev
```

## 🔒 Security Features

### Row Level Security (RLS) Policies

The application implements comprehensive RLS policies to ensure data isolation:

#### Users Table
```sql
-- Users can only view and update their own profile
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);
```

#### Teams Table  
```sql
-- Team members can view their teams
CREATE POLICY "Team members can view their teams" ON public.teams
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM public.team_members 
      WHERE team_id = teams.id
    )
  );
```

#### Team Members Table
```sql
-- Team owners and admins can manage team members
CREATE POLICY "Team owners and admins can manage team members" ON public.team_members
  FOR ALL USING (
    auth.uid() IN (
      SELECT user_id FROM public.team_members tm2 
      WHERE tm2.team_id = team_members.team_id 
      AND tm2.role IN ('owner', 'admin')
    )
  );
```

### RBAC System

The application includes a comprehensive role-based access control system:

#### Team Roles
- **Owner**: Full access to team management, billing, and member management
- **Admin**: Team management and member management (except billing)
- **Member**: Basic team access and API usage
- **Viewer**: Read-only access to team information

#### Permissions
```typescript
export enum Permission {
  TEAM_READ = 'team:read',
  TEAM_UPDATE = 'team:update', 
  TEAM_DELETE = 'team:delete',
  MEMBER_INVITE = 'member:invite',
  MEMBER_REMOVE = 'member:remove',
  BILLING_READ = 'billing:read',
  BILLING_UPDATE = 'billing:update',
  CREDITS_READ = 'credits:read',
  API_USE = 'api:use',
  // ... more permissions
}
```

## 💳 Billing & Credits System

### Subscription Plans
The application includes 4 predefined plans:

- **Free**: $0/month, 100 credits
- **Starter**: $29/month, 1,000 credits  
- **Pro**: $99/month, 5,000 credits
- **Enterprise**: $299/month, 20,000 credits

### Credit System
- Credits are automatically refilled each billing cycle
- API usage deducts credits in real-time
- Teams are blocked from API usage when credits are exhausted
- Credit transactions are logged for transparency

### Stripe Integration
- Subscription management with webhooks
- Customer portal for self-service billing
- Automated plan upgrades/downgrades
- Invoice generation and payment processing

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/callback` - OAuth callback handler

### Teams
- `GET /api/teams` - List user's teams
- `POST /api/teams` - Create new team
- `GET /api/teams/[id]` - Get team details
- `PUT /api/teams/[id]` - Update team
- `DELETE /api/teams/[id]` - Delete team

### Billing  
- `POST /api/billing/checkout` - Create Stripe checkout session
- `POST /api/billing/portal` - Create customer portal session
- `POST /api/webhooks/stripe` - Handle Stripe webhooks

### Usage & Credits
- `GET /api/credits/[teamId]` - Get credit balance and history
- `POST /api/credits/deduct` - Deduct credits for API usage

## 🎨 UI Components

The application includes a comprehensive set of reusable UI components:

- **Forms**: Input, Button, Card components with validation
- **Navigation**: Dashboard sidebar with responsive design
- **Billing**: Pricing cards, usage meters, subscription management  
- **Teams**: Member lists, role management, invitation forms
- **Notifications**: Toast notifications for user feedback

## 📱 Responsive Design

- Mobile-first approach with Tailwind CSS
- Responsive dashboard layout
- Touch-friendly mobile navigation
- Optimized for all screen sizes

## 🚀 Deployment

### Vercel Deployment
1. Push your code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### Environment Variables for Production
Ensure all environment variables are set in your production environment with production values from Supabase and Stripe.

## 🔧 Customization

### Adding New Features
1. Define types in `types/index.ts`
2. Update database schema in `supabase/schema.sql`
3. Create API endpoints in `app/api/`
4. Build UI components in `components/`
5. Add pages in `app/`

### Modifying Plans
Update the `PLAN_CONFIGS` object in `types/index.ts` with your pricing and features.

### Custom Styling
Modify `tailwind.config.js` and `app/globals.css` to match your brand.

## 📖 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ for founders who want to focus on their core product instead of boilerplate code.