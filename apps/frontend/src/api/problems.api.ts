import api from '@/lib/axios';

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  timeLimitMs: number;
  memoryLimitMb: number;
  isPublished: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  order: number;
  isSample: boolean;
  problemId: string;
}

export interface ProblemWithTestCases extends Problem {
  testCases: TestCase[];
}

export interface CreateProblemPayload {
  title: string;
  description: string;
  difficulty: Difficulty;
  timeLimitMs: number;
  memoryLimitMb: number;
  isPublished?: boolean;
}

export type UpdateProblemPayload = Partial<CreateProblemPayload>;

interface ApiResponse<T> {
  data: T;
}

export const getProblems = async (): Promise<Problem[]> => {
  const response = await api.get<ApiResponse<Problem[]>>('/api/problems');
  return response.data.data;
};

export const getProblem = async (id: string): Promise<ProblemWithTestCases> => {
  const response = await api.get<ApiResponse<ProblemWithTestCases>>(`/api/problems/${id}`);
  return response.data.data;
};

export const createProblem = async (payload: CreateProblemPayload): Promise<Problem> => {
  const response = await api.post<ApiResponse<Problem>>('/api/problems', payload);
  return response.data.data;
};

export const updateProblem = async (
  id: string,
  payload: UpdateProblemPayload
): Promise<Problem> => {
  const response = await api.patch<ApiResponse<Problem>>(`/api/problems/${id}`, payload);
  return response.data.data;
};

export const deleteProblem = async (id: string): Promise<void> => {
  await api.delete(`/api/problems/${id}`);
};
