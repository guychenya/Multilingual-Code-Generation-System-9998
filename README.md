# AI Code Generator

A full-stack AI-powered code generation system that supports multiple programming languages with a modern React frontend and Node.js backend.

## Features

- **Multi-Language Support**: Generate code in 20+ programming languages including JavaScript, Python, Java, C++, and more
- **AI-Powered Generation**: Uses OpenAI's GPT models for intelligent code generation (with template fallback)
- **Modern UI**: Beautiful, responsive interface built with React and Tailwind CSS
- **Code Highlighting**: Syntax highlighting for generated code with copy functionality
- **Generation History**: Track and revisit previous code generations
- **Real-time Processing**: Fast code generation with loading states and error handling

## Tech Stack

### Frontend
- React 18
- React Router DOM
- Tailwind CSS
- Framer Motion
- React Syntax Highlighter
- React Icons

### Backend
- Node.js
- Express.js
- OpenAI API
- CORS enabled
- UUID for unique IDs

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Add your OpenAI API key to `.env` (optional - system works with templates)

4. Start the development server:
   ```bash
   npm run dev
   ```

5. In a separate terminal, start the backend server:
   ```bash
   npm run server
   ```

## Usage

1. Navigate to the Code Generator page
2. Select your desired programming language
3. Enter a description of what you want to build
4. Click "Generate Code" to create your code
5. Copy the generated code or view it in the history

## Supported Languages

- JavaScript
- Python
- Java
- C++
- C#
- PHP
- Ruby
- Go
- Rust
- Swift
- Kotlin
- TypeScript
- HTML
- CSS
- SQL
- Bash
- PowerShell
- R
- MATLAB
- Scala

## API Endpoints

- `POST /api/generate` - Generate code from prompt
- `GET /api/languages` - Get supported languages
- `GET /api/health` - Health check

## License

MIT License