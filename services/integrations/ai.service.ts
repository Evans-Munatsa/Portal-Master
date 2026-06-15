import { GoogleGenAI } from '@google/genai';

// Instantiate the SDK. The SDK implicitly uses process.env.GEMINI_API_KEY
const ai = new GoogleGenAI({}); 

export class AIService {
  /**
   * Generates a structural summary of a Candidate Profile
   */
  static async summarizeCandidate(resumeText: string, experienceLevel: string): Promise<string> {
    const prompt = `You are an expert technical recruiter analyzing a candidate profile. 
    Experience Level: ${experienceLevel}.
    Summarize the following resume extracting top 3 technical strengths and 2 potential red flags (or areas for growth).
    
    Resume:
    ${resumeText}
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
         contents: prompt,
      });
      return response.text || 'Unable to generate summary.';
    } catch (err) {
      console.error('[AIService] Failed to summarize candidate', err);
      throw new Error('AI Provider failure');
    }
  }

  /**
   * Evaluates how well a candidate's resume matches a job description.
   * Adapted to the advanced architecture replacing legacy match pipelines.
   */
  static async evaluateFit(resumeText: string, jobDescription: string) {
     const prompt = `Evaluate the candidate's resume against the job description.
     Respond with a JSON object containing:
      - matchScore (number 0-100)
      - matchedSkills (array of strings)
      - missingSkills (array of strings)
      - fitSummary (string brief paragraph)
      
      Resume: ${resumeText}
      Job DB: ${jobDescription}
     `;

     const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
           responseMimeType: 'application/json'
        }
     });

     if (response.text) {
       return JSON.parse(response.text);
     }
     
     throw new Error('Empty AI response from GenAI');
  }
}
