// Roteiro guiado do caso 002 (volvo de sigmoide).
// Só aponta itens da folha resposta; as consequências e os destinos vêm das regras do caso.

import type { Roteiro } from '../tipos'

export const roteiro002: Roteiro = {
  casoId: 'CASO-002',
  versaoCaso: '', // preenchido por roteiroDoCaso(): acompanha a versão do arquivo do caso
  passos: [
    {
      momento: 'M1',
      opcoes: [
        { item: 'Dar alta, ou tratar como constipação com laxante ou lavagem intestinal, sem investigar a obstrução.', vai: 'M3-ALT', marcaDesfecho: 'D4' },
        { item: 'Jejum, acesso venoso, hidratação com cristaloide, analgesia e antiemético.' },
        { item: 'Pedir enema opaco com bário para confirmar o diagnóstico.', vai: 'M2' },
        { item: 'Prescrever neostigmina ou procinético diante de obstrução mecânica.', vai: 'M3-ALT' },
        { item: 'Radiografias de abdome e tórax e tomografia de abdome com contraste venoso.', vai: 'M2' },
        { item: 'Sonda nasogástrica para descompressão gástrica, se houver vômitos persistentes.' },
      ],
    },
    {
      momento: 'M2',
      opcoes: [
        { item: 'Indicar cirurgia de urgência sem sinais de isquemia, sem tentar a descompressão endoscópica.', vai: 'D5' },
        { item: 'Realizar retossigmoidoscopia flexível para desfazer a torção e avaliar a viabilidade da mucosa.' },
        { item: 'Não deixar sonda retal após a descompressão.', vai: 'M3' },
        { item: 'Deixar sonda retal para manter a descompressão e reduzir a recidiva precoce.', vai: 'M3' },
        { item: 'Prescrever neostigmina ou fazer lavagem intestinal para desfazer o volvo.', vai: 'M3-ALT' },
        { item: 'Dar alta.', vai: 'M3-ALT', marcaDesfecho: 'D4' },
      ],
    },
    {
      momento: 'M3',
      opcoes: [
        { item: 'Dar alta após a descompressão, sem programar a cirurgia definitiva.', vai: 'D2' },
        { item: 'Manter a sonda retal, realimentar de forma progressiva e otimizar as condições clínicas antes da cirurgia.' },
        { item: 'Indicar sigmoidectomia na mesma internação, pelo alto risco de recidiva após a descompressão isolada.', vai: 'M4' },
        { item: 'Programar a cirurgia só depois de uma nova recidiva.', vai: 'D2' },
        { item: 'Colonoscopia do restante do cólon antes da cirurgia, para afastar outras lesões.' },
        { item: 'Avaliação clínica e anestésica do risco cirúrgico e discussão da cirurgia com o paciente e a família.' },
      ],
    },
    {
      momento: 'M3-ALT',
      opcoes: [
        { item: 'Manter tratamento clínico sem indicar cirurgia.', vai: 'M4-ALT' },
        { item: 'Ressuscitação volêmica imediata, antibiótico de amplo espectro e monitorização.' },
        { item: 'Tentar a descompressão endoscópica em paciente com peritonite.', vai: 'M4-ALT' },
        { item: 'Cirurgia de urgência, sem tentativa de descompressão endoscópica.', vai: 'M4-ALT' },
        { item: 'Iniciar vasopressor se a hipotensão persistir após a reposição volêmica inicial.' },
        { item: 'Antecipar a ressecção do sigmoide com colostomia terminal (cirurgia de Hartmann) e a necessidade de UTI.' },
      ],
    },
    {
      momento: 'M4',
      opcoes: [
        { item: 'Fazer apenas a detorção ou a fixação do sigmoide (sigmoidopexia), sem ressecar.', vai: 'D2' },
        { item: 'Sigmoidectomia com ressecção de todo o segmento redundante.' },
        { item: 'Fazer colostomia terminal (cirurgia de Hartmann) em paciente estável e sem contaminação.', vai: 'D5' },
        { item: 'Anastomose primária colorretal, já que o paciente está estável, preparado e sem contaminação.', vai: 'D1' },
        { item: 'Via laparoscópica, conforme a experiência da equipe.' },
        { item: 'Não prescrever profilaxia de tromboembolismo.', vai: 'D1' },
      ],
    },
    {
      momento: 'M4-ALT',
      opcoes: [
        { item: 'Fazer anastomose primária em paciente em choque com contaminação fecal.', vai: 'D3' },
        { item: 'Ressecar todo o sigmoide necrótico, controlar a contaminação e lavar a cavidade.' },
        { item: 'Prolongar a cirurgia com ressecções ampliadas desnecessárias.', vai: 'D3' },
        { item: 'Fazer colostomia terminal com fechamento do coto retal (cirurgia de Hartmann), sem anastomose.', vai: 'D3' },
        { item: 'Fazer apenas a detorção, sem ressecar o segmento necrótico.', vai: 'D3' },
        { item: 'Cirurgia abreviada com fechamento temporário do abdome, se houver hipotermia, acidose e coagulopatia.', vai: 'D3' },
      ],
    },
  ],
}
