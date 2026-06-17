import { GoogleGenAI, Type } from '@google/genai';

export const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

export async function rewriteJobDescription(htmlContent: string, mode: 'proofread' | 'expand' | 'summarize'): Promise<string> {
  const modeInstructions = {
    proofread: 'Fix any grammar, spelling, typography, or phrasing errors, and clean up the language to be extremely professional. Keep the core description details, but format it cleanly and beautifully.',
    expand: 'Expand on the given description by adding professional depth, key expectations, and rich industry vocabulary where appropriate. Ensure it reads like a premium, highly exciting job opportunity.',
    summarize: 'Synthesize the description into a beautifully structured set of highly-readable paragraph overviews and clear bullet points outlining responsibilities and required qualifications.'
  };

  const instruction = modeInstructions[mode] || modeInstructions.proofread;
  
  const prompt = `
    You are an elite talent acquisition expert and HR copywriter.
    Your task is to rewrite the following job posting description text/HTML as requested:
    "${instruction}"

    CRITICAL RULES:
    1. Your output must be formatted with clean, modern semantic HTML tags (like <p>, <strong>, <em>, <ul>, <ol>, <li>, <h2>, and <h3>).
    2. Do NOT include html/head/body or script tags.
    3. Return ONLY the resulting HTML content.
    4. Do NOT wrap the output in markdown fences (like \`\`\`html or \`\`\`).
    5. Ensure all grammar, spelling, and phrasing are completely flawless.

    Job Description Content to rewrite:
    ${htmlContent}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });
    
    let text = response.text || '';
    // Strip markdown code fences if output by mistake
    text = text.replace(/^```html\s*/i, '').replace(/```$/, '').trim();
    return text;
  } catch (error) {
    console.error('[Gemini AI] Error in rewriteJobDescription:', error);
    throw error;
  }
}

export function sanitizeResume(rawString: string): string {
  // Strip control characters but preserve tabs and newlines to prevent payload overflow
  return rawString
    .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, "") 
    .substring(0, 15000); // hard limit on characters to avoid blowing token limits
}

export async function autofillJobPosting(title: string) {
  try {
    const prompt = `
      You are an expert technical recruiter. Based on the job title "${title}", 
      generate a compelling, detailed job description, required years of experience, 
      mandatory skills, recommended tech stack, a typical location, and realistic salary bounds (e.g. annual in ZAR or USD, min/max as integers).
      Return the result strictly as a JSON object matching the requested schema.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: {
              type: Type.STRING,
              description: "A professional and detailed 3-4 paragraph job description formatted with clean, valid HTML tags (like <p>, <strong>, <ul>, <li>)."
            },
            yearsExperienceRequired: {
              type: Type.INTEGER,
              description: "An integer representing the required years of experience."
            },
            mandatorySkills: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "A list of 5-8 mandatory skills."
            },
            techStack: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "A list of 5-8 specific tools, frameworks, and languages."
            },
            location: {
              type: Type.STRING,
              description: "A typical location, e.g. 'Remote', 'Johannesburg', 'Cape Town', or 'San Francisco'."
            },
            salaryMin: {
              type: Type.INTEGER,
              description: "A typical starting monthly or annual salary (integer value, e.g. 450000)."
            },
            salaryMax: {
              type: Type.INTEGER,
              description: "A typical maximum monthly or annual salary (integer value, e.g. 700000)."
            }
          },
          required: ["description", "yearsExperienceRequired", "mandatorySkills", "techStack", "location", "salaryMin", "salaryMax"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error('[Gemini AI] Error autofilling job posting:', error);
    // Graceful fallback to avoid crashing the backend server if AI timeouts or token limits fail
    return {
      description: `<p>We are looking for a ${title}. More details to follow.</p>`,
      yearsExperienceRequired: 0,
      mandatorySkills: [],
      techStack: [],
      location: 'Remote',
      salaryMin: 400000,
      salaryMax: 650000
    };
  }
}

export async function scoreMatch(resumeText: string, jobDescription: string) {
  try {
    const sanitizedResume = sanitizeResume(resumeText);
    const sanitizedJobDescription = sanitizeResume(jobDescription); // also limit job desc

    const prompt = `
      You are an expert technical recruiter and AI talent matcher.
      Analyze the provided candidate resume text and the job description.
      Return a structured evaluation scoring the candidate's fit.
      
      Resume:
      ${sanitizedResume}
      
      Job Description:
      ${sanitizedJobDescription}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matchScore: { 
              type: Type.INTEGER, 
              description: "A score from 0 to 100 indicating the candidate's fit for the job." 
            },
            missingSkills: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Key skills required by the job that are missing from the resume."
            },
            matchedSkills: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Key skills required by the job that the candidate possesses."
            },
            recommendation: { 
              type: Type.STRING, 
              description: "One of: 'Strong Match', 'Potential Match', or 'Unsuitable'" 
            },
            fitSummary: { 
              type: Type.STRING, 
              description: "A concise 2-sentence summary of why the candidate is or isn't a fit." 
            }
          },
          required: ["matchScore", "missingSkills", "matchedSkills", "recommendation", "fitSummary"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error('[Gemini AI] Error scoring match:', error);
    // Graceful fallback on API error
    return {
      matchScore: 0,
      missingSkills: [],
      matchedSkills: [],
      recommendation: 'Unsuitable',
      fitSummary: 'Failed to evaluate candidate due to AI service timeout or error.'
    };
  }
}
