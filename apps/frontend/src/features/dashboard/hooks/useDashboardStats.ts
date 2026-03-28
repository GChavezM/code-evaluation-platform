import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { getCurrentUser, type TokenPayload } from '@/lib/tokenStore';

// ─── Types ────────────────────────────────────────────────────────────────────

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

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

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

// ─── Derived stats ────────────────────────────────────────────────────────────

export interface CoderStats {
  totalSubmissions: number;
  accepted: number;
  problemsAttempted: number;
  acceptanceRate: number;
}

export interface EvaluatorStats {
  totalProblems: number;
  published: number;
  drafts: number;
  totalSubmissions: number;
}

export interface AdminStats {
  totalProblems: number;
  totalSubmissions: number;
  accepted: number;
  acceptanceRate: number;
  statusBreakdown: Record<SubmissionStatus, number>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface DashboardData {
  problems: Problem[];
  submissions: Submission[];
  user: TokenPayload | null;
  coderStats: CoderStats;
  evaluatorStats: EvaluatorStats;
  adminStats: AdminStats;
  isLoading: boolean;
  error: string | null;
}

function computeCoderStats(submissions: Submission[], problems: Problem[]): CoderStats {
  const accepted = submissions.filter((s) => s.status === 'ACCEPTED').length;
  const problemsAttempted = new Set(submissions.map((s) => s.problemId)).size;
  const acceptanceRate =
    submissions.length > 0 ? Math.round((accepted / submissions.length) * 100) : 0;

  return {
    totalSubmissions: submissions.length,
    accepted,
    problemsAttempted: Math.min(problemsAttempted, problems.length),
    acceptanceRate,
  };
}

function computeEvaluatorStats(problems: Problem[], submissions: Submission[]): EvaluatorStats {
  return {
    totalProblems: problems.length,
    published: problems.filter((p) => p.isPublished).length,
    drafts: problems.filter((p) => !p.isPublished).length,
    totalSubmissions: submissions.length,
  };
}

function computeAdminStats(problems: Problem[], submissions: Submission[]): AdminStats {
  const accepted = submissions.filter((s) => s.status === 'ACCEPTED').length;
  const acceptanceRate =
    submissions.length > 0 ? Math.round((accepted / submissions.length) * 100) : 0;

  const statusBreakdown = submissions.reduce(
    (acc, s) => {
      acc[s.status] = (acc[s.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<SubmissionStatus, number>
  );

  return {
    totalProblems: problems.length,
    totalSubmissions: submissions.length,
    accepted,
    acceptanceRate,
    statusBreakdown,
  };
}

export function useDashboardStats(): DashboardData {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const user = getCurrentUser();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [problemsRes, submissionsRes] = await Promise.all([
          api.get<{ data: Problem[] }>('/api/problems'),
          api.get<{ data: Submission[] }>('/api/submissions'),
        ]);
        setProblems(problemsRes.data.data);
        setSubmissions(submissionsRes.data.data);
      } catch {
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    void fetchData();
  }, []);

  return {
    problems,
    submissions,
    user,
    coderStats: computeCoderStats(submissions, problems),
    evaluatorStats: computeEvaluatorStats(problems, submissions),
    adminStats: computeAdminStats(problems, submissions),
    isLoading,
    error,
  };
}
