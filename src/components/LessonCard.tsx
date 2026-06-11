import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Lesson } from '../types/app'

interface LessonCardProps {
  lesson: Lesson
}

export function LessonCard({ lesson }: LessonCardProps) {
  return (
    <article className="lesson-card lesson-card-premium">
      <img src={lesson.image} alt={lesson.title} className="lesson-image" />
      <div className="lesson-body lesson-body-refined">
        <div className="lesson-meta">
          <span>{lesson.grade}</span>
          <span>{lesson.period}</span>
          <span>{lesson.duration}</span>
        </div>
        <h3>{lesson.title}</h3>
        <p>{lesson.summary}</p>
        <ul className="feature-list lesson-feature-list">
          {lesson.objectives.slice(0, 3).map((objective) => (
            <li key={objective}>{objective}</li>
          ))}
        </ul>
        <div className="lesson-card-actions lesson-card-actions-end">
          <Link to={`/lessons/${lesson.slug}`} className="lesson-inline-cta lesson-detail-link">
            Xem bài học <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </article>
  )
}
