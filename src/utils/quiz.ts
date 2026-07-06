import { API_BASE_URL, getApiMessage, readApiJson } from './api'
import type { QuizBestTime } from '../types/app'

export async function saveQuizBestTime(input: {
  quizSlug: string
  quizTitle: string
  seconds: number
  score: number
  questionCount: number
}) {
  const response = await fetch(`${API_BASE_URL}/api/quiz/best-time`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })

  const data = await readApiJson<{ message?: string }>(response)
  if (!response.ok) {
    throw new Error(getApiMessage(data) ?? 'Không thể lưu thời gian làm bài.')
  }
}

export async function fetchQuizBestTimes() {
  const response = await fetch(`${API_BASE_URL}/api/quiz/best-times`, {
    credentials: 'include',
  })

  const data = await readApiJson<{ records?: Array<{ quizSlug: string; quizTitle: string; bestSeconds: number; score: number; questionCount: number; updatedAt: string }>; message?: string }>(response)
  if (!response.ok) {
    throw new Error(getApiMessage(data) ?? 'Không tải được kỷ lục thời gian làm bài.')
  }

  const records: QuizBestTime[] = (data?.records ?? []).map((entry) => ({
    quizSlug: entry.quizSlug,
    quizTitle: entry.quizTitle,
    bestSeconds: entry.bestSeconds,
    score: entry.score,
    questionCount: entry.questionCount,
    updatedAt: entry.updatedAt,
  }))

  return records
}