#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });

/**
 * Environment validation script for AI-SaaS Boilerplate
 * Run this before starting the application to ensure all required environment variables are set
 */

const fs = require('fs')
const path = require('path')

// Required environment variables for production
const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_PROJECT_ID',
  'STRIPE_SECRET_KEY',
  'STRIPE_PUBLIC_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
]

// Optional but recommended environment variables
const OPTIONAL_ENV_VARS = ['OPENAI_API_KEY', 'DATABASE_URL']

function checkEnvironmentVariables() {
  console.log('🔍 Validating environment variables...\n')

  const missing = []
  const present = []
  const optional_missing = []

  // Check required variables
  REQUIRED_ENV_VARS.forEach((varName) => {
    if (!process.env[varName]) {
      missing.push(varName)
    } else {
      present.push(varName)
    }
  })

  // Check optional variables
  OPTIONAL_ENV_VARS.forEach((varName) => {
    if (!process.env[varName]) {
      optional_missing.push(varName)
    } else {
      present.push(varName)
    }
  })

  // Report results
  if (present.length > 0) {
    console.log('✅ Environment variables found:')
    present.forEach((varName) => {
      const value = process.env[varName]
      const displayValue = value ? `${value.substring(0, 10)}***` : 'undefined'
      console.log(`   ${varName}: ${displayValue}`)
    })
    console.log('')
  }

  if (missing.length > 0) {
    console.log('❌ Missing required environment variables:')
    missing.forEach((varName) => {
      console.log(`   ${varName}`)
    })
    console.log('')
    console.log('💡 Copy .env.example to .env.local and fill in the values')
    console.log('   cp .env.example .env.local')
    console.log('')
    return false
  }

  if (optional_missing.length > 0) {
    console.log('⚠️  Optional environment variables not set:')
    optional_missing.forEach((varName) => {
      console.log(`   ${varName}`)
    })
    console.log('')
  }

  console.log('✅ All required environment variables are set!')
  return true
}

function validateEnvFile() {
  const envPath = path.join(process.cwd(), '.env.local')

  if (!fs.existsSync(envPath)) {
    console.log('⚠️  No .env.local file found')
    console.log(
      '💡 Copy .env.example to .env.local and configure your environment',
    )
    return false
  }

  console.log('✅ .env.local file found')
  return true
}

function validateStripeConfiguration() {
  const stripePublic = process.env.STRIPE_PUBLIC_KEY
  const stripeSecret = process.env.STRIPE_SECRET_KEY

  if (!stripePublic || !stripeSecret) {
    return true // Already caught by required env check
  }

  const isTestMode =
    stripePublic.startsWith('pk_test_') && stripeSecret.startsWith('sk_test_')
  const isLiveMode =
    stripePublic.startsWith('pk_live_') && stripeSecret.startsWith('sk_live_')

  if (!isTestMode && !isLiveMode) {
    console.log('❌ Invalid Stripe API keys format')
    return false
  }

  console.log(`✅ Stripe configured in ${isTestMode ? 'test' : 'live'} mode`)
  return true
}

function main() {
  console.log('🚀 AI-SaaS Boilerplate Environment Validation\n')

  const envFileValid = validateEnvFile()
  const envVarsValid = checkEnvironmentVariables()
  const stripeValid = validateStripeConfiguration()

  if (!envVarsValid) {
    console.log('❌ Environment validation failed')
    process.exit(1)
  }

  if (!stripeValid) {
    console.log('❌ Stripe configuration validation failed')
    process.exit(1)
  }

  console.log(
    '🎉 Environment validation passed! Ready to start the application.',
  )
}

if (require.main === module) {
  main()
}

module.exports = {
  checkEnvironmentVariables,
  validateEnvFile,
  validateStripeConfiguration,
}
