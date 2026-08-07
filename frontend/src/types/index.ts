export interface AnalysisResult {
  summary: string;
  explanation: string[];
  function_explanation: string[];
  variable_explanation: string[];
  data_flow: string;
  beginner_explanation: string;
  intermediate_explanation: string;
  senior_explanation: string;
  complexity: {
    time: string;
    space: string;
  };
  bugs: Array<{ issue: string; severity: string }>;
  improvements: string[];
  interview_questions: Array<{ question: string; answer: string; difficulty: string }>;
  flowchart: string;
  scores: {
    readability: number;
    maintainability: number;
    naming: number;
    documentation: number;
    overall: number;
  };
}
