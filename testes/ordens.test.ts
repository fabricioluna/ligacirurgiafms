// Ordens do simulador com IA: acontecem na hora, mudam o quadro e só são avaliadas ao concluir o momento.
import { describe, expect, it } from 'vitest'
import bruto from '../casos/caso-001.json'
import type { Caso } from '../src/motor/tipos'
import { efeitosDe, momentoFolha, sinaisVitaisAtuais } from '../src/motor/caso'
import { concluirMomento, novaTentativa, ordenar, ordensDoMomento, registrarDiagnostico } from '../src/motor/tentativa'

const caso = bruto as unknown as Caso
const f = momentoFolha(caso, 'M1')
const analgesia = f.ideal[4]
const sonda = f.ideal[2]

describe('ordens no momento', () => {
  it('se acumulam sem repetir e não avaliam o momento', () => {
    let t = ordenar(novaTentativa(caso), [sonda], 'SNG')
    t = ordenar(t, [sonda, analgesia], 'dipirona')
    expect(ordensDoMomento(t)).toEqual([sonda, analgesia])
    expect(t.passos).toHaveLength(0)
  })

  it('mudam o quadro: a dor cai depois da analgesia', () => {
    const t = ordenar(novaTentativa(caso), [analgesia], 'dipirona')
    const efeitos = efeitosDe(caso, 'M1', ordensDoMomento(t))
    expect(efeitos[0].texto).toMatch(/dor cai para 3\/10/)
    expect(sinaisVitaisAtuais(caso, t.caminho, efeitos).find((s) => s.rotulo === 'Dor (0 a 10)')?.valor).toBe('3')
  })

  it('concluir o momento avalia o conjunto e limpa as ordens', () => {
    let t = ordenar(novaTentativa(caso), [sonda, analgesia], 'condutas')
    t = registrarDiagnostico(caso, t, caso.folhaResposta.diagnostico!.correto, 'brida')
    t = concluirMomento(caso, t)
    expect(t.passos[0].selecionados).toEqual([sonda, analgesia])
    expect(t.emAndamento).toBeUndefined()
    expect(t.aguardandoConfirmacao).toBe(true)
  })

  it('sem a hipótese, o primeiro momento não conclui', () => {
    const t = concluirMomento(caso, ordenar(novaTentativa(caso), [sonda], 'SNG'))
    expect(t.passos).toHaveLength(0)
  })
})
