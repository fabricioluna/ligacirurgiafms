// Tentativa em andamento, compartilhada pelas telas do caso e salva no aparelho.

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { apagar, gravar, ler } from './armazenamento'
import { definirConduta, novaTentativa, revelar, seguir } from './motor/tentativa'
import type { Caso, Tentativa, TipoDescoberta } from './motor/tipos'

const chave = (casoId: string) => `simulador:tentativa:${casoId}`

export function tentativaSalva(caso: Caso): Tentativa | null {
  const t = ler<Tentativa>(chave(caso.id))
  // Tentativa de outra versão do caso pode não bater com o arquivo atual: descarta.
  return t && t.versaoCaso === caso.versao ? t : null
}

interface ValorContexto {
  caso: Caso
  tentativa: Tentativa | null
  iniciar: (nome: string) => void
  descartar: () => void
  revelar: (tipo: TipoDescoberta, id: string) => void
  definirConduta: (selecionados: string[]) => void
  seguir: () => void
}

const Contexto = createContext<ValorContexto | null>(null)

export function ProvedorTentativa({ caso, children }: { caso: Caso; children: ReactNode }) {
  const [tentativa, setTentativa] = useState<Tentativa | null>(() => tentativaSalva(caso))

  useEffect(() => {
    if (tentativa) gravar(chave(caso.id), tentativa)
  }, [caso.id, tentativa])

  const atualizar = useCallback((f: (t: Tentativa) => Tentativa) => setTentativa((t) => (t ? f(t) : t)), [])

  const valor: ValorContexto = {
    caso,
    tentativa,
    iniciar: (nome) => setTentativa(novaTentativa(caso, nome)),
    descartar: () => {
      apagar(chave(caso.id))
      setTentativa(null)
    },
    revelar: (tipo, id) => atualizar((t) => revelar(caso, t, tipo, id)),
    definirConduta: (sel) => atualizar((t) => definirConduta(caso, t, sel)),
    seguir: () => atualizar((t) => seguir(t)),
  }
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}

export function useTentativa() {
  const v = useContext(Contexto)
  if (!v) throw new Error('useTentativa fora do ProvedorTentativa')
  return v
}
