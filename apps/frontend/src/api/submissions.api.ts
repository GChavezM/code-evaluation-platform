import api from '@/lib/axios';

export type SubmissionStatus =
  | 'PENDING'
  | 'RUNNING'
  | 'ACCEPTED'
  | 'WRONG_ANSWER'
  | 'TIME_LIMIT_EXCEEDED'
  | 'MEMORY_LIMIT_EXCEEDED'
  | 'RUNTIME_ERROR'
  | 'COMPILATION_ERROR';

export type ProgramingLanguage = 'PYTHON';

export interface SubmissionResult {
  id: string;
  status: SubmissionStatus;
  executionTimeMs: number | null;
  memoryUsedMb: number | null;
  actualOutput: string | null;
  createdAt: string;
  submissionId: string;
  testCaseId: string;
  testCase: {
    id: string;
    input: string;
    expectedOutput: string;
    order: number;
    isSample: boolean;
  };
}

export interface Submission {
  id: string;
  sourceCode: string;
  language: ProgramingLanguage;
  status: SubmissionStatus;
  submittedAt: string;
  queueJobId: string | null;
  userId: string;
  problemId: string;
}

export interface SubmissionWithResults extends Submission {
  submissionResults: SubmissionResult[];
}

export interface CreateSubmissionPayload {
  sourceCode: string;
  language: ProgramingLanguage;
  problemId: string;
}

export interface ListSubmissionsParams {
  problemId?: string;
  userId?: string;
}

interface ApiResponse<T> {
  data: T;
}

export const createSubmission = async (payload: CreateSubmissionPayload): Promise<Submission> => {
  const response = await api.post<ApiResponse<Submission>>('/api/submissions', payload);
  return response.data.data;
};

export const getSubmissions = async (params?: ListSubmissionsParams): Promise<Submission[]> => {
  const response = await api.get<ApiResponse<Submission[]>>('/api/submissions', { params });
  return response.data.data;
};

export const getSubmission = async (id: string): Promise<SubmissionWithResults> => {
  const response = await api.get<ApiResponse<SubmissionWithResults>>(`/api/submissions/${id}`);
  return response.data.data;
};
