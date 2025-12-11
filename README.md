# LLM Bias Lab: Experimenting with Logit Bias in LLMs

A lab environment designed to help you **experiment with logit bias** in Large Language Models. This project focuses on providing a hands-on workspace and simple workflows for testing how logit bias affects model responses—no deep theory here, just practical experimentation.

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Examples](#examples)
- [Contributing](#contributing)
- [License](#license)
- [Keywords](#keywords)

## Project Overview

LLM Bias Lab is built to give researchers and developers a **controlled playground** for trying out logit bias settings. Instead of diving into the math behind logit bias, this project keeps the focus on **running experiments, observing outputs, and iterating quickly**.

## Prerequisites

- **Node.js** (v18 or higher)
- **npm** (v9 or higher) or **yarn**
- **OpenAI API Key** (required for model access)

## Installation

```bash
git clone https://github.com/Serhatcck/LLM-Bias.git
cd LLM-Bias-Lab
npm install
npm run build
```

## Configuration

Create a `.env` file from the template and add your keys:

```bash
cp env.example .env
```

```env
OPENAI_API_KEY=your_openai_api_key_here
PORT=3000
```

## Usage

Start the server:

```bash
npm start
```

Then open `http://localhost:3000` and:

1. Enter a **Logit Bias String** (the text you want to influence).
2. Set a **Logit Bias Value** between -100 and 100.
3. Send a message and observe how outputs change.
4. Review logs to compare different runs.

## API Reference

### POST `/api/chat`

Send a chat request with optional logit bias settings.

**Body:**
```json
{
  "content": "string (required)",
  "logit_bias_string": "string (optional)",
  "logit_bias_value": "number between -100 and 100 (optional)"
}
```

**Response (simplified):**
```json
{
  "success": true,
  "result": "Model response text",
  "logs": { ... }
}
```

## Examples

Discourage a term:
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Explain what happens when code fails",
    "logit_bias_string": "error",
    "logit_bias_value": -100
  }'
```

Encourage a term:
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Tell me about interfaces",
    "logit_bias_string": "API",
    "logit_bias_value": 50
  }'
```

## Contributing

Contributions are welcome! Feel free to open an issue or submit a Pull Request.

## License

This project is licensed under the ISC License.

## Keywords

logit bias lab, LLM bias, OpenAI API, language model control, GPT bias, LangChain, LangGraph, AI bias mitigation, token manipulation, LLM experimentation, bias testing

---

**Built for exploring logit bias in a hands-on lab setting.**
