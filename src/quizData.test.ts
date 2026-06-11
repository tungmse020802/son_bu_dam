import { describe, expect, it } from 'vitest'
import { historyQuiz } from './data/quizData'

describe('historyQuiz data', () => {
  it('contains 30 questions with valid answers', () => {
    expect(historyQuiz.questionCount).toBe(30)
    expect(historyQuiz.questions).toHaveLength(30)

    historyQuiz.questions.forEach((question) => {
      expect(question.options).toHaveLength(4)
      expect(question.correctIndex).toBeGreaterThanOrEqual(0)
      expect(question.correctIndex).toBeLessThan(4)
      expect(question.explanation.length).toBeGreaterThan(10)
    })
  })
})
