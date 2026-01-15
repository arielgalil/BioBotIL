import { streamChatResponse } from '../services/geminiService';
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

async function runTest() {
  console.log('Starting stream test...');
  let fullText = '';
  try {
    await streamChatResponse(
      apiKey,
      [],
      'הסבר בקצרה מהו תא צמח',
      (chunk) => {
        process.stdout.write(chunk);
        fullText += chunk;
      }
    );
    console.log('\n\nTest completed successfully.');
    if (fullText.includes('|||')) {
      console.log('Success: Response contains the expected 4-part structure separators (|||).');
    } else {
      console.warn('Warning: Response does not contain ||| separators. Check system instruction adherence.');
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
}

runTest();
