# AgenticHub AI

An AI Agent Marketplace built with React, TypeScript, and Vite.

## Getting Started

### Prerequisites

- Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Installation

1. Clone the repository:
```sh
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

2. Install dependencies:
```sh
npm install
```

3. Start the development server:
```sh
npm run dev
```

## Technologies Used

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- React Router
- TanStack Query

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run lint` - Run ESLint

## AI API Keys

Create an `.env` file in the project root and add your keys:

```env
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

Do not commit `.env` to source control.

## Run with backend proxy

1. Start the proxy:
   ```sh
   npm run dev:api
   ```
2. Start the frontend (new terminal):
   ```sh
   npm run dev
   ```
3. Or run both together:
   ```sh
   npm run dev:all
   ```

`AIChatModal` now uses `/api/chat` with server-side key handling.

## Deployment

Build the project and deploy the `dist` folder to your hosting provider.
