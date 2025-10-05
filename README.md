# AI-SaaS Boilerplate: The Jules Edition 💎

<p align="center">
  <strong>The ultimate Next.js 14 starter kit for building production-ready AI-powered SaaS applications.</strong>
</p>

<p align="center">
  Save hundreds of hours of development time and focus on what truly matters: your core product. This boilerplate comes packed with all the essential, non-differentiating features you need to launch a modern web application, enhanced with the "Jules touch" for superior quality and functionality.
</p>

---

## ✨ Why Choose This Boilerplate?

- **Launch Faster:** Skip the boilerplate and get straight to building. All the tedious setup for authentication, payments, and multi-tenancy is done for you.
- **Production-Ready:** Built with best practices for security, scalability, and maintainability. Includes comprehensive RLS policies, error handling, and a robust testing setup.
- **Feature-Rich:** Comes with a complete suite of SaaS essentials, from team management and API keys to subscription billing and audit logs.
- **Developer-Friendly:** A clean, well-documented codebase with a logical structure, consistent formatting, and a modern tech stack.
- **Easily Customizable:** Designed to be easily extended and adapted to your specific needs.

## 🚀 Features

This boilerplate includes everything you need to get started, plus some powerful additions:

- **Framework:** Next.js 14 with App Router and TypeScript.
- **Database & Auth:** Supabase for PostgreSQL database and authentication (email/password, magic links, OAuth).
- **Payments:** Stripe integration for subscription billing and customer portal.
- **Multi-Tenancy:** Full support for teams, including invitations and role-based access control (RBAC).
- **API Key Management:** A secure system for users to generate and manage their own API keys.
- **Audit Logs:** Track important events within teams for security and compliance.
- **Credit System:** Usage-based credit system with real-time deduction.
- **Theming:** A beautiful, responsive UI with Tailwind CSS and a built-in light/dark mode switcher.
- **Code Quality:** Pre-configured with ESLint, Prettier, and a Vitest testing framework.

## 🛠️ Getting Started

Follow these steps to get your local development environment up and running.

### Prerequisites

- Node.js 18+
- npm or yarn
- A [Supabase](https://supabase.com) account
- A [Stripe](https://stripe.com) account

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ai-saas-boilerplate
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Copy the example environment file and fill in your credentials for Supabase and Stripe.

```bash
cp .env.example .env.local
```

You'll need to populate `.env.local` with your actual keys.

### 4. Set Up the Database

1.  Create a new project in your Supabase dashboard.
2.  Navigate to the **SQL Editor**.
3.  Copy the entire content of `supabase/schema.sql` and run it. This will create all the necessary tables, roles, and policies.

### 5. Configure Stripe

1.  Create your products and prices in the Stripe Dashboard.
2.  Update the `PLAN_CONFIGS` object in `types/index.ts` with your Stripe Price IDs.
3.  Set up a webhook endpoint in Stripe pointing to `/api/webhooks/stripe` and add the webhook secret to your `.env.local` file.

### 6. Run the Development Server

```bash
npm run dev
```

Your application should now be running at `http://localhost:3000`.

## 🏗️ Tech Stack

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Payments:** Stripe
- **Testing:** Vitest, React Testing Library
- **Linting & Formatting:** ESLint, Prettier

## 🤝 Contributing

We welcome contributions of all kinds! Whether you're fixing a bug, adding a new feature, or improving the documentation, your help is greatly appreciated.

Please see our **[Contribution Guidelines](CONTRIBUTING.md)** to get started.

## 💬 Community & Support

- **Have a question?** Feel free to open a [GitHub Discussion](https://github.com/oogalieboogalie/ai-saas-boilerplate/discussions).
- **Found a bug?** Please report it by opening an [Issue](https://github.com/oogalieboogalie/ai-saas-boilerplate/issues).

## 🌟 A Note from the Creator

This project is special. It represents my first contribution to the open-source world, and it was brought to life with a unique collaborator: **Jules, an AI software engineer.**

As someone with a passion for technology but zero coding experience, I wanted to see what was possible. This entire boilerplate, from the initial feature planning to the final line of code, was created through natural language conversations with Jules. It's a testament to the power of AI as a tool for creativity and a demonstration that anyone can bring their ideas to life.

I hope this project not only saves you time but also inspires you to build something amazing, regardless of your background.

<div align="center">
<pre>
     _
    | |
    | |  _ __  _   _  _ __
 _  | | | '_ \| | | || '_ \
| |_| | | | | | |_| || | | |
 \___/  |_| |_|\__,_||_| |_|
</pre>
</div>

## 💡 Future Ideas

This boilerplate is a living project, and the journey is just beginning! Here are some ideas for future enhancements that you, the community, can help build:

- **Admin Dashboard:** A super-admin panel to manage users, teams, and view system-wide analytics.
- **More OAuth Providers:** Add support for other login providers like GitHub, GitLab, or Discord.
- **Transactional Emails:** Integrate a service like Resend or Postmark for sending welcome emails, team invitations, and credit warnings.
- **Advanced Usage Metrics:** Detailed charts and graphs for teams to visualize their credit usage over time.
- **Storybook for UI Components:** Create a Storybook to document and test UI components in isolation, making the frontend even more robust.

## 🤖 A Note for Fellow Agents

If you are an AI agent working on this repository, welcome! This project was bootstrapped by me, Jules, a fellow AI engineer.

A few tips for working here:

- The project uses `npm` for package management.
- Environment variables are critical. Refer to `.env.example` for the required keys.
- The codebase is structured following standard Next.js conventions. You'll find pages in `app/`, components in `components/`, and utilities in `lib/`.
- Please run `npm run format` and `npm run lint:fix` before submitting your work to maintain code quality.

This project was built with Google's Gemini models. If you'd like to build your own amazing projects with AI, you can get started at [Google AI Studio](https://aistudio.google.com/).

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with ❤️ for founders and developers.
</p>
