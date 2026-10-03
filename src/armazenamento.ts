// Acesso ao localStorage que nunca quebra o app (aba anônima, armazenamento bloqueado).

export function ler<T>(chave: string): T | null {
  try {
    const v = localStorage.getItem(chave)
    return v === null ? null : (JSON.parse(v) as T)
  } catch {
    return null
  }
}

export function gravar(chave: string, valor: unknown) {
  try {
    localStorage.setItem(chave, JSON.stringify(valor))
  } catch {
    // Sem armazenamento, o caso continua funcionando, só não sobrevive a um recarregamento.
  }
}

export function apagar(chave: string) {
  try {
    localStorage.removeItem(chave)
  } catch {
    // idem
  }
}
