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

    const { templateId, newProjectData, userId } = await req.json()

    console.log('Criando projeto a partir do template:', templateId)

    // 1. Criar novo projeto
    const { data: newProject, error: projectError } = await supabase
      .from('project_info')
      .insert({
        user_id: userId,
        nome_projeto: newProjectData.nome_projeto,
        cliente: newProjectData.cliente,
        data_inicio: newProjectData.data_inicio,
        data_fim: newProjectData.data_fim,
        sponsor_principal: newProjectData.sponsor_principal,
        objetivo_projeto: newProjectData.objetivo_projeto
      })
      .select()
      .single()

    if (projectError) throw projectError

    const newProjectId = newProject.id

    // 2. Copiar estruturas da cadeia de valor
    const { data: estruturas } = await supabase
      .from('estruturas_cadeia_valor')
      .select('*')
      .eq('project_info_id', templateId)

    if (estruturas && estruturas.length > 0) {
      const newEstruturas = estruturas.map(est => ({
        ...est,
        id: undefined,
        project_info_id: newProjectId,
        created_at: undefined,
        updated_at: undefined
      }))

      await supabase
        .from('estruturas_cadeia_valor')
        .insert(newEstruturas)
    }

    // 3. Copiar macro processos
    const { data: macroProcessos } = await supabase
      .from('macro_processos')
      .select('*')
      .eq('project_info_id', templateId)

    const macroProcessosMap = new Map()

    if (macroProcessos && macroProcessos.length > 0) {
      for (const macro of macroProcessos) {
        const { data: newMacro } = await supabase
          .from('macro_processos')
          .insert({
            ...macro,
            id: undefined,
            project_info_id: newProjectId,
            created_at: undefined,
            updated_at: undefined
          })
          .select()
          .single()

        if (newMacro) {
          macroProcessosMap.set(macro.id, newMacro.id)
        }
      }
    }

    // 4. Copiar processos
    const { data: processos } = await supabase
      .from('processos')
      .select('*')
      .eq('project_info_id', templateId)

    const processosMap = new Map()

    if (processos && processos.length > 0) {
      for (const processo of processos) {
        const newProcessoId = `${processo.id.split('-')[0]}-${Math.random().toString(36).substr(2, 3).toUpperCase()}`
        
        const { data: newProcesso } = await supabase
          .from('processos')
          .insert({
            ...processo,
            id: newProcessoId,
            project_info_id: newProjectId,
            macro_processo_id: macroProcessosMap.get(processo.macro_processo_id) || null,
            created_at: undefined,
            updated_at: undefined
          })
          .select()
          .single()

        if (newProcesso) {
          processosMap.set(processo.id, newProcesso.id)
        }
      }
    }

    // 5. Copiar riscos
    const { data: riscos } = await supabase
      .from('riscos')
      .select('*')
      .eq('project_info_id', templateId)

    const riscosMap = new Map()

    if (riscos && riscos.length > 0) {
      for (const risco of riscos) {
        const { data: newRisco } = await supabase
          .from('riscos')
          .insert({
            ...risco,
            id: undefined,
            project_info_id: newProjectId,
            processo_id: processosMap.get(risco.processo_id) || null,
            created_at: undefined,
            updated_at: undefined
          })
          .select()
          .single()

        if (newRisco) {
          riscosMap.set(risco.id, newRisco.id)
        }
      }
    }

    // 6. Copiar controles/KRIs
    const { data: kris } = await supabase
      .from('kris')
      .select('*')
      .eq('project_info_id', templateId)

    if (kris && kris.length > 0) {
      const newKris = kris.map(kri => ({
        ...kri,
        id: undefined,
        project_info_id: newProjectId,
        processo_id: processosMap.get(kri.processo_id) || null,
        risco_id: riscosMap.get(kri.risco_id) || null,
        created_at: undefined,
        updated_at: undefined
      }))

      await supabase
        .from('kris')
        .insert(newKris)
    }

    // 7. Criar detalhes do projeto
    const { data: templateDetails } = await supabase
      .from('project_details')
      .select('*')
      .eq('project_info_id', templateId)
      .single()

    if (templateDetails) {
      await supabase
        .from('project_details')
        .insert({
          ...templateDetails,
          id: undefined,
          project_info_id: newProjectId,
          user_id: userId,
          created_at: undefined,
          updated_at: undefined,
          progresso_percentual: 0,
          processos_mapeados: 0,
          riscos_identificados: 0,
          controles_implementados: 0,
          acoes_melhoria: 0
        })
    }

    // 8. Associar usuário ao projeto
    await supabase
      .from('project_users')
      .insert({
        project_id: newProjectId,
        user_id: userId,
        role: 'admin'
      })

    // 9. Registrar no histórico
    await supabase
      .from('project_history')
      .insert({
        project_info_id: newProjectId,
        user_id: userId,
        tipo_mudanca: 'criacao_template',
        descricao_mudanca: `Projeto criado a partir do template ${templateId}`,
        dados_novos: newProject
      })

    return new Response(
      JSON.stringify({ 
        success: true, 
        project: newProject,
        message: 'Projeto criado com sucesso a partir do template!'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Erro ao criar projeto do template:', error)
    
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