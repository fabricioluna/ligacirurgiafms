// Roteiro guiado do caso 003 (obstrução do cólon esquerdo por neoplasia).
// Só aponta itens da folha resposta; as consequências e os destinos vêm das regras do caso.

import type { Roteiro } from '../tipos'

export const roteiro003: Roteiro = {
  casoId: 'CASO-003',
  versaoCaso: '', // preenchido por roteiroDoCaso(): acompanha a versão do arquivo do caso
  passos: [
    {
      momento: 'M1',
      opcoes: [
        { item: 'Dar alta, ou prescrever laxante, sem investigar a obstrução.', vai: 'M3-ALT', marcaDesfecho: 'D4' },
        { item: 'Jejum, acesso venoso, hidratação com cristaloide, analgesia e antiemético.' },
        { item: 'Pedir enema opaco com bário.', vai: 'M2' },
        { item: 'Prescrever preparo intestinal por via oral para colonoscopia.', vai: 'M3-ALT' },
        { item: 'Radiografias de abdome e tórax e tomografia de abdome e pelve com contraste venoso.', vai: 'M2' },
        { item: 'Sonda nasogástrica para descompressão gástrica, se houver vômitos persistentes.' },
      ],
    },
    {
      momento: 'M2',
      opcoes: [
        { item: 'Indicar stent colônico como ponte para a cirurgia, apesar da dor na fossa ilíaca direita.', vai: 'D2' },
        { item: 'Ressuscitação volêmica, antibiótico profilático e reserva de sangue.' },
        { item: 'Manter tratamento clínico, aguardando a resolução espontânea da obstrução.', vai: 'M3-ALT' },
        { item: 'Indicar cirurgia de urgência, pelo risco de perfuração do ceco em obstrução em alça fechada com dor na fossa ilíaca direita.', vai: 'M3' },
        { item: 'Fazer apenas colostomia em alça, sem ressecar o tumor, em paciente com condição de ressecção.', vai: 'D5' },
        { item: 'Dar alta.', vai: 'M3-ALT', marcaDesfecho: 'D4' },
      ],
    },
    {
      momento: 'M3',
      opcoes: [
        { item: 'Fazer colectomia subtotal sem indicação, com o ceco viável.', vai: 'M4' },
        { item: 'Inspecionar a cavidade, o fígado e o peritônio, e avaliar a viabilidade do ceco.' },
        { item: 'Fazer apenas colostomia em alça, deixando o tumor, numa paciente estável com tumor ressecável.', vai: 'D5' },
        { item: 'Sigmoidectomia oncológica, com ligadura vascular na origem, margens livres e linfadenectomia adequada.', vai: 'M4' },
        { item: 'Ressecar o tumor sem princípios oncológicos, sem linfadenectomia.', vai: 'M4' },
        { item: 'Fazer cirurgia de Hartmann, considerando a distensão do cólon e o diabetes.', vai: 'M4' },
      ],
    },
    {
      momento: 'M3-ALT',
      opcoes: [
        { item: 'Fazer anastomose primária em paciente em choque com peritonite fecal.', vai: 'D3' },
        { item: 'Ressuscitação, antibiótico de amplo espectro e vasopressor se necessário.' },
        { item: 'Fazer apenas a sutura do ceco e uma colostomia, deixando o tumor.', vai: 'D3' },
        { item: 'Colectomia subtotal com ileostomia terminal, ressecando o ceco perfurado e o tumor.', vai: 'D3' },
        { item: 'Cirurgia de controle de danos com fechamento temporário do abdome, se a paciente estiver instável.', vai: 'D3' },
        { item: 'Lavar a cavidade e levar a paciente à UTI, considerando cirurgia abreviada se houver hipotermia, acidose e coagulopatia.' },
      ],
    },
    {
      momento: 'M4',
      opcoes: [
        { item: 'Dar alta sem encaminhar à oncologia.', vai: 'D6' },
        { item: 'Programar colonoscopia completa do cólon remanescente em até seis meses, para afastar lesões sincrônicas.' },
        { item: 'Não prescrever profilaxia de tromboembolismo.', vai: 'D1' },
        { item: 'Encaminhar à oncologia e discutir o caso em reunião multidisciplinar, com o anatomopatológico e o estadiamento.', vai: 'D1' },
        { item: 'Completar o estadiamento com tomografia de tórax, se ainda não feita.' },
        { item: 'Manter jejum prolongado sem motivo.', vai: 'D1' },
      ],
    },
  ],
}
