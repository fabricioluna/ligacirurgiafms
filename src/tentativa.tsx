// Tentativa em andamento, compartilhada pelas telas do caso e salva no aparelho.

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { apagar, gravar, ler } from './armazenamento'
import { sincronizar } from './nuvem'
import {
  definirConduta,
  novaTentativa,
  registrarNaoPrevista,
  registrarSemCorrespondencia,
  revelar,
  revelarPedido,
  seguir,
} from './motor/tentativa'
import type { Caso, ComentarioPreceptor, ModoSimulador, Tentativa, TipoDescoberta } from './motor/tipos'

const chave = (casoId: string) => `simulador:tentativa:${casoId}`

export function tentativaSalva(caso: Caso): Tentativa | null {
  const t = ler<Tentativa>(chave(caso.id))
  // Tentativa de outra versão do caso pode não bater com o arquivo atual: descarta.
  if (!t || t.versaoCaso !== caso.versao) return null
  // Tentativas salvas antes dos dois simuladores existirem.
  return { ...t, modo: t.modo ?? 'estatico', naoPrevistas: t.naoPrevistas ?? [] }
}

interface ValorContexto {
  caso: Caso
  tentativa: Tentativa | null
  iniciar: (nome: string, modo: ModoSimulador) => void
  descartar: () => void
  revelar: (tipo: TipoDescoberta, id: string) => void
  revelarPedido: (pedido: string, itens: { tipo: TipoDescoberta; id: string }[]) => void
  semCorrespondencia: (tipo: TipoDescoberta, pedido: string, respostaPadrao: string) => void
  naoPrevista: (texto: string) => void
  definirConduta: (selecionados: string[], textoDoAluno?: string) => void
  seguir: () => void
  salvarComentario: (c: ComentarioPreceptor) => void
}

const Contexto = createContext<ValorContexto | null>(null)

export function ProvedorTentativa({ caso, children }: { caso: Caso; children: ReactNode }) {
  const [tentativa, setTentativa] = useState<Tentativa | null>(() => tentativaSalva(caso))

  useEffect(() => {
    if (tentativa) gravar(chave(caso.id), tentativa)
  }, [caso.id, tentativa])

  // Nuvem: grava quando a tentativa começa, a cada conduta, no fim e a cada não prevista.
  // Pedidos ao paciente não disparam gravação.
  const enviadas = useRef<{ id: string; naoPrevistas: number; marca: string } | null>(null)
  useEffect(() => {
    if (!tentativa) return
    const marca = `${tentativa.passos.length}|${tentativa.desfecho ?? ''}|${tentativa.naoPrevistas.length}`
    const atual = enviadas.current?.id === tentativa.id ? enviadas.current : { id: tentativa.id, naoPrevistas: 0, marca: '' }
    if (atual.marca === marca) return
    const t = tentativa
    const espera = setTimeout(() => {
      enviadas.current = { ...atual, marca }
      sincronizar(caso, t, atual.naoPrevistas).then((n) => {
        if (enviadas.current?.id === t.id) enviadas.current = { ...enviadas.current, naoPrevistas: n }
      })
    }, 800)
    return () => clearTimeout(espera)
  }, [caso, tentativa])

  const atualizar = useCallback((f: (t: Tentativa) => Tentativa) => setTentativa((t) => (t ? f(t) : t)), [])

  const valor: ValorContexto = {
    caso,
    tentativa,
    iniciar: (nome, modo) => setTentativa(novaTentativa(caso, nome, modo)),
    descartar: () => {
      apagar(chave(caso.id))
      setTentativa(null)
    },
    revelar: (tipo, id) => atualizar((t) => revelar(caso, t, tipo, id)),
    revelarPedido: (pedido, itens) => atualizar((t) => revelarPedido(caso, t, pedido, itens)),
    semCorrespondencia: (tipo, pedido, rp) => atualizar((t) => registrarSemCorrespondencia(t, tipo, pedido, rp)),
    naoPrevista: (texto) => atualizar((t) => registrarNaoPrevista(t, texto)),
    definirConduta: (sel, texto) => atualizar((t) => definirConduta(caso, t, sel, Date.now(), texto)),
    seguir: () => atualizar((t) => seguir(t)),
    salvarComentario: (c) => atualizar((t) => ({ ...t, comentario: c })),
  }
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}

export function useTentativa() {
  const v = useContext(Contexto)
  if (!v) throw new Error('useTentativa fora do ProvedorTentativa')
  return v
}
