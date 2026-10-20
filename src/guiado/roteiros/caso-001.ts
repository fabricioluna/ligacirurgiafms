// Roteiro guiado do caso 001 (obstrução de delgado por bridas).
// Só aponta itens da folha resposta; as consequências e os destinos vêm das regras do caso.
// Alternativas de preparo (suporte, exames, reconhecer) não encerram o passo: só a decisão avança.

import type { Roteiro } from '../tipos'

const LAB = ['EX-01', 'EX-02', 'EX-03', 'EX-04', 'EX-05', 'EX-06']

export const roteiro001: Roteiro = {
  casoId: 'CASO-001',
  versaoCaso: '', // preenchido por roteiroDoCaso(): acompanha a versão do arquivo do caso
  passos: [
    {
      momento: 'M1',
      opcoes: [
        { item: 'Dar alta ou tratar como gastroenterite sem investigar a obstrução.', vai: 'M3-ALT', marcaDesfecho: 'D4' },
        { item: 'Jejum, sonda nasogástrica aberta para descompressão, acesso venoso e hidratação com cristaloide.' },
        { item: 'Solicitar contraste oral e atrasar a tomografia.', vai: 'M2', revela: ['EX-12'] },
        { item: 'Exames: hemograma, eletrólitos, função renal, gasometria, lactato e amilase ou lipase.', revela: LAB },
        { item: 'Prescrever laxante ou procinético diante de obstrução mecânica.' },
        { item: 'Radiografias de abdome e tórax e tomografia de abdome com contraste venoso.', vai: 'M2', revela: ['EX-12', 'EX-13'] },
      ],
    },
    {
      momento: 'M2',
      opcoes: [
        { item: 'Indicar cirurgia imediata sem sinais de sofrimento.', vai: 'D2' },
        { item: 'Indicar tratamento conservador, pela ausência de peritonite e de sinais tomográficos de sofrimento.' },
        { item: 'Dar alta.', vai: 'M3-ALT', marcaDesfecho: 'D4' },
        { item: 'Administrar contraste hidrossolúvel pela sonda e fazer radiografia de controle em até 24 horas.', vai: 'M3' },
        { item: 'Manter o tratamento conservador sem prazo definido ou sem reavaliação programada.', vai: 'M3' },
        { item: 'Tratamento conservador com reavaliação seriada e prazo definido, sem contraste hidrossolúvel.', vai: 'M3' },
      ],
    },
    {
      momento: 'M3',
      resultados: [
        { id: 'EX-01' },
        { id: 'EX-05' },
        { id: 'EX-08' },
        { id: 'EX-14', seEscolheu: 'Administrar contraste hidrossolúvel pela sonda e fazer radiografia de controle em até 24 horas.' },
      ],
      opcoes: [
        { item: 'Manter o tratamento conservador até completar 72 horas apesar dos sinais de sofrimento.', vai: 'M3-ALT' },
        { item: 'Indicar cirurgia de urgência, sem esperar completar 72 horas.', vai: 'M4' },
        { item: 'Repetir a tomografia ou aguardar novos exames, atrasando a cirurgia.', vai: 'M4', revela: ['EX-13'] },
        { item: 'Dar alta.', vai: 'M3-ALT', marcaDesfecho: 'D4' },
        {
          item: 'Reconhecer a falha do tratamento conservador e os sinais de sofrimento de alça: dor contínua, febre, taquicardia, defesa, leucocitose com desvio, lactato em elevação e contraste que não chegou ao cólon.',
        },
        { item: 'Laparoscopia diagnóstica com conversão precoce se a visão ou a segurança forem prejudicadas.', vai: 'M4' },
      ],
    },
    {
      momento: 'M3-ALT',
      resultados: [{ id: 'EX-01' }, { id: 'EX-03' }, { id: 'EX-05' }],
      opcoes: [
        { item: 'Solicitar tomografia antes da cirurgia em paciente instável.', vai: 'M4-ALT' },
        { item: 'Ressuscitação volêmica imediata, antibiótico de amplo espectro e monitorização.' },
        { item: 'Manter tratamento clínico sem indicar cirurgia.', vai: 'M4-ALT' },
        { item: 'Cirurgia de urgência, sem atrasar com novos exames.', vai: 'M4-ALT' },
        { item: 'Iniciar vasopressor se a hipotensão persistir após a reposição volêmica inicial.' },
        { item: 'Antecipar a possibilidade de controle de danos e a necessidade de UTI.' },
      ],
    },
    {
      momento: 'M4',
      opcoes: [
        { item: 'Optar por controle de danos em paciente estável.', vai: 'M5' },
        { item: 'Fazer a pausa antes do passo irreversível: aquecer a alça com compressas mornas e reavaliar após 10 a 15 minutos.' },
        { item: 'Manter o segmento inviável sem ressecar.', vai: 'D3' },
        { item: 'Ressecar o segmento inviável com margens viáveis e fazer anastomose primária, já que o paciente está estável e sem contaminação extensa.', vai: 'M5' },
        { item: 'Liberar todas as aderências da cavidade.', vai: 'M5' },
        { item: 'Deixar o segmento e programar reoperação para reavaliar a viabilidade, sem ressecar agora.', vai: 'M5' },
      ],
    },
    {
      momento: 'M4-ALT',
      opcoes: [
        { item: 'Fazer anastomose primária em paciente em choque com acidose grave.', vai: 'D5', prevalece: true },
        { item: 'Cirurgia abreviada: ressecar o segmento necrótico, controlar a contaminação, deixar as alças em descontinuidade e fazer fechamento temporário do abdome.', vai: 'D3' },
        { item: 'Prolongar a cirurgia para resolver tudo em um só tempo.', vai: 'D3' },
        { item: 'Levar o paciente à UTI para estabilização e programar a reoperação em 24 a 48 horas.' },
        { item: 'Exteriorizar as extremidades em estoma, conforme a experiência da equipe.', vai: 'D3' },
        { item: 'Reconhecer a tríade letal: hipotermia, acidose e coagulopatia.' },
      ],
    },
    {
      momento: 'M5',
      opcoes: [
        { item: 'Ignorar sinais de deiscência de anastomose.' },
        { item: 'Manter a sonda até a melhora do débito e dos sinais de trânsito, e então realimentar de forma progressiva.', vai: 'D1' },
        { item: 'Manter jejum prolongado sem motivo.', vai: 'D1' },
        { item: 'Vigiar sinais de fístula e deiscência: febre, taquicardia, dor desproporcional ou saída de conteúdo entérico.' },
        { item: 'Não prescrever profilaxia de tromboembolismo.', vai: 'D1' },
        { item: 'Retirar a sonda mais cedo se o paciente não tiver náuseas nem distensão.', vai: 'D1' },
      ],
    },
  ],
}
