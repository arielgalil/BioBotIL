import { generateWidgets } from '../services/geminiService';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const apiKey = process.env.GEMINI_API_KEY || '';

if (!apiKey) {
  console.error('GEMINI_API_KEY not found in .env.local');
  process.exit(1);
}

const topics = [
  'פוטוסינתזה',
  'מיתוזה',
  'מערכת העיכול',
  'נשימה תאית',
  'הומאוסטזיס'
];

async function runTest() {
  console.log(`Starting widgets consistency test with ${topics.length} topics...\n`);
  
  for (const topic of topics) {
    console.log(`Testing topic: ${topic}`);
    try {
      const widgets = await generateWidgets(apiKey, topic);
      if (widgets.length > 0) {
        console.log(`✅ Success: Generated ${widgets.length} widgets.`);
        widgets.forEach((w, i) => {
          console.log(`   [${i}] ${w.type}`);
        });
      } else {
        console.warn(`⚠️ Warning: No widgets generated for topic: ${topic}`);
      }
    } catch (error) {
      console.error(`❌ Failed for topic ${topic}:`, error);
    }
    console.log('---');
  }
}

runTest();
