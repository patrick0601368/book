# Learning Platform

An AI-powered learning platform that creates personalized learning pages, exercises, and solution paths using ChatGPT integration.

## Features

- 🤖 **AI Content Generation**: Create learning materials with OpenAI's GPT-4
- 📚 **Learning Pages**: Comprehensive educational content
- 🎯 **Practice Exercises**: Interactive problems with solutions
- 🛤️ **Solution Paths**: Structured learning journeys
- 🔐 **Authentication**: Secure user authentication with Google OAuth
- 📊 **Progress Tracking**: Monitor your learning journey
- 🎨 **Modern UI**: Beautiful, responsive interface with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Authentication**: NextAuth.js with Email/Password
- **Database**: MongoDB with Mongoose
- **AI Integration**: OpenAI GPT-4 API
- **Deployment**: Vercel (Frontend), Render (Backend), MongoDB Atlas

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB Atlas account
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd learning-platform
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env.local
```

4. Configure your environment variables in `.env.local`:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `NEXTAUTH_URL`: Your application URL (http://localhost:3000 for development)
   - `NEXTAUTH_SECRET`: A random secret key
   - `OPENAI_API_KEY`: Your OpenAI API key

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Vercel (Frontend)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### MongoDB Atlas

1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get your connection string
4. Add your connection string to environment variables

### Render (Optional - for backend services)

1. Connect your GitHub repository to Render
2. Set environment variables
3. Deploy your application

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB Atlas connection string | Yes |
| `NEXTAUTH_URL` | Application URL | Yes |
| `NEXTAUTH_SECRET` | Secret key for NextAuth | Yes |
| `OPENAI_API_KEY` | OpenAI API key | Yes |

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   └── ...               # Feature components
├── lib/                  # Utility functions
├── models/               # Database models
└── hooks/                # Custom React hooks
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License
