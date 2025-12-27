const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

// Load configuration
let config;

try {
  const configPath = path.join(__dirname, 'config.json');
  const configFile = fs.readFileSync(configPath, 'utf8');
  config = JSON.parse(configFile);
  console.log('[API] Configuration loaded from config.json');
} catch (err) {
  console.error('[API] Failed to load config.json:', err.message);
  process.exit(1);
}

// Override API key from environment variable if present
if (process.env.GROQ_API_KEY) {
  config.nameGenerator.groqApiKey = process.env.GROQ_API_KEY;
  console.log('[API] Using Groq API key from environment variable');
  console.log(`[API] API key length: ${config.nameGenerator.groqApiKey.length} characters`);
} else {
  console.log('[API] No GROQ_API_KEY environment variable found');
  if (config.nameGenerator.groqApiKey) {
    console.log(`[API] Using Groq API key from config.json (${config.nameGenerator.groqApiKey.length} characters)`);
  } else {
    console.log('[API] No Groq API key configured - will use local generation only');
  }
}

// Groq client (lazy-loaded)
let groq = null;

async function generateNameWithGroq() {
  if (!config.nameGenerator.groqApiKey || config.nameGenerator.groqApiKey.trim() === '') {
    console.log('[API] Skipping Groq: No API key configured');
    return null;
  }

  try {
    if (!groq) {
      const Groq = require('groq-sdk');
      groq = new Groq({ apiKey: config.nameGenerator.groqApiKey });
    }

    const completion = await groq.chat.completions.create({
      messages: [{
        role: 'user',
        content: 'Generate a single cool, unique Minecraft bot name in the format: AdjectiveNoun#### (e.g., SwiftWolf1234, IronFalcon5678). Adjetive and Noun can be ocasionaly in leetspeak. Only respond with the name, nothing else.'
      }],
      model: 'openai/gpt-oss-120b',
      temperature: 1.0,
      max_completion_tokens: 8192,
      top_p: 1,
      reasoning_effort: "medium",
      stream: false,
      stop: null
    });

    const name = completion.choices[0]?.message?.content?.trim();
    if (name && name.length > 0 && name.length < 30) {
      console.log(`[API] Generated Groq AI name: ${name}`);
      return name;
    }
  } catch (err) {
    console.error(`[API] Groq AI failed: ${err.message}`);
  }
  return null;
}

function generateRandomName() {
  const adjectives = config.nameGenerator.adjectives;
  const nouns = config.nameGenerator.nouns;
  
  if (!adjectives.length || !nouns.length) {
    // Fallback defaults if config is missing
    const defaultAdj = ['Swift', 'Silent', 'Iron', 'Shadow', 'Crimson', 'Storm', 'Wild'];
    const defaultNouns = ['Wolf', 'Falcon', 'Tiger', 'Eagle', 'Raven', 'Dragon', 'Viper'];
    const adj = adjectives.length ? adjectives : defaultAdj;
    const noun = nouns.length ? nouns : defaultNouns;
    return `${adj[Math.floor(Math.random()*adj.length)]}${noun[Math.floor(Math.random()*noun.length)]}${Math.floor(Math.random()*9999)}`;
  }
  
  return `${adjectives[Math.floor(Math.random()*adjectives.length)]}${nouns[Math.floor(Math.random()*nouns.length)]}${Math.floor(Math.random()*9999)}`;
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', provider: config.nameGenerator.aiProvider });
});

app.post('/api/generate-name', async (req, res) => {
  try {
    let name = null;
    let actualProvider = 'local';
    
    // Try AI generation if configured
    if (config.nameGenerator.aiProvider === 'groq' && config.nameGenerator.groqApiKey) {
      name = await generateNameWithGroq();
      if (name) {
        actualProvider = 'groq';
      }
    }
    
    // Fallback to local generation
    if (!name) {
      name = generateRandomName();
      actualProvider = 'local';
    }
    
    res.json({ name, provider: actualProvider });
  } catch (error) {
    console.error('[API] Error generating name:', error);
    res.status(500).json({ error: 'Failed to generate name', name: generateRandomName(), provider: 'local' });
  }
});

app.get('/api/generate-name', async (req, res) => {
  try {
    let name = null;
    let actualProvider = 'local';
    
    if (config.nameGenerator.aiProvider === 'groq' && config.nameGenerator.groqApiKey) {
      name = await generateNameWithGroq();
      if (name) {
        actualProvider = 'groq';
      }
    }
    
    if (!name) {
      name = generateRandomName();
      actualProvider = 'local';
    }
    
    res.json({ name, provider: actualProvider });
  } catch (error) {
    console.error('[API] Error generating name:', error);
    res.status(500).json({ error: 'Failed to generate name', name: generateRandomName(), provider: 'local' });
  }
});

const PORT = config.api?.port || 3000;
const HOST = process.env.API_HOST || config.api?.host || 'localhost';

app.listen(PORT, HOST, () => {
  console.log(`[API] Name generation server running at http://${HOST}:${PORT}`);
  console.log(`[API] AI Provider: ${config.nameGenerator.aiProvider}`);
  console.log(`[API] Health check: http://${HOST}:${PORT}/api/health`);
  console.log(`[API] Generate name: http://${HOST}:${PORT}/api/generate-name`);
});
