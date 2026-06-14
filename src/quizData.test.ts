import { describe, expect, it } from 'vitest'
import { historyQuiz, historyQuizSets } from './data/quizData'

describe('historyQuiz data', () => {
  it('contains 45 questions with valid answers', () => {
    expect(historyQuiz.questionCount).toBe(45)
    expect(historyQuiz.questions).toHaveLength(45)

    historyQuiz.questions.forEach((question) => {
      expect(question.options).toHaveLength(4)
      expect(question.correctIndex).toBeGreaterThanOrEqual(0)
      expect(question.correctIndex).toBeLessThan(4)
      expect(question.explanation.length).toBeGreaterThan(10)
    })
  })

  it('splits questions into three scored level quiz sets', () => {
    expect(historyQuizSets).toHaveLength(3)

    historyQuizSets.forEach((quizSet) => {
      expect(quizSet.questionCount).toBe(15)
      expect(quizSet.questions).toHaveLength(15)
      expect(new Set(quizSet.questions.map((question) => question.level)).size).toBe(1)
    })
  })
})
