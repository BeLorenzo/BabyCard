'use client'
import { useState } from 'react'
import { usePathname } from 'next/navigation'

const LILO_IMAGES = Array.from({ length: 35 }, (_, i) => `/img/Lilo/foto${i + 1}.jpg`);

type Message = {
  sender: 'user' | 'lilo'
  text?: string
  image?: string
}

export default function LiloBot() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  // Il percorso segreto
  const SECRET_PATH = '/home-s3gr3ta-2026'

  // Autodistruzione se fuori dal percorso segreto
  if (!pathname.startsWith(SECRET_PATH)) {
    return null
  }

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    setMessages(prev => [...prev, { sender: 'user', text: input }])
    setInput('')
    setIsTyping(true)

    setTimeout(() => {
      const randomImage = LILO_IMAGES[Math.floor(Math.random() * LILO_IMAGES.length)]
      setIsTyping(false)
      setMessages(prev => [...prev, { sender: 'lilo', image: randomImage }])
    }, 1500)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="bg-[var(--brand-bg)] border border-gray-200 shadow-2xl rounded-2xl w-72 sm:w-80 h-[450px] max-h-[60vh] mb-6 flex flex-col overflow-hidden">
          
          <div className="bg-[var(--rose-dark)] text-white p-3 font-bold flex justify-between items-center shadow-sm shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xl">🐾</span>
              <span className="tracking-wide">LiloBot</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors">
              ✕
            </button>
          </div>
          
          <div className="flex-1 p-3 overflow-y-auto bg-gray-50 flex flex-col gap-3">
            {messages.length === 0 && (
              <p className="text-xs text-center text-gray-400 mt-4 opacity-80">
                Pusa è online. Probabilmente ha fame.
              </p>
            )}
            
            {messages.map((msg, i) => (
              <div 
                key={i} 
                className={`shrink-0 max-w-[85%] rounded-xl text-sm shadow-sm overflow-hidden ${
                  msg.sender === 'user' 
                    ? 'px-3 py-2 bg-[var(--rose-gold)] text-white self-end rounded-br-none' 
                    : 'bg-white border border-gray-200 text-gray-800 self-start rounded-bl-none'
                }`}
              >
                {msg.text && <span className="break-words">{msg.text}</span>}
                {msg.image && (
                  <img 
                    src={msg.image} 
                    alt="Lilo response" 
                    className="w-full h-auto block" 
                  />
                )}
              </div>
            ))}

            {isTyping && (
              <div className="shrink-0 max-w-[80%] p-3 bg-white border border-gray-200 self-start rounded-xl rounded-bl-none shadow-sm flex items-center gap-1">
                <div className="w-2 h-2 bg-[var(--rose-light)] rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-[var(--rose-gold)] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-[var(--rose-dark)] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="p-3 border-t border-gray-200 flex gap-2 bg-white shrink-0">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Scrivi qualcosa..." 
              className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--rose-gold)]"
            />
            <button 
              type="submit" 
              disabled={isTyping}
              className="bg-[var(--rose-dark)] text-white rounded-full w-9 h-9 flex items-center justify-center hover:bg-[var(--rose-gold)] transition-colors disabled:opacity-50 shrink-0"
            >
              ↑
            </button>
          </form>
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-20 h-20 hover:scale-105 transition-transform group"
      >
        <div className="absolute inset-0 bg-[var(--rose-light)] rounded-full border-4 border-white shadow-xl z-0 transition-colors group-hover:bg-[var(--rose-gold)]"></div>
        <img 
          src="/img/Lilo/lilo-sticker.png" 
          alt="Lilo" 
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[115%] max-w-none z-10 drop-shadow-md pointer-events-none text-[8px] text-center text-[var(--rose-dark)]"
        />
      </button>
    </div>
  )
}