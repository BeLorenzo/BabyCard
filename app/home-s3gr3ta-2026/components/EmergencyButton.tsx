'use client';
import { useState } from 'react';
import { sendEmergencyAlert } from '../../actions/notify'; 

export default function EmergencyButton() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  const handleEmergency = async () => {
    if (status !== 'idle') return;
    setStatus('sending');

    const result = await sendEmergencyAlert();

    if (result.success) {
      setStatus('sent');
      setTimeout(() => setStatus('idle'), 5000);
    } else {
      setStatus('idle');
      alert("Ops, c'è stato un problema di connessione. Forse è meglio chiamarlo!");
    }
  };

  return (
    <button
      onClick={handleEmergency}
      disabled={status !== 'idle'}
      className={`relative w-full max-w-[260px] mx-auto overflow-hidden rounded-full py-3.5 px-6 font-bold text-sm tracking-wider transition-all duration-300 flex items-center justify-center gap-3 ${
        status === 'idle'
          ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.35)] hover:shadow-[0_0_30px_rgba(239,68,68,0.55)] hover:-translate-y-1 active:scale-95'
          : status === 'sending'
          ? 'bg-orange-400 text-white shadow-md scale-95'
          : 'bg-green-500 text-white shadow-md scale-100'
      }`}
    >
      <span className="relative z-10 text-lg">
        {status === 'idle' ? '🚨' : status === 'sending' ? '⏳' : '✅'}
      </span>
      <span className="relative z-10 uppercase mt-0.5">
        {status === 'idle' 
          ? 'Emergenza Assistenza' 
          : status === 'sending' 
          ? 'Inoltro...' 
          : 'Inviata!'}
      </span>
    </button>
  );
}