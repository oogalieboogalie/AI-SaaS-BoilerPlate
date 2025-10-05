# 🚀 AI-SaaS Boilerplate Deployment Guide

This guide walks you through deploying the AI-SaaS Boilerplate to production.

## 📋 Pre-Deployment Checklist

### Environment Setup ✅

- [ ] Create production Supabase project
- [ ] Configure Stripe products and pricing
- [ ] Set up domain and SSL certificates
- [ ] Prepare environment variables

### Code Preparation ✅

- [ ] Run `npm run validate:env` locally
- [ ] Test build with `npm run build`
- [ ] Verify all API endpoints work
- [ ] Test authentication flows

### Security Review ✅

- [ ] Update NEXTAUTH_SECRET with secure random string
- [ ] Verify Stripe webhook secret is configured
- [ ] Check CORS settings in production
- [ ] Review and update security headers

## 🌐 Deployment Options

### Option 1: Vercel (Recommended)

1. **Connect Repository**

   ```bash
   # Install Vercel CLI
   npm i -g vercel

   # Deploy
   vercel --prod
   ```

2. **Environment Variables**
   Add these in your Vercel dashboard:

   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   SUPABASE_PROJECT_ID=your_project_id
   STRIPE_PUBLIC_KEY=your_stripe_public_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_webhook_secret
   NEXTAUTH_SECRET=your_secure_random_string
   NEXTAUTH_URL=https://yourdomain.com
   ```

3. **Domain Configuration**
   - Add your custom domain in Vercel dashboard
   - Configure DNS records as instructed

### Option 2: Render

Render provides a seamless deployment experience with its "Infrastructure as Code" feature using a `render.yaml` file.

1.  **Fork the Repository**
    - Start by forking this repository to your own GitHub account.

2.  **Create a New "Blueprint" on Render**
    - Go to your [Render Dashboard](https://dashboard.render.com/) and click "New" -> "Blueprint".
    - Connect the GitHub repository you just forked.
    - Render will automatically detect and use the `render.yaml` file from the root of the repository.

3.  **Configure the Services**
    - Render will display the services defined in `render.yaml` (the web service and the PostgreSQL database).
    - Click "Approve" to create the services.

4.  **Add Environment Variables**
    - After the services are created, navigate to the "Environment" tab for your new `ai-saas-boilerplate` web service.
    - The `render.yaml` file is configured to automatically generate values for most secrets, but you will need to manually create a group for your production secrets and add the following:
      - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key.
      - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key.
      - `STRIPE_SECRET_KEY`: Your Stripe secret key.
      - `STRIPE_WEBHOOK_SECRET`: Your Stripe webhook secret.
    - **Important**: The `render.yaml` sets `NEXTAUTH_URL` from the service's external URL and points `NEXT_PUBLIC_SUPABASE_URL` to the created database.

5.  **Set Up the Database**
    - Once the database is running, connect to it using the credentials provided in the Render dashboard.
    - Navigate to the **SQL Editor** in your Supabase project (or use a local SQL client connected to the Render database).
    - Copy the entire content of `supabase/schema.sql` and run it to create the necessary tables, roles, and policies.

6.  **Configure Stripe Webhook**
    - In your Stripe dashboard, create a new webhook endpoint.
    - The URL should be `https://your-render-app-url.onrender.com/api/webhooks/stripe`.
    - Make sure to use the webhook secret you created as an environment variable in Render.

Your application will now be live and will automatically redeploy whenever you push changes to your forked repository's main branch.

### Option 3: Docker Deployment

1. **Build Image**

   ```bash
   docker build -t ai-saas-boilerplate .
   ```

2. **Run Container**

   ```bash
   docker run -p 3000:3000 --env-file .env.local ai-saas-boilerplate
   ```

3. **Docker Compose**
   ```bash
   docker-compose up -d
   ```

### Option 4: Traditional VPS

1. **Server Setup**

   ```bash
   # Install Node.js 18+
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Install PM2 for process management
   sudo npm install -g pm2
   ```

2. **Application Deployment**

   ```bash
   # Clone repository
   git clone your-repo-url
   cd AI-SaaS-BoilerPlate

   # Install dependencies
   npm install

   # Build application
   npm run build

   # Start with PM2
   pm2 start npm --name "ai-saas" -- start
   pm2 startup
   pm2 save
   ```

## 🔧 Post-Deployment Configuration

### 1. Database Setup

- Run the SQL schema in your Supabase project
- Set up Row Level Security policies
- Configure authentication providers

### 2. Stripe Configuration

- Create products and prices in Stripe dashboard
- Update price IDs in `types/index.ts`
- Set up webhook endpoint: `https://yourdomain.com/api/webhooks/stripe`

### 3. Domain and SSL

- Configure custom domain
- Ensure SSL certificate is active
- Update NEXTAUTH_URL environment variable

### 4. Monitoring Setup

- Set up error tracking (Sentry, LogRocket, etc.)
- Configure uptime monitoring
- Set up alerts for critical issues

## 🧪 Testing Your Deployment

### Health Check

```bash
curl https://yourdomain.com/api/health
```

### Authentication Test

1. Visit `/auth/login`
2. Test email/password signup
3. Test magic link login
4. Verify OAuth providers (if configured)

### Billing Test

1. Create a test account
2. Attempt plan upgrade
3. Test Stripe webhook delivery
4. Verify credit system updates

## 🔍 Troubleshooting

### Common Issues

1. **Build Fails with Environment Errors**
   - Ensure all required environment variables are set
   - Run `npm run validate:env` to check

2. **Stripe Webhooks Not Working**
   - Verify webhook URL is accessible
   - Check webhook secret matches environment variable
   - Review webhook event types in Stripe dashboard

3. **Authentication Issues**
   - Verify NEXTAUTH_URL matches your domain
   - Check Supabase authentication settings
   - Ensure NEXTAUTH_SECRET is set and secure

4. **Database Connection Issues**
   - Verify Supabase credentials
   - Check if database is accessible from deployment environment
   - Review Row Level Security policies

### Debug Commands

```bash
# Check environment variables
npm run validate:env

# Test health endpoint
npm run health

# View application logs
pm2 logs ai-saas  # For PM2 deployments
docker logs container-name  # For Docker deployments
```

## 📊 Performance Optimization

### Recommended Settings

- Enable CDN for static assets
- Configure database connection pooling
- Set up Redis for session storage (optional)
- Enable gzip compression
- Configure proper caching headers

### Monitoring Metrics

- Response times for API endpoints
- Database query performance
- Memory and CPU usage
- Error rates and 5xx responses
- User authentication success rates

## 🔐 Security Considerations

### Production Checklist

- [ ] HTTPS enforced on all pages
- [ ] Security headers configured
- [ ] Stripe webhooks use HTTPS
- [ ] Environment variables are secure
- [ ] Database has proper RLS policies
- [ ] API rate limiting is enabled
- [ ] User input validation is active

## 📞 Support

For deployment issues:

1. Check this deployment guide
2. Review error logs
3. Test with health check endpoint
4. Verify environment configuration

---

🎉 **Your AI-SaaS Boilerplate is now ready for production!**
