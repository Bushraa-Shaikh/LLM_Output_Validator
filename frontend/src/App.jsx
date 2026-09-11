import { useState } from 'react'

const API_URL = 'http://127.0.0.1:8000'

const SCHEMA_OPTIONS = [
  { value: 'product_review', label: 'Product Review' },
  { value: 'invoice', label: 'Invoice' },
  { value: 'resume', label: 'Resume' },
]

const PLACEHOLDERS = {
  product_review: 'Paste a product review here...',
  invoice: 'Paste invoice details here...',
  resume: 'Paste a resume/CV here...',
}

function App() {
  const [schemaType, setSchemaType] = useState('product_review')
  const [inputText, setInputText] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('extraction_history')
    return saved ? JSON.parse(saved) : []
  })

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const response = await fetch(`${API_URL}/extract`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input_text: inputText, schema_type: schemaType }),
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.detail || 'Extraction failed')
      }

      const data = await response.json()
      setResult(data)

      const newEntry = {
        id: Date.now(),
        schemaType,
        inputText,
        data,
        timestamp: new Date().toLocaleString(),
      }
      const updatedHistory = [newEntry, ...history].slice(0, 10)
      setHistory(updatedHistory)
      localStorage.setItem('extraction_history', JSON.stringify(updatedHistory))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function loadFromHistory(entry) {
    setSchemaType(entry.schemaType)
    setInputText(entry.inputText)
    setResult(entry.data)
    setError(null)
  }

  function clearHistory() {
    setHistory([])
    localStorage.removeItem('extraction_history')
  }

  function copyResultAsJSON() {
    if (!result) return
    navigator.clipboard.writeText(JSON.stringify(result, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  function renderResult() {
    if (!result) return null

    if (schemaType === 'product_review') {
      return (
        <>
          <h2 className="text-lg font-semibold text-[#E6EDF3] mb-3">{result.product_name}</h2>
          <p className="font-mono text-sm text-[#4FD1C5] mb-3">rating: {result.rating}/5</p>
          <p className="text-[#8B949E] text-sm mb-5 leading-relaxed">{result.summary}</p>
          <div className="font-mono text-sm space-y-1">
            {result.pros.map((p, i) => (
              <div key={`p${i}`} className="text-[#3FB950]">+ {p}</div>
            ))}
            {result.cons.map((c, i) => (
              <div key={`c${i}`} className="text-[#F85149]">- {c}</div>
            ))}
          </div>
        </>
      )
    }

    if (schemaType === 'invoice') {
      return (
        <>
          <h2 className="text-lg font-semibold text-[#E6EDF3] mb-3">{result.vendor_name}</h2>
          <div className="font-mono text-sm text-[#8B949E] space-y-1 mb-4">
            <div><span className="text-[#4FD1C5]">invoice_no:</span> {result.invoice_number}</div>
            <div><span className="text-[#4FD1C5]">total:</span> ${result.total_amount}</div>
            <div><span className="text-[#4FD1C5]">due:</span> {result.due_date}</div>
          </div>
          <div className="font-mono text-sm space-y-1">
            {result.line_items.map((item, i) => (
              <div key={i} className="text-[#8B949E]">· {item}</div>
            ))}
          </div>
        </>
      )
    }

    if (schemaType === 'resume') {
      return (
        <>
          <h2 className="text-lg font-semibold text-[#E6EDF3] mb-3">{result.full_name}</h2>
          <div className="font-mono text-sm text-[#8B949E] space-y-1 mb-4">
            <div><span className="text-[#4FD1C5]">experience:</span> {result.years_experience} yrs</div>
            <div><span className="text-[#4FD1C5]">role:</span> {result.most_recent_role}</div>
          </div>
          <p className="text-[#8B949E] text-sm mb-4 leading-relaxed">{result.summary}</p>
          <div className="flex flex-wrap gap-2">
            {result.skills.map((skill, i) => (
              <span key={i} className="font-mono text-xs text-[#4FD1C5] border border-[#2A313C] px-2 py-1 rounded">
                {skill}
              </span>
            ))}
          </div>
        </>
      )
    }

    return null
  }

  return (
    <div className="min-h-screen bg-[#0D1117] flex flex-col items-center py-16 px-4">
      <div className="w-full max-w-2xl">

        {/* Terminal window chrome */}
        <div className="bg-[#151B23] border border-[#2A313C] rounded-t-lg px-4 py-3 flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#F85149]" />
          <span className="w-3 h-3 rounded-full bg-[#D29922]" />
          <span className="w-3 h-3 rounded-full bg-[#3FB950]" />
          <span className="font-mono text-xs text-[#8B949E] ml-3">llm_output_validator.py</span>
        </div>

        <div className="bg-[#151B23] border-x border-b border-[#2A313C] rounded-b-lg p-6 mb-8">
          <h1 className="text-2xl font-semibold text-[#E6EDF3] mb-2">
            LLM Output Validator
          </h1>
          <p className="text-[#8B949E] text-sm mb-6 leading-relaxed">
            Structured data extraction with automatic retry and self-correction
            when the model's output fails validation.
          </p>

          <form onSubmit={handleSubmit}>
            <label className="block font-mono text-xs text-[#8B949E] mb-2">
              data_type
            </label>
            <select
              value={schemaType}
              onChange={(e) => {
                setSchemaType(e.target.value)
                setResult(null)
                setError(null)
              }}
              className="w-full mb-4 p-3 bg-[#0D1117] border border-[#2A313C] rounded-md text-[#E6EDF3] font-mono text-sm focus:outline-none focus:border-[#4FD1C5]"
            >
              {SCHEMA_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={PLACEHOLDERS[schemaType]}
              rows={6}
              className="w-full p-4 bg-[#0D1117] border border-[#2A313C] rounded-md text-[#E6EDF3] text-sm focus:outline-none focus:border-[#4FD1C5] resize-none placeholder:text-[#4B535D]"
              required
            />
            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              className="mt-4 bg-[#4FD1C5] text-[#0D1117] font-medium text-sm px-5 py-2.5 rounded-md hover:bg-[#3FBFB2] disabled:bg-[#2A313C] disabled:text-[#8B949E] disabled:cursor-not-allowed transition"
            >
              {loading ? 'Extracting...' : 'Extract Structured Data'}
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-[#2A1215] border border-[#F85149] text-[#F85149] text-sm p-4 rounded-md mb-6 animate-[fadeIn_0.3s_ease-in]">
            {error}
          </div>
        )}

        {result && (
          <div className="bg-[#151B23] border border-[#2A313C] rounded-lg p-6 mb-8 animate-[fadeIn_0.4s_ease-in]">
            <div className="flex justify-end mb-3">
              <button
                onClick={copyResultAsJSON}
                className="font-mono text-xs text-[#8B949E] hover:text-[#4FD1C5] border border-[#2A313C] hover:border-[#4FD1C5] rounded-md px-3 py-1 transition"
              >
                {copied ? '✓ copied' : 'copy as json'}
              </button>
            </div>
            {renderResult()}
          </div>
        )}

        {history.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-mono text-xs text-[#8B949E] uppercase tracking-wide">Recent extractions</h2>
              <button
                onClick={clearHistory}
                className="font-mono text-xs text-[#8B949E] hover:text-[#F85149] transition"
              >
                clear
              </button>
            </div>
            <div className="space-y-2">
              {history.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => loadFromHistory(entry)}
                  title={entry.inputText}
                  className="w-full text-left bg-[#151B23] border border-[#2A313C] hover:border-[#4FD1C5] rounded-md p-3 transition flex items-center justify-between"
                >
                  <div className="min-w-0">
                    <span className="font-mono text-xs text-[#4FD1C5]">
                      {SCHEMA_OPTIONS.find((o) => o.value === entry.schemaType)?.label}
                    </span>
                    <p className="text-sm text-[#8B949E] truncate max-w-md">
                      {entry.inputText}
                    </p>
                  </div>
                  <span className="font-mono text-xs text-[#4B535D] whitespace-nowrap ml-4">
                    {entry.timestamp}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <footer className="mt-16 text-center font-mono text-xs text-[#4B535D]">
        FastAPI · LangChain · React — validated with automatic self-correction
      </footer>
    </div>
  )
}

export default App