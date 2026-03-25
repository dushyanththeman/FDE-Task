import type React from 'react'
import { useState, useRef, useEffect } from 'react'
import { sendQuery } from './api'

interface Message {
  role: 'user' | 'assistant'
  text: string
  sql?: string
}

interface Props {
  onHighlight: (ids: string[]) => void
}

export default function ChatPanel({ onHighlight }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: 'Hi! I can help you analyze the **Order to Cash** process.'
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return

    const userMsg: Message = { role: 'user', text }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    // Build history (last 10 messages, excluding the one we just added)
    const history = messages.slice(-10).map(m => ({
      role: m.role,
      text: m.text
    }))

    try {
      const res = await sendQuery(text, history)
      const assistantMsg: Message = {
        role: 'assistant',
        text: res.answer || 'No response received.',
        sql: res.sql
      }
      setMessages(prev => [...prev, assistantMsg])
      if (res.highlightNodes?.length) {
        onHighlight(res.highlightNodes)
      }
    } catch (e) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: 'Something went wrong. Please try again.'
        }
      ])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const renderText = (text: string) => {
    // Bold **text** support
    return text.split(/(\*\*[^*]+\*\*)/).map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>
      }
      return part
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Chat Header */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', flexShrink: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: '#111' }}>Chat with Graph</div>
        <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>Order to Cash</div>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 16
        }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
              alignItems: 'flex-start',
              gap: 10
            }}
          >
            {/* Avatar */}
            {msg.role === 'assistant' && (
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: '#111',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  fontWeight: 700,
                  flexShrink: 0
                }}
              >
                D
              </div>
            )}
            {msg.role === 'user' && (
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: '#e5e7eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#666">
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                </svg>
              </div>
            )}

            <div style={{ maxWidth: '85%' }}>
              {/* Bubble */}
              <div
                style={{
                  background: msg.role === 'user' ? '#111' : '#f0f0f0',
                  color: msg.role === 'user' ? '#fff' : '#111',
                  borderRadius: msg.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                  padding: '10px 14px',
                  fontSize: 14,
                  lineHeight: 1.5
                }}
              >
                {renderText(msg.text)}
              </div>

              {/* SQL Viewer */}
              {msg.sql && (
                <details style={{ fontSize: 11, marginTop: 4 }}>
                  <summary
                    style={{
                      cursor: 'pointer',
                      color: '#888',
                      userSelect: 'none'
                    }}
                  >
                    View SQL
                  </summary>
                  <pre
                    style={{
                      fontSize: 10,
                      overflowX: 'auto',
                      background: '#f8f8f8',
                      padding: '8px',
                      borderRadius: 6,
                      marginTop: 4,
                      border: '1px solid #e5e7eb',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-all'
                    }}
                  >
                    {msg.sql}
                  </pre>
                </details>
              )}
            </div>
          </div>
        ))}

        {/* Loading dots */}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: '#111',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 700
              }}
            >
              D
            </div>
            <div
              style={{
                background: '#f0f0f0',
                borderRadius: '12px 12px 12px 2px',
                padding: '14px 18px',
                display: 'flex',
                gap: 4
              }}
            >
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: '#999',
                    animation: 'bounce 1.2s infinite',
                    animationDelay: `${i * 0.2}s`
                  }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Status bar */}
      <div
        style={{
          padding: '6px 16px',
          borderTop: '1px solid #f0f0f0',
          fontSize: 12,
          color: '#22c55e',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          flexShrink: 0
        }}
      >
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
        Dodge AI is awaiting instructions
      </div>

      {/* Input bar */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          gap: 8,
          flexShrink: 0
        }}
      >
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          disabled={loading}
          placeholder="Analyze anything"
          style={{
            flex: 1,
            borderRadius: 8,
            border: '1px solid #e5e7eb',
            padding: '10px 14px',
            fontSize: 14,
            outline: 'none',
            background: loading ? '#f9fafb' : '#fff',
            color: '#111'
          }}
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          style={{
            background: loading || !input.trim() ? '#9ca3af' : '#111',
            color: '#fff',
            borderRadius: 8,
            border: 'none',
            padding: '10px 20px',
            fontSize: 14,
            cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
            fontWeight: 500,
            transition: 'background 0.2s'
          }}
        >
          Send
        </button>
      </div>

      {/* Bounce animation */}
      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  )
}
