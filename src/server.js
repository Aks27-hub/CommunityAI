import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static assets first, then API routes, then default index/html files
app.use(express.static(__dirname));

const DB_PATH = path.join(__dirname, 'db.json');

// Lazy initializer for Gemini
let aiClient = null;
function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
      aiClient = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });
    }
  }
  return aiClient;
}

// Database helper utilities
async function readDatabase() {
  try {
    const raw = await fs.readFile(DB_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error reading database, using fallback structure', error);
    return { user: {}, reports: [], activities: [] };
  }
}

async function writeDatabase(data) {
  try {
    data.meta = data.meta || {};
    data.meta.updatedAt = Date.now();
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing to database', error);
  }
}

// API Route: Get state
app.get('/api/state', async (req, res) => {
  const db = await readDatabase();
  res.json(db);
});

// API Route: Set state
app.post('/api/state', async (req, res) => {
  const incoming = req.body;
  if (!incoming || !incoming.user) {
    return res.status(400).json({ error: 'Invalid state payload' });
  }
  await writeDatabase(incoming);
  res.json(incoming);
});

// API Route: Analyze image/video with Gemini (or fallback heuristics)
app.post('/api/analyze', async (req, res) => {
  const { mediaData, mediaType, promptText } = req.body;

  if (!mediaData) {
    return res.status(400).json({ error: 'No media data provided for analysis.' });
  }

  // Base64 cleaning
  const base64Clean = mediaData.replace(/^data:image\/\w+;base64,/, '').replace(/^data:video\/\w+;base64,/, '');

  const ai = getGeminiClient();
  if (ai) {
    try {
      console.log('Sending media to Gemini for analysis...');
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: [
          {
            inlineData: {
              mimeType: mediaType || 'image/jpeg',
              data: base64Clean
            }
          },
          {
            text: `Analyze the civic issue in this uploaded photo/video. Identify the primary problem and categorize it correctly. Return strict JSON ONLY with no markdown wrappers or enclosing tags. Valid categories: 'Road Infrastructure', 'Traffic Safety', 'Public Sanitation', 'Green Spaces', 'Utilities', 'Community Spaces'. Valid severities: 'Minor', 'Moderate', 'Critical'.

The JSON response MUST exactly match this format:
{
  "category": "Road Infrastructure",
  "severity": "Moderate",
  "department": "Public Works",
  "title": "Large Street Pothole",
  "summary": "Deep asphalt breakdown causing lane redirection and pedestrian hazard.",
  "confidence": 94,
  "affected": "400+ Citizens"
}`
          }
        ],
        config: {
          responseMimeType: 'application/json'
        }
      });

      const responseText = response.text;
      console.log('Gemini Analysis Response:', responseText);
      const result = JSON.parse(responseText.trim());
      return res.json(result);
    } catch (error) {
      console.error('Gemini API analysis failed, falling back to heuristic analyzer', error);
    }
  }

  // Fallback heuristic analyzer
  console.log('Using fallback local heuristic analyzer...');
  const textHint = String(promptText || '').toLowerCase();
  let category = 'Road Infrastructure';
  let severity = 'Moderate';
  let department = 'Public Works';
  let title = 'Detected Infrastructure Issue';
  let summary = 'Road surface damage detected near pedestrian walkway. Dispatched for crew validation.';
  let confidence = 75;
  let affected = '250 Citizens';

  if (textHint.includes('trash') || textHint.includes('garbage') || textHint.includes('sanitation') || textHint.includes('dumping')) {
    category = 'Public Sanitation';
    department = 'Sanitation';
    title = 'Illegal Dumping / Refuse Accumulation';
    summary = 'Debris heap blocking sidewalk access. Sanitation crew flagged for pickup.';
    confidence = 88;
    affected = '150 Citizens';
  } else if (textHint.includes('light') || textHint.includes('lamp') || textHint.includes('power') || textHint.includes('dark')) {
    category = 'Traffic Safety';
    department = 'Public Works';
    title = 'Streetlight Outage';
    summary = 'Damaged municipal fixture causing visibility reduction at crosswalk.';
    confidence = 90;
    affected = '500+ Citizens';
  } else if (textHint.includes('park') || textHint.includes('bench') || textHint.includes('playground') || textHint.includes('graffiti')) {
    category = 'Green Spaces';
    department = 'Parks & Recreation';
    title = 'Park Maintenance Outage';
    summary = 'Public asset damaged in neighborhood park. Parks team notified for repair.';
    confidence = 82;
    affected = '80 Citizens';
  } else if (textHint.includes('water') || textHint.includes('leak') || textHint.includes('pipe') || textHint.includes('drain')) {
    category = 'Utilities';
    department = 'Utilities';
    title = 'Water Main Breakdown';
    summary = 'Localized pooling observed near roadway. Utility service notified.';
    confidence = 92;
    affected = '1.2k Citizens';
  }

  res.json({ category, severity, department, title, summary, confidence, affected });
});

