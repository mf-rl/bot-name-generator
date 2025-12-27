# Bot Name Generation API

A lightweight Express.js API server for generating Minecraft bot names using AI or local word lists.

## Features

- 🤖 **AI-Powered**: Uses Groq's free AI API (Llama 3.3 70B model)
- 🆓 **Free Tier**: 14,400 requests/day with Groq
- 🔄 **Fallback**: Automatically falls back to local generation if AI fails
- ⚡ **Fast**: Express.js lightweight server
- 🎯 **Simple Integration**: Easy HTTP API for bot name generation

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Get a Free Groq API Key (Optional but Recommended)

1. Go to https://console.groq.com
2. Sign up for a free account (no credit card required)
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key

### 3. Configure the API

Edit `config.json`:

```json
{
  "nameGenerator": {
    "aiProvider": "api",
    "groqApiKey": "your-groq-api-key-here"
  },
  "api": {
    "enabled": true,
    "host": "localhost",
    "port": 3000
  }
}
```

**AI Provider Options:**
- `"api"` - Use the API server (requires running name-api.js)
- `"groq"` - Use Groq AI directly (for API server internal use)
- `"local"` - Use local word lists only
- `"openai"` - Use OpenAI (requires API key)
- `"puter"` - Puter.js (browser only)

## Usage

### Start the API Server

```bash
npm run api
```

Or manually:
```bash
node name-api.js
```

You should see:
```
[API] Name generation server running at http://localhost:3000
[API] AI Provider: groq
[API] Health check: http://localhost:3000/api/health
[API] Generate name: http://localhost:3000/api/generate-name
```

### Start the Bots (in a new terminal)

```bash
npm run bots
```

Or manually:
```bash
node multibots.js
```

## API Endpoints

### Health Check
```
GET http://localhost:3000/api/health
```

Response:
```json
{
  "status": "ok",
  "provider": "groq"
}
```

### Generate Name
```
GET http://localhost:3000/api/generate-name
```

Response:
```json
{
  "name": "CrimsonDragon4582",
  "provider": "groq"
}
```

## How It Works

1. **multibots.js** requests a name from the API
2. **name-api.js** tries to generate using Groq AI
3. If AI fails or no API key, falls back to local word lists
4. Returns the generated name

## Running Both Together

**Terminal 1 - Start API:**
```bash
npm run api
```

**Terminal 2 - Start Bots:**
```bash
npm run bots
```

## Groq Free Tier Limits

- **14,400 requests/day** (plenty for bot name generation)
- **30 requests/minute**
- No credit card required
- Multiple AI models available

## Troubleshooting

**API connection failed:**
- Make sure the API server is running first
- Check the port (default: 3000) isn't in use
- Verify `config.json` has correct host/port

**No AI names generated:**
- Check if you added the Groq API key
- Verify the API key is valid
- Check API server logs for errors
- System will fallback to local generation

**Missing dependencies:**
```bash
npm install
```

## Configuration Reference

### config.json

```json
{
  "maxBots": 3,
  "spawnMin": 20000,
  "spawnRange": 40000,
  "server": {
    "host": "localhost",
    "port": 25565
  },
  "nameGenerator": {
    "aiProvider": "api",
    "groqApiKey": "",
    "adjectives": [...],
    "nouns": [...]
  },
  "api": {
    "enabled": true,
    "host": "localhost",
    "port": 3000
  }
}
```

## Alternative AI Providers

You can also use:
- **OpenAI**: Set `aiProvider: "openai"` and add `openaiApiKey`
- **Local**: Set `aiProvider: "local"` for offline generation
- **Groq Direct**: Modify code to use Groq directly in multibots.js

## License

ISC
