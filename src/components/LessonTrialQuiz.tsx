import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, Lock, RefreshCcw } from 'lucide-react'
import { LessonQuizDemo } from '../data/quizData'

interface LessonTrialQuizProps {
  lessonSlug: string
}

export function LessonTrialQuiz({ lessonSlug }: LessonTrialQuizProps) {
  const questions = LessonQuizDemo[lessonSlug]

  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  // Nhân vật chưa có dữ liệu demo thì không hiển thị mục này (an toàn, không lỗi)
  if (!questions || questions.length === 0) {
    return null
  }

  const question = questions[currentIndex]
  const isLastQuestion = currentIndex === questions.length - 1
  const progress = ((currentIndex + (submitted ? 1 : 0)) / questions.length) * 100

  function handleSelect(index: number) {
    if (submitted) return
    setSelectedOption(index)
  }

  function handleSubmit() {
    if (selectedOption === null || submitted) return
    if (selectedOption === question.correctIndex) {
      setScore((prev) => prev + 1)
    }
    setSubmitted(true)
  }

  function handleNext() {
    if (isLastQuestion) {
      setFinished(true)
      return
    }
    setCurrentIndex((prev) => prev + 1)
    setSelectedOption(null)
    setSubmitted(false)
  }

  function handleRestart() {
    setCurrentIndex(0)
    setSelectedOption(null)
    setSubmitted(false)
    setScore(0)
    setFinished(false)
  }

  return (
    <section className="admin-panel lesson-trial-quiz">
      <div className="section-heading section-heading-balanced">
        <div>
          <p className="eyebrow dark">Trải nghiệm miễn phí</p>
          <h3>Thử sức 3 câu hỏi nhanh</h3>
          <p className="lesson-trial-quiz-note">
            Chưa cần sở hữu thẻ bài, bạn vẫn có thể thử ngay 3 câu hỏi trắc nghiệm về nhân vật này.
          </p>
        </div>
      </div>

      {finished ? (
        <div className="lesson-trial-quiz-result">
          <div className="result-ring result-ring-clean">
            <strong>{score}/{questions.length}</strong>
            <span>Điểm trải nghiệm</span>
          </div>
          <div>
            <h4>Đã hoàn thành phần trải nghiệm</h4>
            <p>
              Bạn trả lời đúng {score}/{questions.length} câu. Mua bộ thẻ bài để mở khóa toàn bộ 45 câu hỏi
              và chế độ chơi Quiz đầy đủ 3 cấp độ.
            </p>
            <div className="hero-actions hero-actions-compact">
              <button type="button" className="secondary-btn" onClick={handleRestart}>
                <RefreshCcw size={15} />
                Thử lại
              </button>
              <Link to="/products" className="primary-btn">
                <Lock size={15} />
                Mở khóa Quiz đầy đủ
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="lesson-trial-quiz-body">
          <div className="quiz-progress-row">
            <strong>Câu {currentIndex + 1}/{questions.length}</strong>
            <span>{score} điểm</span>
          </div>
          <div className="quiz-progress-bar">
            <span style={{ width: `${progress}%` }} />
          </div>
          <h4 className="quiz-prompt">{question.prompt}</h4>
          <div className="quiz-options-grid quiz-options-grid-clean">
            {question.options.map((option, index) => {
              const isCorrect = submitted && index === question.correctIndex
              const isWrong = submitted && selectedOption === index && index !== question.correctIndex
              return (
                <button
                  key={option}
                  type="button"
                  className={`quiz-option ${selectedOption === index ? 'selected' : ''} ${isCorrect ? 'correct' : ''} ${isWrong ? 'wrong' : ''}`}
                  onClick={() => handleSelect(index)}
                >
                  <span>{String.fromCharCode(65 + index)}</span>
                  <strong>{option}</strong>
                </button>
              )
            })}
          </div>
          {submitted ? (
            <div className="quiz-feedback-box quiz-feedback-box-clean">
              <div className="quiz-feedback-title">
                <CheckCircle2 size={18} />
                <strong>{selectedOption === question.correctIndex ? 'Chính xác!' : 'Chưa đúng, cùng ghi nhớ lại nhé.'}</strong>
              </div>
              <p>{question.explanation}</p>
            </div>
          ) : null}
          <div className="hero-actions hero-actions-compact">
            {!submitted ? (
              <button className="primary-btn" onClick={handleSubmit} disabled={selectedOption === null}>
                Kiểm tra đáp án
              </button>
            ) : (
              <button className="primary-btn" onClick={handleNext}>
                {isLastQuestion ? 'Xem kết quả' : 'Câu tiếp theo'}
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  )
}