'use client'
import { useState, useEffect } from 'react'

export default function Randomizer() {
  const [options, setOptions] = useState<string[]>([])
  const [input, setInput] = useState('')
  const [result, setResult] = useState<string | null>(null)
  const [isSpinning, setIsSpinning] = useState(false)
  const [currentText, setCurrentText] = useState('Inserisci le opzioni')

  // Aggiunge un'opzione alla lista
  const handleAddOption = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    // Evitiamo duplicati identici
    if (!options.includes(input.trim())) {
      setOptions(prev => [...prev, input.trim()])
    }
    setInput('')
    setResult(null) // Resetta il vincitore precedente se aggiungi roba nuova
    setCurrentText('Pronto a girare?')
  }

  // Rimuove un'opzione
  const handleRemove = (optionToRemove: string) => {
    const newOptions = options.filter(opt => opt !== optionToRemove)
    setOptions(newOptions)
    if (newOptions.length === 0) setCurrentText('Inserisci le opzioni')
    else if (newOptions.length < 2) setCurrentText('Aggiungine almeno due')
    setResult(null)
  }

  // L'animazione "Slot Machine"
  const handleSpin = () => {
    if (options.length < 2) return
    setIsSpinning(true)
    setResult(null)

    let ticks = 0
    const maxTicks = 40 // Quante volte cambia il testo (40 * 50ms = 2 secondi di suspense)
    
    // Suono finto/effetto mentale di caricamento
    const interval = setInterval(() => {
      // Sceglie una parola a caso velocemente
      const randomTemp = options[Math.floor(Math.random() * options.length)]
      setCurrentText(randomTemp)
      ticks++

      if (ticks >= maxTicks) {
        clearInterval(interval)
        // Scelta finale
        const finalWinner = options[Math.floor(Math.random() * options.length)]
        setResult(finalWinner)
        setCurrentText(finalWinner)
        setIsSpinning(false)
      }
    }, 50) // Cambia ogni 50 millisecondi
  }

  return (
    <div className="max-w-4xl mx-auto px-4 w-full pb-12">
      
      {/* Intestazione */}
      <header className="mb-8 mt-4 text-center md:text-left">
        <h1 className="text-3xl font-extrabold text-[var(--brand-text)] tracking-tight">Il Destino</h1>
        <p className="text-sm text-gray-500 mt-1">Quando nessuno dei due vuole prendere una decisione.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* COLONNA SINISTRA: L'animazione / Risultato */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col items-center justify-center min-h-[350px] relative overflow-hidden">
          
          {/* Sfondo decorativo sfumato */}
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--rose-light)]/10 to-transparent pointer-events-none"></div>

          <div className="z-10 w-full flex flex-col items-center">
            {/* Display del testo */}
            <div className="h-32 flex items-center justify-center text-center w-full px-4 mb-6">
              <span 
                className={`transition-all duration-300 ${
                  result 
                    ? 'text-4xl sm:text-5xl font-extrabold text-[var(--rose-dark)] scale-110 drop-shadow-md' // Stile del vincitore
                    : isSpinning 
                      ? 'text-3xl font-bold text-gray-400 blur-[1px] scale-95' // Stile mentre gira (leggermente sfocato)
                      : 'text-2xl font-semibold text-gray-500' // Stile di riposo
                }`}
              >
                {currentText}
              </span>
            </div>

            <button 
              onClick={handleSpin}
              disabled={isSpinning || options.length < 2}
              className={`w-full max-w-[250px] font-bold py-4 rounded-2xl transition-all shadow-md active:scale-95 ${
                options.length < 2 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                  : 'bg-[var(--rose-dark)] text-white hover:bg-[var(--rose-gold)] hover:shadow-lg hover:-translate-y-0.5'
              }`}
            >
              {isSpinning ? 'Estrazione...' : 'Tira la leva!'}
            </button>
            
            {options.length > 0 && options.length < 2 && (
              <p className="text-xs text-orange-400 mt-4 font-medium">Aggiungi almeno 2 opzioni per estrarre</p>
            )}
          </div>
        </div>


        {/* COLONNA DESTRA: Inserimento Dati */}
        <div className="flex flex-col gap-6">
          
          <form onSubmit={handleAddOption} className="bg-white p-2 rounded-2xl shadow-sm border border-[var(--rose-light)] flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Es. Sushi, Guardare un film, ecc." 
              className="flex-1 bg-transparent px-4 py-2 text-sm focus:outline-none"
            />
            <button 
              type="submit" 
              disabled={!input.trim()}
              className="bg-[var(--brand-bg)] text-[var(--rose-dark)] px-4 py-2 rounded-xl font-bold hover:bg-[var(--rose-light)] transition-colors disabled:opacity-50"
            >
              +
            </button>
          </form>

          {/* Lista delle opzioni inserite */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex-1 max-h-[300px] overflow-y-auto">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Opzioni in gara ({options.length})</h3>
            
            {options.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-gray-400 pb-8">
                Nessuna opzione inserita.
              </div>
            ) : (
              <ul className="flex flex-col gap-2">
                {options.map((opt, i) => (
                  <li 
                    key={i} 
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      result === opt ? 'bg-[var(--rose-light)]/30 text-[var(--rose-dark)] border border-[var(--rose-light)]' : 'bg-gray-50 text-gray-700'
                    }`}
                  >
                    <span className="truncate pr-4">{opt}</span>
                    <button 
                      onClick={() => handleRemove(opt)}
                      className="text-gray-400 hover:text-red-500 transition-colors w-6 h-6 flex items-center justify-center shrink-0 rounded-md hover:bg-red-50"
                      title="Rimuovi"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Tasto per pulire tutto velocemente */}
          {options.length > 0 && (
            <button 
              onClick={() => { setOptions([]); setResult(null); setCurrentText('Inserisci le opzioni'); }}
              className="text-xs font-bold text-gray-400 hover:text-gray-600 self-end transition-colors uppercase tracking-wider"
            >
              Svuota lista
            </button>
          )}

        </div>
      </div>
    </div>
  )
}