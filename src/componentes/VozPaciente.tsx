// Voz do paciente: lê em voz alta as falas do paciente com a leitura de texto do próprio navegador.
// Opcional, desligada por padrão, lembrada no aparelho. Não usa internet nem IA.
// Só lê o que o aluno acabou de perguntar; exames e laudos não são lidos.

import { useEffect, useRef, useState } from 'react'
import { gravar, ler } from '../armazenamento'
import type { Descoberta, Fala } from '../motor/tipos'

const CHAVE = 'simulador:voz'
const suportado = () => typeof window !== 'undefined' && 'speechSynthesis' in window

function vozPortugues(): SpeechSynthesisVoice | undefined {
  const vozes = window.speechSynthesis.getVoices()
  return vozes.find((v) => v.lang === 'pt-BR') ?? vozes.find((v) => v.lang.startsWith('pt'))
}

export function useVozPaciente(descobertas: Descoberta[], conversa: Fala[] = []) {
  const [ligada, setLigada] = useState(() => suportado() && ler<boolean>(CHAVE) === true)
  const vistas = useRef({ d: descobertas.length, c: conversa.length })

  useEffect(() => {
    const novasD = descobertas.slice(vistas.current.d)
    const novasC = conversa.slice(vistas.current.c)
    vistas.current = { d: descobertas.length, c: conversa.length }
    if (!ligada || !suportado()) return
    // Fala da conversa (simulador com IA) ou resposta do caso (lista); laudos não são lidos.
    const falas = [...novasC.map((f) => f.paciente), ...novasD.filter((d) => d.tipo === 'anamnese' && !d.viaConversa).map((d) => d.texto)]
    if (!falas.length) return
    const s = window.speechSynthesis
    s.cancel()
    const u = new SpeechSynthesisUtterance(falas.join(' '))
    u.lang = 'pt-BR'
    const v = vozPortugues()
    if (v) u.voice = v
    u.rate = 0.95
    s.speak(u)
  }, [descobertas, conversa, ligada])

  useEffect(() => () => {
    if (suportado()) window.speechSynthesis.cancel()
  }, [])

  const alternar = () => {
    const nova = !ligada
    setLigada(nova)
    gravar(CHAVE, nova)
    if (!nova && suportado()) window.speechSynthesis.cancel()
  }

  return { suportado: suportado(), ligada, alternar }
}

export function BotaoVoz({ ligada, alternar }: { ligada: boolean; alternar: () => void }) {
  return (
    <button
      type="button"
      onClick={alternar}
      aria-pressed={ligada}
      aria-label={ligada ? 'Desligar a voz do paciente' : 'Ligar a voz do paciente'}
      title={ligada ? 'Voz do paciente ligada' : 'Voz do paciente desligada'}
      className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border ${
        ligada ? 'border-verde text-verde-texto' : 'border-borda text-texto-2 hover:border-texto-2'
      }`}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M4 9v6h4l5 4V5L8 9z" />
        {ligada ? <path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11" /> : <path d="M17 9l5 6M22 9l-5 6" />}
      </svg>
    </button>
  )
}
