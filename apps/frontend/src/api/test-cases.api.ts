import api from '@/lib/axios';
import type { TestCase } from './problems.api';

export interface CreateTestCasePayload {
  input: string;
  expectedOutput: string;
  order: number;
  isSample?: boolean;
}

export type UpdateTestCasePayload = Partial<CreateTestCasePayload>;

interface ApiResponse<T> {
  data: T;
}

export const getTestCases = async (problemId: string): Promise<TestCase[]> => {
  const response = await api.get<ApiResponse<TestCase[]>>(`/api/problems/${problemId}/test-cases`);
  return response.data.data;
};

export const getTestCase = async (problemId: string, id: string): Promise<TestCase> => {
  const response = await api.get<ApiResponse<TestCase>>(
    `/api/problems/${problemId}/test-cases/${id}`
  );
  return response.data.data;
};

export const createTestCase = async (
  problemId: string,
  payload: CreateTestCasePayload
): Promise<TestCase> => {
  const response = await api.post<ApiResponse<TestCase>>(
    `/api/problems/${problemId}/test-cases`,
    payload
  );
  return response.data.data;
};

export const updateTestCase = async (
  problemId: string,
  id: string,
  payload: UpdateTestCasePayload
): Promise<TestCase> => {
  const response = await api.patch<ApiResponse<TestCase>>(
    `/api/problems/${problemId}/test-cases/${id}`,
    payload
  );
  return response.data.data;
};

export const deleteTestCase = async (problemId: string, id: string): Promise<void> => {
  await api.delete(`/api/problems/${problemId}/test-cases/${id}`);
};
