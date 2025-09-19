import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { VoiceProcessor } from './tools/voice-processor';
import { ImageAnalyzer } from './tools/image-analyzer';
import { ContentGenerator } from './tools/content-generator';
import { PricingAnalyzer } from './tools/pricing-analyzer';
import { MarketingGenerator } from './tools/marketing-generator';

// Load environment variables
dotenv.config({ path: '../.env.local' });

const app = express();
const PORT = process.env.MCP_SERVER_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize MCP tools
const voiceProcessor = new VoiceProcessor();
const imageAnalyzer = new ImageAnalyzer();
const contentGenerator = new ContentGenerator();
const pricingAnalyzer = new PricingAnalyzer();
const marketingGenerator = new MarketingGenerator();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// MCP Tool endpoints
app.post('/tools/voice/process', async (req, res) => {
  try {
    const { audioData, language } = req.body;
    const result = await voiceProcessor.processVoice(audioData, language);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/tools/image/analyze', async (req, res) => {
  try {
    const { imageData, prompt } = req.body;
    const result = await imageAnalyzer.analyzeImage(imageData, prompt);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/tools/content/generate', async (req, res) => {
  try {
    const { type, input, context } = req.body;
    const result = await contentGenerator.generateContent(type, input, context);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/tools/pricing/analyze', async (req, res) => {
  try {
    const { productData, category } = req.body;
    const result = await pricingAnalyzer.analyzePricing(productData, category);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/tools/marketing/generate', async (req, res) => {
  try {
    const { productData, platform } = req.body;
    const result = await marketingGenerator.generateMarketing(productData, platform);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 MCP Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

export default app;