// API Route: Generate Custom Forecast using Gemini
app.post('/api/forecast', async (req, res) => {
  const { district, category, currentTrend } = req.body;
  const ai = getGeminiClient();

  if (ai) {
    try {
      console.log(`Generating forecast with Gemini for district ${district}...`);
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `You are the chief urban modeling AI for City Champion. Generate a predictive forecast analysis for the civic department regarding:
District: ${district}
Category: ${category}
Current Trend: ${currentTrend || 'Elevated complaints'}

Provide a strict JSON response containing the forecast data. Do not enclose in markdown. Format must be:
{
  "title": "District ${district} Forecast",
  "subtitle": "${category} Trend Analysis",
  "summary": "AI modeling indicates a 15% increase in seasonal complaints. Immediate deployment of 2 safety crews on weekends recommended to mitigate resident frustration by 45%.",
  "bars": [
    { "label": "Risk Rate", "value": 85, "color": "bg-error" },
    { "label": "Community Strain", "value": 72, "color": "bg-amber-500" },
    { "label": "Crew Availability", "value": 45, "color": "bg-secondary" },
    { "label": "Projected Improvement", "value": 68, "color": "bg-primary" }
  ]
}`,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const result = JSON.parse(response.text.trim());
      return res.json(result);
    } catch (error) {
      console.error('Gemini forecast failed, falling back to static district forecast', error);
    }
  }

  // Fallback static forecast data
  res.json({
    title: `District ${district} Custom Forecast`,
    subtitle: `${category} Risk Model`,
    summary: `Heuristic forecast: District ${district} exhibits a moderate escalation in ${category} events. Tactical routing offsets backlog by 12% in peak hours.`,
    bars: [
      { label: 'Escalation Index', value: 65, color: 'bg-error' },
      { label: 'Staff Resource Buffer', value: 50, color: 'bg-secondary' },
      { label: 'Citizen Impact Rate', value: 58, color: 'bg-amber-500' },
      { label: 'Resolution Pace', value: 74, color: 'bg-primary' }
    ]
  });
});

// API Route: Live Radio Tracking commentary using Gemini
app.post('/api/track-status', async (req, res) => {
  const { reportId, category, status, address } = req.body;
  const ai = getGeminiClient();

  if (ai) {
    try {
      console.log(`Generating live radio update with Gemini for report ${reportId}...`);
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `You are a municipal dispatch coordinator or field technician on the radio. Write a short, professional, realistic status commentary (1-2 sentences) about case ${reportId} (${category}) at ${address}. Current state: ${status}. Express exactly what is happening on the ground in a professional civic tone. No intro, no exit.`
      });

      return res.json({ commentary: response.text.trim() });
    } catch (error) {
      console.error('Gemini live status commentary failed', error);
    }
  }

  // Fallback radio chatter
  res.json({
    commentary: `[Radio Chatter] Dispatch, team confirmed en route to ${address}. Estimating site arrival in 15 minutes. Over.`
  });
});

// Fallback HTML page routing for SPA and standard index pages
app.get('*', (req, res) => {
  const filePath = path.join(__dirname, req.path);
  if (req.path === '/' || req.path === '/index.html') {
    res.sendFile(path.join(__dirname, 'index.html'));
  } else {
    res.sendFile(path.join(__dirname, 'index.html')); // SPA fallback
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`City Champion full-stack server running at http://localhost:${PORT}`);
});
