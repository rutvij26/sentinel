# Contributing to Sentinel

Thank you for your interest in contributing to Sentinel! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Code Style Guidelines](#code-style-guidelines)
- [Testing Guidelines](#testing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Release Process](#release-process)
- [Reporting Bugs](#reporting-bugs)
- [Feature Requests](#feature-requests)

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

- Use the GitHub issue tracker
- Include detailed steps to reproduce the bug
- Provide environment information (OS, Node.js version, etc.)
- Include error logs and stack traces

### Suggesting Enhancements

- Use the GitHub issue tracker
- Describe the enhancement in detail
- Explain why this enhancement would be useful
- Consider the impact on existing functionality

### Pull Requests

- Fork the repository
- Create a feature branch (`git checkout -b feature/amazing-feature`)
- Make your changes
- Add tests for new functionality
- Ensure all tests pass
- Update documentation as needed
- Submit a pull request

## Development Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Local Setup

1. Fork and clone the repository:

   ```bash
   git clone https://github.com/YOUR_USERNAME/sentinel.git
   cd sentinel
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Build the project:

   ```bash
   npm run build
   ```

4. Run tests:

   ```bash
   npm test
   ```

5. Run linting:
   ```bash
   npm run lint
   ```

## Code Style Guidelines

### TypeScript

- Use TypeScript strict mode
- Prefer interfaces over types for object shapes
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Keep functions small and focused

### General

- Follow the existing code style
- Use meaningful commit messages
- Keep commits atomic and focused
- Write self-documenting code

## Testing Guidelines

### Unit Tests

- Write tests for all new functionality
- Aim for high test coverage
- Use descriptive test names
- Mock external dependencies
- Test both success and error cases

### Integration Tests

- Test the interaction between components
- Use realistic test data
- Test error handling and edge cases

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Pull Request Process

1. **Create a feature branch** from the main branch
2. **Make your changes** following the coding guidelines
3. **Add tests** for new functionality
4. **Update documentation** if needed
5. **Ensure all checks pass**:
   - Tests pass
   - Linting passes
   - Build succeeds
6. **Submit the PR** with a clear description
7. **Address review feedback** promptly

### PR Template

Use the provided PR template and fill in all sections:

- **Description**: What does this PR do?
- **Type of Change**: Bug fix, feature, documentation, etc.
- **Testing**: How was this tested?
- **Breaking Changes**: Any breaking changes?
- **Checklist**: Ensure all items are completed

## Release Process

### Versioning

We use [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features, backward compatible
- **PATCH**: Bug fixes, backward compatible

### Release Steps

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create a release tag
4. Publish to npm (if applicable)
5. Create GitHub release

## Reporting Bugs

### Bug Report Template

```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:

1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Environment:**

- OS: [e.g. Ubuntu 20.04]
- Node.js version: [e.g. 18.0.0]
- Sentinel version: [e.g. 1.0.0]

**Additional context**
Add any other context about the problem here.
```

## Feature Requests

### Feature Request Template

```markdown
**Is your feature request related to a problem? Please describe.**
A clear and concise description of what the problem is.

**Describe the solution you'd like**
A clear and concise description of what you want to happen.

**Describe alternatives you've considered**
A clear and concise description of any alternative solutions or features you've considered.

**Additional context**
Add any other context or screenshots about the feature request here.
```

## Getting Help

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Documentation**: Check the README and code comments first

## Recognition

Contributors will be recognized in:

- The project README
- Release notes
- GitHub contributors list

Thank you for contributing to Sentinel! 🚀
