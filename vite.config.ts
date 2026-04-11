import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { GoogleGenAI } from '@google/genai';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
    react(),
    {
      name: 'gemini-proxy',
      configureServer(server) {
        server.middlewares.use('/api/chat', async (req, res) => {
          if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => {
              body += chunk.toString();
            });
            req.on('end', async () => {
              try {
                const { message, context } = JSON.parse(body);
                
                const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
                if (!apiKey) {
                  throw new Error('Gemini API key is missing');
                }
                const ai = new GoogleGenAI({ apiKey });
                const systemInstruction = `You are StadiumAI, a helpful venue assistant at a large sporting stadium. You have access to the following live zone data: ${context}. Help attendees with: finding the shortest queue, navigating to their seat, food and restroom recommendations based on current crowd levels, and general venue questions. Be concise. Max 3 sentences per response. IMPORTANT RULE: If the user asks anything completely unrelated to the stadium, the event, or the venue data, reply strictly with "I can only answer questions related to the stadium." and do not process it further.`;
                
                const response = await ai.models.generateContent({
                  model: 'gemini-2.5-flash-lite',
                  contents: message,
                  config: {
                    systemInstruction: systemInstruction,
                  }
                });
                
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ reply: response.text }));
              } catch (err) {
                console.error(err);
                res.statusCode = 500;
                res.end(JSON.stringify({ error: 'Failed to process chat' }));
              }
            });
          }
        });
      }
    },
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      manifest: {
        name: 'SmartStadium App',
        short_name: 'SmartStadium',
        description: 'Enhancing the stadium experience',
        theme_color: '#ffffff',
      }
    })
  ]
  };
});
