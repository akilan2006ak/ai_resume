export interface ParsedDetails {
  name: string;
  email: string;
  phone: string;
  skills: string[];
}

export interface AnalysisData {
  atsScore: number;
  summary: string;
  matchingSkills: string[];
  missingSkills: string[];
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  parsedDetails: ParsedDetails;
}

export interface AnalysisResponse {
  success: boolean;
  data: AnalysisData;
  extractedResumeTextLength: number;
}
