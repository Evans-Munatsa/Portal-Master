import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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
      mandatory skills, and recommended tech stack.
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
            }
          },
          required: ["description", "yearsExperienceRequired", "mandatorySkills", "techStack"]
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
      techStack: []
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
