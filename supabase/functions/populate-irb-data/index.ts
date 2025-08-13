import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const project_id = 'bedaf5d7-aa02-4d46-a692-e16a5acd5e01'

    console.log('Iniciando população de dados do projeto IRB(Re)')

    // Verificar se o projeto existe
    const { data: project } = await supabase
      .from('project_info')
      .select('id')
      .eq('id', project_id)
      .single()

    if (!project) {
      throw new Error('Projeto IRB(Re) não encontrado')
    }

    // Criar riscos identificados
    const risks = [
      {
        nome: 'Falha na Análise de Risco',
        categoria: 'Operacional',
        nivel_impacto: 'Alto',
        probabilidade: 'Média',
        processo_id: 'P-001-001',
        project_info_id: project_id,
        status: 'Identificado',
        codigo: 'R-001',
        causas: 'Falta de expertise técnica, pressão comercial',
        consequencias: 'Subscrição inadequada, prejuízos financeiros',
        area: 'Subscrição'
      },
      {
        nome: 'Fraude em Sinistros',
        categoria: 'Operacional',
        nivel_impacto: 'Alto',
        probabilidade: 'Média',
        processo_id: 'P-002-001',
        project_info_id: project_id,
        status: 'Identificado',
        codigo: 'R-002',
        causas: 'Controles inadequados, falta de investigação',
        consequencias: 'Pagamentos indevidos, perdas financeiras',
        area: 'Sinistros'
      },
      {
        nome: 'Falha em Sistemas de TI',
        categoria: 'Tecnológico',
        nivel_impacto: 'Alto',
        probabilidade: 'Baixa',
        processo_id: 'P-004-001',
        project_info_id: project_id,
        status: 'Identificado',
        codigo: 'R-003',
        causas: 'Obsolescência tecnológica, falta de manutenção',
        consequencias: 'Interrupção de operações, perda de dados',
        area: 'TI'
      },
      {
        nome: 'Concentração de Riscos',
        categoria: 'Estratégico',
        nivel_impacto: 'Médio',
        probabilidade: 'Média',
        processo_id: 'P-003-001',
        project_info_id: project_id,
        status: 'Identificado',
        codigo: 'R-004',
        causas: 'Falta de diversificação, limites inadequados',
        consequencias: 'Exposição excessiva, volatilidade de resultados',
        area: 'Resseguro'
      },
      {
        nome: 'Inadimplência',
        categoria: 'Crédito',
        nivel_impacto: 'Médio',
        probabilidade: 'Média',
        processo_id: 'P-004-001',
        project_info_id: project_id,
        status: 'Identificado',
        codigo: 'R-005',
        causas: 'Análise de crédito inadequada, crise econômica',
        consequencias: 'Redução de fluxo de caixa, provisões',
        area: 'Financeiro'
      }
    ]

    // Inserir riscos
    const { error: risksError } = await supabase
      .from('riscos')
      .upsert(risks, { onConflict: 'codigo' })

    if (risksError) {
      console.error('Erro ao inserir riscos:', risksError)
      throw risksError
    }

    // Criar controles/KRIs
    const controls = [
      {
        nome: 'Comitê de Subscrição',
        categoria: 'Operacional',
        descricao: 'Aprovação colegiada para riscos acima de limites estabelecidos',
        frequencia_medicao: 'Mensal',
        tipo_medicao: 'Qualitativo',
        processo_id: 'P-001-001',
        project_info_id: project_id,
        status: 'Ativo',
        codigo: 'C-001',
        responsavel: 'Gerente de Subscrição',
        validacao_etapa: 2
      },
      {
        nome: 'Sistema de Detecção de Fraudes',
        categoria: 'Tecnológico',
        descricao: 'Análise automatizada de padrões suspeitos em sinistros',
        frequencia_medicao: 'Diário',
        tipo_medicao: 'Quantitativo',
        processo_id: 'P-002-001',
        project_info_id: project_id,
        status: 'Ativo',
        codigo: 'C-002',
        responsavel: 'Analista de Sinistros',
        validacao_etapa: 3
      },
      {
        nome: 'Backup e Recuperação',
        categoria: 'Tecnológico',
        descricao: 'Rotinas automáticas de backup e testes de recuperação',
        frequencia_medicao: 'Diário',
        tipo_medicao: 'Quantitativo',
        processo_id: 'P-004-001',
        project_info_id: project_id,
        status: 'Ativo',
        codigo: 'C-003',
        responsavel: 'Coordenador de TI',
        validacao_etapa: 2
      },
      {
        nome: 'Limites de Retenção',
        categoria: 'Operacional',
        descricao: 'Definição e monitoramento de limites por tipo de risco',
        frequencia_medicao: 'Mensal',
        tipo_medicao: 'Quantitativo',
        processo_id: 'P-003-001',
        project_info_id: project_id,
        status: 'Ativo',
        codigo: 'C-004',
        responsavel: 'Gerente de Resseguro',
        validacao_etapa: 1
      },
      {
        nome: 'Análise de Crédito',
        categoria: 'Financeiro',
        descricao: 'Avaliação da capacidade de pagamento dos segurados',
        frequencia_medicao: 'Mensal',
        tipo_medicao: 'Qualitativo',
        processo_id: 'P-004-001',
        project_info_id: project_id,
        status: 'Ativo',
        codigo: 'C-005',
        responsavel: 'Analista Financeiro',
        validacao_etapa: 2
      }
    ]

    // Inserir controles
    const { error: controlsError } = await supabase
      .from('kris')
      .upsert(controls, { onConflict: 'codigo' })

    if (controlsError) {
      console.error('Erro ao inserir controles:', controlsError)
      throw controlsError
    }

    // Criar ações de melhoria
    const improvements = [
      {
        nome: 'Implementar IA na Análise de Riscos',
        descricao: 'Desenvolvimento de sistema de inteligência artificial para apoio à análise de propostas',
        status: 'Planejado',
        responsavel: 'Diretor de TI',
        project_info_id: project_id,
        validacao_etapa: 1,
        codigo: 'M-001'
      },
      {
        nome: 'Certificação ISO 27001',
        descricao: 'Obtenção de certificação de segurança da informação',
        status: 'Em Desenvolvimento',
        responsavel: 'CISO',
        project_info_id: project_id,
        validacao_etapa: 2,
        codigo: 'M-002'
      },
      {
        nome: 'Dashboard Executivo',
        descricao: 'Criação de painel executivo com métricas em tempo real',
        status: 'Implementado',
        responsavel: 'Gerente de BI',
        project_info_id: project_id,
        validacao_etapa: 3,
        codigo: 'M-003'
      }
    ]

    // Inserir melhorias
    const { error: improvementsError } = await supabase
      .from('melhorias')
      .upsert(improvements, { onConflict: 'codigo' })

    if (improvementsError) {
      console.error('Erro ao inserir melhorias:', improvementsError)
      throw improvementsError
    }

    // Criar dados de planilhas
    const spreadsheets = [
      {
        nome_planilha: 'Relatório de Prêmios',
        descricao: 'Controle mensal de prêmios emitidos por produto',
        macro_processo: 'Subscrição',
        processo_nome: 'Análise de Propostas',
        processo_id: 'P-001-001',
        project_info_id: project_id,
        status: 'Ativo',
        criticidade: 'Alta',
        responsavel_manutencao: 'Analista de Subscrição',
        frequencia_atualizacao: 'Mensal',
        validacao_etapa: 2
      },
      {
        nome_planilha: 'Controle de Sinistros IBNR',
        descricao: 'Estimativa de sinistros ocorridos mas não reportados',
        macro_processo: 'Sinistros',
        processo_nome: 'Regulação',
        processo_id: 'P-002-002',
        project_info_id: project_id,
        status: 'Ativo',
        criticidade: 'Crítica',
        responsavel_manutencao: 'Atuário Sênior',
        frequencia_atualizacao: 'Mensal',
        validacao_etapa: 3
      },
      {
        nome_planilha: 'Posição de Resseguro',
        descricao: 'Controle de cessões e recuperações de resseguro',
        macro_processo: 'Resseguro',
        processo_nome: 'Cessão Automática',
        processo_id: 'P-003-001',
        project_info_id: project_id,
        status: 'Ativo',
        criticidade: 'Alta',
        responsavel_manutencao: 'Analista de Resseguro',
        frequencia_atualizacao: 'Diário',
        validacao_etapa: 2
      }
    ]

    // Inserir planilhas
    const { error: spreadsheetsError } = await supabase
      .from('dados_planilhas')
      .upsert(spreadsheets)

    if (spreadsheetsError) {
      console.error('Erro ao inserir planilhas:', spreadsheetsError)
      throw spreadsheetsError
    }

    console.log('Dados do projeto IRB(Re) populados com sucesso')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Dados do projeto IRB(Re) populados com sucesso',
        data: {
          risks: risks.length,
          controls: controls.length,
          improvements: improvements.length,
          spreadsheets: spreadsheets.length
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Erro ao popular dados do IRB(Re):', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})