# 🤖 Sentinel - AI-Powered GitHub Action for PR Reviews

[![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-Ready-blue?logo=github-actions)](https://github.com/features/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue?logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Sentinel is a production-ready GitHub Action that automatically reviews pull requests using AI models from OpenAI or Google Gemini. It provides intelligent code analysis, suggestions, and responds to commands via PR comments.

## ✨ Features

- **🤖 AI-Powered Reviews**: Uses OpenAI GPT-4 or Gemini Pro for intelligent code analysis
- **📝 Inline Comments**: Posts specific feedback directly on code lines
- **💬 Command System**: Respond to commands like `/re-review`, `/explain <file>`, `/lint`
- **⚡ Performance Optimized**: Handles large PRs with intelligent chunking and caching
- **🔒 Rate Limited**: Built-in rate limiting and retry mechanisms
- **⚙️ Configurable**: Customize behavior via `.sentinel.yml` configuration file
- **🧪 Test Suggestions**: AI-generated test case recommendations
- **🔍 Code Quality**: Automated linting and best practice analysis

## 🚀 Quick Start

### 1. Add the Action to Your Repository

Create `.github/workflows/sentinel.yml` in your repository:

```yaml
name: Sentinel AI Review

on:
  pull_request:
    types: [opened, synchronize, reopened]
  issue_comment:
    types: [created]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Sentinel AI Review
        uses: rutvij26/sentinel@v1
        with:
          openai-api-key: ${{ secrets.OPENAI_API_KEY }}
          # OR use Gemini:
          # gemini-api-key: ${{ secrets.GEMINI_API_KEY }}
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

### 2. Configure Sentinel

Create `.sentinel.yml` in your repository root:

```yaml
provider: openai
model: gpt-4
maxTokens: 4000
reviewDepth: normal
autoReview: true
commentOnFiles: true
suggestTests: true
suggestLinting: true

rateLimit:
  requestsPerMinute: 60
  maxRetries: 3

commands:
  enabled: true
  allowedUsers: [] # Empty = all users
```

### 3. Set Up API Keys

Add your API keys as GitHub repository secrets:

- **OpenAI**: `OPENAI_API_KEY` (get from [OpenAI Platform](https://platform.openai.com/))
- **Gemini**: `GEMINI_API_KEY` (get from [Google AI Studio](https://aistudio.google.com/))

## 📋 Available Commands

Sentinel responds to commands posted as PR comments:

| Command           | Description               | Example                    |
| ----------------- | ------------------------- | -------------------------- |
| `/re-review`      | Re-run the AI review      | `/re-review`               |
| `/summarize`      | Generate PR summary       | `/summarize`               |
| `/explain <file>` | Explain file changes      | `/explain src/main.ts`     |
| `/lint`           | Run code quality analysis | `/lint`                    |
| `/tests`          | Suggest test cases        | `/tests`                   |
| `/help`           | Show command help         | `/help` or `/help explain` |

## ⚙️ Configuration Options

### AI Provider Settings

```yaml
# OpenAI Configuration
provider: openai
model: gpt-4                    # gpt-4, gpt-3.5-turbo, etc.
maxTokens: 4000

# Gemini Configuration
provider: gemini
model: gemini-pro               # gemini-pro, gemini-pro-vision
maxTokens: 4000
```

### Review Depth

```yaml
reviewDepth: normal # Options: light, normal, deep

# Light: Quick feedback, major issues only
# Normal: Balanced coverage of functionality, security, best practices
# Deep: Comprehensive analysis including edge cases and performance
```

### Feature Toggles

```yaml
review:
  autoReview: true # Auto-review new/updated PRs
  commentOnFiles: true # Post inline comments
  suggestTests: true # Generate test suggestions
  suggestLinting: true # Identify code quality issues
```

### Rate Limiting

```yaml
rateLimit:
  requestsPerMinute: 60 # API requests per minute
  maxRetries: 3 # Retry attempts for failures
```

### Command Access Control

```yaml
commands:
  enabled: true
  allowedUsers: # Restrict to specific users
    - username1
    - username2
  # Leave empty to allow all users
```

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   GitHub PR     │───▶│  Event Handler  │───▶│   Sentinel      │
│   Events        │    │                 │    │   Core          │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                       │
                                ▼                       ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │ Command Handler │    │  AI Provider    │
                       │                 │    │  (OpenAI/Gemini)│
                       └─────────────────┘    └─────────────────┘
                                │                       │
                                ▼                       ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   PR Commenter  │    │  Diff Fetcher   │
                       │                 │    │                 │
                       └─────────────────┘    └─────────────────┘
```

## 🔧 Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

```bash
# Clone the repository
git clone https://github.com/rutvij26/sentinel.git
cd sentinel

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

### Project Structure

```
src/
├── ai/                 # AI provider implementations
│   ├── openai-provider.ts
│   ├── gemini-provider.ts
│   └── ai-provider-factory.ts
├── commands/           # Command implementations
│   ├── command-handler.ts
│   ├── re-review-command.ts
│   ├── explain-command.ts
│   └── ...
├── config/             # Configuration management
│   └── config-loader.ts
├── events/             # GitHub event handling
│   └── event-handler.ts
├── github/             # GitHub API interactions
│   ├── pr-diff-fetcher.ts
│   └── pr-commenter.ts
├── utils/              # Utility classes
│   ├── logger.ts
│   ├── rate-limiter.ts
│   └── cache.ts
├── types/              # TypeScript type definitions
│   └── index.ts
├── sentinel.ts         # Main Sentinel class
└── index.ts            # Action entry point
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test -- --coverage
```

## 📦 Building

```bash
# Build for production
npm run build

# The action will use the compiled JavaScript in dist/
```

## 🚀 Deployment

### Option 1: Use as a GitHub Action

1. Push your code to a GitHub repository
2. Create a release with a tag (e.g., `v1.0.0`)
3. Reference the action in other repositories:
   ```yaml
   uses: rutvij26/sentinel@v1.0.0
   ```

### Option 2: Self-Hosted

1. Build the project: `npm run build`
2. Deploy the `dist/` folder to your hosting environment
3. Configure GitHub Actions to use your self-hosted runner

## 🔒 Security Considerations

- **API Keys**: Never commit API keys to your repository
- **Permissions**: Use minimal required permissions for `GITHUB_TOKEN`
- **Rate Limiting**: Configure appropriate rate limits to prevent abuse
- **User Access**: Restrict command access to trusted users if needed

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Add tests for new functionality
- Update documentation for API changes
- Use conventional commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [GitHub Actions](https://github.com/features/actions) for the automation platform
- [OpenAI](https://openai.com/) for GPT models
- [Google AI](https://ai.google/) for Gemini models
- [@actions/core](https://github.com/actions/toolkit) for GitHub Actions utilities

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/rutvij26/sentinel/issues)
- **Discussions**: [GitHub Discussions](https://github.com/rutvij26/sentinel/discussions)
- **Documentation**: [Wiki](https://github.com/rutvij26/sentinel/wiki)

---

**Made with ❤️ by the Sentinel Team**

_Transform your pull request workflow with AI-powered insights!_
