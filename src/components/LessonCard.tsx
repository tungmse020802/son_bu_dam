import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Lesson } from '../types/app'

interface LessonCardProps {
  lesson: Lesson
}

export function LessonCard({ lesson }: LessonCardProps) {
  return (
    <article className="lesson-card lesson-card-premium">
      <Link to={`/lessons/${lesson.slug}`} className="lesson-image-link" aria-label={`Mở bài học ${lesson.title}`}>
        <img src={lesson.image} alt={lesson.title} className="lesson-image" />
      </Link>
      <div className="lesson-body lesson-body-refined">
        <div className="lesson-meta">
          <span>{lesson.grade}</span>
          <span>{lesson.period}</span>
                </div>
        <h3>
  {lesson.title.includes('–') ? (
    <>
      {/* Lấy phần trước dấu – (Ví dụ: Hai Bà Trưng) */}
      <span className="lesson-main-title">
        {lesson.title.split('–')[0].trim()}
      </span>
      
      {/* Lấy phần sau dấu – (Ví dụ: Ngọn cờ đầu tiên của tinh thần độc lập) */}
      <span className="lesson-subtitle">
        {lesson.title.split('–')[1].trim()}
      </span>
    </>
  ) : (
    // Nếu tiêu đề không chứa dấu – thì giữ nguyên bình thường
    lesson.title
  )}
</h3>
        <p>{lesson.summary}</p>
        <ul className="feature-list lesson-feature-list">
          {lesson.objectives.slice(0, 3).map((objective) => (
            <li key={objective}>{objective}</li>
          ))}
        </ul>
        <div className="lesson-card-actions lesson-card-actions-end">
          <Link to={`/lessons/${lesson.slug}`} className="lesson-inline-cta lesson-detail-link lesson-detail-link-full">
            Xem bài học <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </article>
  )
}
