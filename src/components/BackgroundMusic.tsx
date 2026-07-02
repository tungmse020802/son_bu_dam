import { useEffect, useRef, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

// Tạo Audio DUY NHẤT ở phạm vi module (ngoài React lifecycle).
// Dù component BackgroundMusic bị mount/unmount nhiều lần khi chuyển trang
// (Footer chỉ hiển thị ở một số route), vẫn chỉ có 1 track được phát,
// không bao giờ tạo ra 2 bản audio chạy song song và lệch nhịp.
let sharedAudio: HTMLAudioElement | null = null

function getSharedAudio() {
  if (!sharedAudio) {
    sharedAudio = new Audio('/assets/nhac-nen.mp3')
    sharedAudio.loop = true
    sharedAudio.volume = 0.35
    sharedAudio.addEventListener('error', () => {
      if (sharedAudio) {
        sharedAudio.src = '/nhac-nen.mp3'
      }
    })
  }
  return sharedAudio
}

export function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    const audio = getSharedAudio()
    audioRef.current = audio

    // Đồng bộ lại trạng thái nút bấm với trạng thái thật của audio
    // (vd: vừa chuyển trang xong nhưng nhạc vẫn đang phát từ trước).
    setIsPlaying(!audio.paused)

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

    // KHÔNG pause audio khi unmount — vì đây là instance dùng chung,
    // Footer unmount (ví dụ khi vào trang /account) không có nghĩa là
    // người dùng muốn tắt nhạc. Chỉ gỡ event listener của lần mount này.
    return () => {
      removeListeners()
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
        padding: '10px'
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
          transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
          opacity: isHovered ? 1 : 0.2,
          transform: isHovered ? 'translateX(0) scale(1)' : 'translateX(-15px) scale(0.95)',
        }}
        title={isPlaying ? "Tắt nhạc nền" : "Bật nhạc nền"}
      >
        {isPlaying ? <Volume2 size={16} /> : <VolumeX size={16} />}
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