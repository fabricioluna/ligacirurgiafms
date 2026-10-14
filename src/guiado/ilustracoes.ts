// Ilustrações dos casos no modo guiado (geradas no Nano Banana, prompts em docs/Prompts-Nano-Banana_casos-simulador.txt).
// O abdome do paciente aparece na admissão; as de mecanismo só no resultado, para não entregar o diagnóstico antes.
// Arquivos em public/imagens/casos/<id em minúsculas>/. Ficam fora do JSON do caso para não mudar a versão dele.

export interface Ilustracao {
  arquivo: string
  legenda: string
  alt: string
  // Passo em que aparece, ou 'resultado' (tela final).
  onde: string
  // Só no resultado: depende do caminho percorrido.
  quando?: (caminho: string[]) => boolean
}

const passouPorGravidade = (caminho: string[]) => caminho.includes('M3-ALT') || caminho.includes('M4-ALT')
const chegouNaCirurgia = (caminho: string[]) => caminho.includes('M4') || caminho.includes('M4-ALT')

const ILUSTRACOES: Record<string, Ilustracao[]> = {
  'CASO-001': [
    {
      arquivo: 'ilustracao-001-a.jpg',
      onde: 'M1',
      legenda: 'Inspeção do abdome: distendido, com cicatriz mediana.',
      alt: 'Ilustração do abdome de um paciente idoso, distendido, com cicatriz de laparotomia na linha mediana.',
    },
    {
      arquivo: 'ilustracao-001-b.jpg',
      onde: 'resultado',
      legenda: 'Obstrução do delgado por brida: alça proximal dilatada e alça distal colapsada.',
      alt: 'Ilustração de uma brida comprimindo o intestino delgado, com a alça antes da brida dilatada e cheia de líquido e a alça depois dela colapsada.',
    },
    {
      arquivo: 'ilustracao-001-c.jpg',
      onde: 'resultado',
      quando: chegouNaCirurgia,
      legenda: 'Brida estrangulando a base de uma alça e seu mesentério: alça isquêmica.',
      alt: 'Ilustração de uma brida apertando a base de uma alça de delgado e seu mesentério, com a alça escura e inchada.',
    },
  ],
  'CASO-002': [
    {
      arquivo: 'ilustracao-002-a.jpg',
      onde: 'M1',
      legenda: 'Inspeção do abdome: muito distendido e assimétrico, sem cicatrizes.',
      alt: 'Ilustração do abdome de um paciente idoso, muito distendido e assimétrico, sem cicatrizes.',
    },
    {
      arquivo: 'ilustracao-002-b.jpg',
      onde: 'resultado',
      legenda: 'Volvo de sigmoide: alça dilatada e torção do mesossigmoide.',
      alt: 'Ilustração do sigmoide muito dilatado, com a base torcida sobre o próprio mesentério na pelve.',
    },
    {
      arquivo: 'ilustracao-002-c.jpg',
      onde: 'resultado',
      quando: passouPorGravidade,
      legenda: 'Volvo de sigmoide com isquemia: segmento escuro, com áreas necróticas.',
      alt: 'Ilustração do sigmoide torcido, com a parede roxa e áreas enegrecidas por isquemia.',
    },
  ],
  'CASO-003': [
    {
      arquivo: 'ilustracao-003-a.jpg',
      onde: 'M1',
      legenda: 'Inspeção do abdome: distendido, com cicatriz de Pfannenstiel.',
      alt: 'Ilustração do abdome de uma paciente, distendido, com cicatriz de Pfannenstiel acima do púbis.',
    },
    {
      arquivo: 'ilustracao-003-b.jpg',
      onde: 'resultado',
      legenda: 'Tumor estenosante do sigmoide, com o cólon acima dele distendido.',
      alt: 'Ilustração do intestino grosso com um tumor que estreita o sigmoide e o cólon antes dele muito dilatado.',
    },
    {
      arquivo: 'ilustracao-003-c.jpg',
      onde: 'resultado',
      legenda: 'Ceco distendido, com a válvula ileocecal fechada: o cólon funciona como alça fechada.',
      alt: 'Ilustração do ceco muito distendido, com uma janela mostrando a válvula ileocecal fechada.',
    },
    {
      arquivo: 'ilustracao-003-d.jpg',
      onde: 'resultado',
      quando: (caminho) => caminho.includes('M3-ALT'),
      legenda: 'Perfuração do ceco.',
      alt: 'Ilustração do ceco distendido com uma perfuração e saída de conteúdo.',
    },
  ],
}

export const pastaDeIlustracoes = (casoId: string) => `/imagens/casos/${casoId.toLowerCase()}/`

export function todasAsIlustracoes(casoId: string): Ilustracao[] {
  return ILUSTRACOES[casoId] ?? []
}

export function ilustracoesDoPasso(casoId: string, passo: string): Ilustracao[] {
  return todasAsIlustracoes(casoId).filter((i) => i.onde === passo)
}

export function ilustracoesDoResultado(casoId: string, caminho: string[]): Ilustracao[] {
  return todasAsIlustracoes(casoId).filter((i) => i.onde === 'resultado' && (i.quando?.(caminho) ?? true))
}
