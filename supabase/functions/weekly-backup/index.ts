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

    console.log('Iniciando backup semanal automatizado...')

    // Tabelas para backup
    const tables = [
      'project_info',
      'project_details', 
      'processos',
      'riscos',
      'kris',
      'melhorias',
      'testes',
      'dados_planilhas',
      'profiles',
      'project_users'
    ]

    const backupData: any = {}
    const timestamp = new Date().toISOString().split('T')[0]

    // Exportar dados de cada tabela
    for (const table of tables) {
      console.log(`Fazendo backup da tabela: ${table}`)
      
      const { data, error } = await supabase
        .from(table)
        .select('*')

      if (error) {
        console.error(`Erro ao fazer backup da tabela ${table}:`, error)
        continue
      }

      backupData[table] = data
      console.log(`Backup da tabela ${table} concluído: ${data?.length || 0} registros`)
    }

    // Salvar backup no storage
    const backupJson = JSON.stringify(backupData, null, 2)
    const fileName = `backup_semanal_${timestamp}.json`

    const { error: storageError } = await supabase.storage
      .from('dados-evidencias')
      .upload(`backups/${fileName}`, new Blob([backupJson], { type: 'application/json' }))

    if (storageError) {
      console.error('Erro ao salvar backup no storage:', storageError)
      throw storageError
    }

    console.log(`Backup semanal salvo com sucesso: ${fileName}`)

    // Log do backup
    await supabase
      .from('backup_logs')
      .insert({
        tipo: 'semanal',
        arquivo: fileName,
        status: 'sucesso',
        detalhes: `Backup de ${tables.length} tabelas realizado com sucesso`
      })

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Backup semanal realizado com sucesso',
        arquivo: fileName,
        tabelas: tables.length
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Erro no backup semanal:', error)
    
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