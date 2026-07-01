import { useEffect, useRef, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

export function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    // Thử đường dẫn trong assets, nếu lỗi tự động tìm ở thư mục gốc public
    const audio = new Audio('/assets/nhac-nen.mp3')
    audio.loop = true
    audio.volume = 0.35
    audioRef.current = audio

    audio.addEventListener('error', () => {
      if (audioRef.current) {
        audioRef.current.src = '/nhac-nen.mp3'
      }
    })

    const handleFirstInteraction = () => {
      if (audioRef.current && audioRef.current.paused) {
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true)
            removeListeners()
          })
          .catch((err) => console.log("Chờ người dùng click để kích hoạt nhạc...", err))
      }
    }

    const removeListeners = () => {
      document.removeEventListener('click', handleFirstInteraction)
    }

    document.addEventListener('click', handleFirstInteraction)

    return () => {
      removeListeners()
      if (audioRef.current) {
        audioRef.current.pause()
      }
    }
  }, [])

  const toggleMusic = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.error(err)
          alert("Không thể phát nhạc! Bạn hãy kiểm tra file nhac-nen.mp3 đã nằm trong thư mục public/assets chưa nhé.")
        })
    }
  }

  return (
    <div 
      style={{ 
        position: 'fixed', 
        bottom: '25px', 
        left: '25px', 
        zIndex: 999999,
        padding: '10px' // Tạo vùng đệm để di chuột vào dễ hơn
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button 
        type="button" 
        onClick={toggleMusic} 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 18px',
          borderRadius: '30px',
          border: isPlaying ? '1px solid #d4af37' : '1px solid rgba(212, 175, 55, 0.3)',
          cursor: 'pointer',
          background: isPlaying ? 'linear-gradient(135deg, #133a22, #0d2617)' : 'rgba(30, 30, 30, 0.9)',
          color: isPlaying ? '#d4af37' : '#a0a0a0',
          fontSize: '13px',
          fontWeight: 600,
          letterSpacing: '0.5px',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4)',
          
          /* Hiệu ứng ẩn/hiện mượt mà */
          transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
          opacity: isHovered ? 1 : 0.2, // Bình thường mờ 80%, di chuột vào hiện 100%
          transform: isHovered ? 'translateX(0) scale(1)' : 'translateX(-15px) scale(0.95)', // Thu nhỏ lùi nhẹ về góc khi ẩn
        }}
        title={isPlaying ? "Tắt nhạc nền" : "Bật nhạc nền"}
      >
        {isPlaying ? <Volume2 size={16} /> : <VolumeX size={16} />}
        
        {/* Chữ chỉ hiện ra đầy đủ khi di chuột vào, giúp nút cực kỳ gọn */}
        <span style={{
          maxWidth: isHovered ? '150px' : '0px',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          transition: 'max-width 0.4s ease-in-out, opacity 0.3s',
          opacity: isHovered ? 1 : 0,
          display: 'inline-block',
          verticalAlign: 'middle'
        }}>
          {isPlaying ? "NHẠC NỀN: ON" : "NHẠC NỀN: OFF"}
        </span>
      </button>
    </div>
  )
}