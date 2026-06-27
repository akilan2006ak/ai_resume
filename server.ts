import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Setup Multer for in-memory file handling
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// JSON and URL-encoded parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up Gemini API client using implicit/ambient platform credentials or the user's provided API key
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "AQ.Ab8RN6KGGNHnBH5k2Xplh58vMZJXW9cKgzym3EWUpSvssMrmIA"
});

// Robust JSON extraction helper
function extractJSON(text: string): any {
  try {
    return JSON.parse(text.trim());
  } catch (e) {
    // Look for standard ```json ... ``` blocks
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/([\{\[][\s\S]*[\}\]])/);
    if (jsonMatch) {
      const block = jsonMatch[1].trim();
      try {
        return JSON.parse(block);
      } catch (innerError) {
        // Clean common JSON syntax issues like trailing commas or comments
        const cleaned = block
          .replace(/,\s*([\]}])/g, '$1') // remove trailing commas before close brackets/braces
          .replace(/\/\*[\s\S]*?\*\//g, '') // remove multi-line comments
          .replace(/\/\/.*/g, ''); // remove single-line comments
        try {
          return JSON.parse(cleaned);
        } catch (deepError: any) {
          throw new Error(`JSON parsing failed: ${deepError.message}. Content tried: ${block}`);
        }
      }
    }
    throw new Error(`Could not extract valid JSON from response. Raw response was: ${text}`);
  }
}

// Robust helper to perform model generation with exponential backoff retries for 503/429 errors
async function generateContentWithRetry(aiClient: GoogleGenAI, params: any, maxRetries = 3, initialDelayMs = 1500) {
  let attempt = 0;
  while (true) {
    try {
      return await aiClient.models.generateContent(params);
    } catch (error: any) {
      attempt++;
      console.warn(`Gemini API call attempt ${attempt} failed:`, error.message || error);
      
      const errorMessageText = (error.message || '').toLowerCase();
      const isRetryable = 
        error.status === 'UNAVAILABLE' || 
        error.statusCode === 503 || 
        error.code === 503 ||
        error.status === 'RESOURCE_EXHAUSTED' ||
        error.statusCode === 429 ||
        error.code === 429 ||
        errorMessageText.includes('503') || 
        errorMessageText.includes('unavailable') || 
        errorMessageText.includes('high demand') || 
        errorMessageText.includes('rate limit') || 
        errorMessageText.includes('429');

      if (isRetryable && attempt < maxRetries) {
        const delay = initialDelayMs * Math.pow(2, attempt - 1);
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // If the error indicates high demand, rewrite it to be helpful and user-friendly
      if (errorMessageText.includes('high demand') || errorMessageText.includes('unavailable') || error.code === 503 || error.statusCode === 503) {
        throw new Error("The Gemini AI service is currently experiencing extremely high demand. Please try again in a few seconds as these spikes are usually temporary.");
      }
      
      throw error;
    }
  }
}

// API endpoint for analysis
app.post('/api/analyze', upload.single('resume'), async (req: express.Request, res: express.Response) => {
  try {
    const jobDescription = req.body.jobDescription || '';
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'Please upload a PDF resume.' });
    }

    if (!jobDescription.trim()) {
      return res.status(400).json({ error: 'Please provide a job description.' });
    }

    if (file.mimetype !== 'application/pdf') {
      return res.status(400).json({ error: 'Please upload a valid PDF resume.' });
    }

    // Convert PDF buffer directly to Base64 to pass to Gemini
    const pdfBase64 = file.buffer.toString('base64');

    // Prepare prompt
    const prompt = `
You are an expert ATS (Applicant Tracking System) optimizer and professional technical recruiter.
Analyze the attached resume PDF file against the provided job description.

JOB DESCRIPTION:
"""
${jobDescription}
"""

Please evaluate the candidate's alignment and return your analysis in strict JSON format matching the schema requested.
Make sure to extract contact info (name, email, phone) if found in the resume, and list all skills found in the resume.
Determine a highly accurate ATS alignment score from 0 to 100 based on core requirements matching.
`;

    // Call Gemini API with PDF inlineData and Prompt using the robust retry helper
    const response = await generateContentWithRetry(ai, {
      model: "gemini-3.5-flash",
      contents: [
        {
          inlineData: {
            data: pdfBase64,
            mimeType: "application/pdf"
          }
        },
        prompt
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            atsScore: { 
              type: Type.INTEGER, 
              description: "An ATS alignment score between 0 and 100 representing how well the resume matches the job description." 
            },
            summary: { 
              type: Type.STRING, 
              description: "A professional 3-4 sentence summary of the candidate's fit for this specific position." 
            },
            matchingSkills: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of key skills found in the resume that directly match requirements in the job description."
            },
            missingSkills: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of key skills requested in the job description that are missing or not explicitly stated in the resume."
            },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Top 3-4 key professional strengths of the candidate based on their resume in relation to the role."
            },
            weaknesses: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Potential alignment concerns, gaps, or weak areas in the resume for this position."
            },
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Actionable, concrete suggestions to optimize the resume specifically for this job description to score higher."
            },
            parsedDetails: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: "Extracted candidate full name." },
                email: { type: Type.STRING, description: "Extracted candidate email address." },
                phone: { type: Type.STRING, description: "Extracted candidate phone number." },
                skills: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "List of all main technical/soft skills identified in the resume."
                }
              },
              required: ["name", "email", "phone", "skills"]
            }
          },
          required: ["atsScore", "summary", "matchingSkills", "missingSkills", "strengths", "weaknesses", "suggestions", "parsedDetails"]
        }
      }
    });

    const resultText = response.text || '';
    if (!resultText) {
      throw new Error('Empty response received from the Gemini AI analysis model.');
    }

    const parsedResult = extractJSON(resultText);
    return res.json({
      success: true,
      data: parsedResult,
      extractedResumeTextLength: file.size // Provide file size for compatibility
    });

  } catch (error: any) {
    console.error("Resume analysis server error:", error);
    return res.status(500).json({ 
      error: 'An error occurred while analyzing the resume.', 
      details: error.message 
    });
  }
});

// Global error handler to ensure all errors return JSON instead of HTML
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Global Express error caught:", err);
  res.status(err.status || err.statusCode || 500).json({
    success: false,
    error: err.message || 'An internal server error occurred.',
    details: err.stack || err.message
  });
});

// Configure Vite or Static File Serving
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

setupServer().catch((err) => {
  console.error("Failed to start server:", err);
});
