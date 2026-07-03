import nodemailer from 'nodemailer'

const smtpHost = process.env.SMTP_HOST
const smtpPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587
const smtpUser = process.env.SMTP_USER
const smtpPass = process.env.SMTP_PASS
const mailFrom = process.env.SMTP_FROM ?? 'Sử Việt Anh Minh <no-reply@suvietanhminh.local>'

const mockMode = !smtpHost || !smtpUser || !smtpPass

const transporter = mockMode
  ? null
  : nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
    })

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const subject = 'Đặt lại mật khẩu - Sử Việt Anh Minh'
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color:#8a1f2d;">Đặt lại mật khẩu</h2>
      <p>Bạn (hoặc ai đó) vừa yêu cầu đặt lại mật khẩu cho tài khoản Sử Việt Anh Minh gắn với email này.</p>
      <p>Nhấn vào nút bên dưới để đặt mật khẩu mới. Liên kết có hiệu lực trong 30 phút.</p>
      <p style="text-align:center; margin: 28px 0;">
        <a href="${resetUrl}" style="background:#8a1f2d;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;">Đặt lại mật khẩu</a>
      </p>
      <p>Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
    </div>
  `

  if (mockMode || !transporter) {
    console.log('[email:mock] Gửi email đặt lại mật khẩu tới', to)
    console.log('[email:mock] Link đặt lại mật khẩu:', resetUrl)
    return
  }

  await transporter.sendMail({ from: mailFrom, to, subject, html })
}