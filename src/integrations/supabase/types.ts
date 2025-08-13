export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      audit_action_plans: {
        Row: {
          action_code: string | null
          audit_test_id: string | null
          completion_date: string | null
          controle_id: string | null
          created_at: string | null
          due_date: string | null
          finding_description: string
          follow_up_notes: string | null
          id: string
          implementation_evidence: string | null
          priority: string | null
          progress_percentage: number | null
          project_info_id: string | null
          recommended_action: string
          responsible_person: string | null
          reviewer_person: string | null
          root_cause: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          action_code?: string | null
          audit_test_id?: string | null
          completion_date?: string | null
          controle_id?: string | null
          created_at?: string | null
          due_date?: string | null
          finding_description: string
          follow_up_notes?: string | null
          id?: string
          implementation_evidence?: string | null
          priority?: string | null
          progress_percentage?: number | null
          project_info_id?: string | null
          recommended_action: string
          responsible_person?: string | null
          reviewer_person?: string | null
          root_cause?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          action_code?: string | null
          audit_test_id?: string | null
          completion_date?: string | null
          controle_id?: string | null
          created_at?: string | null
          due_date?: string | null
          finding_description?: string
          follow_up_notes?: string | null
          id?: string
          implementation_evidence?: string | null
          priority?: string | null
          progress_percentage?: number | null
          project_info_id?: string | null
          recommended_action?: string
          responsible_person?: string | null
          reviewer_person?: string | null
          root_cause?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_action_plans_audit_test_id_fkey"
            columns: ["audit_test_id"]
            isOneToOne: false
            referencedRelation: "audit_tests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_action_plans_controle_id_fkey"
            columns: ["controle_id"]
            isOneToOne: false
            referencedRelation: "kris"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_action_plans_project_info_id_fkey"
            columns: ["project_info_id"]
            isOneToOne: false
            referencedRelation: "project_info"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_process_templates: {
        Row: {
          audit_type: Database["public"]["Enums"]["audit_test_type"]
          created_at: string | null
          description: string | null
          estimated_hours: number | null
          id: string
          is_active: boolean | null
          methodology: string
          name: string
          periodicity: string | null
          procedures: Json | null
          project_info_id: string | null
          required_evidences: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          audit_type: Database["public"]["Enums"]["audit_test_type"]
          created_at?: string | null
          description?: string | null
          estimated_hours?: number | null
          id?: string
          is_active?: boolean | null
          methodology: string
          name: string
          periodicity?: string | null
          procedures?: Json | null
          project_info_id?: string | null
          required_evidences?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          audit_type?: Database["public"]["Enums"]["audit_test_type"]
          created_at?: string | null
          description?: string | null
          estimated_hours?: number | null
          id?: string
          is_active?: boolean | null
          methodology?: string
          name?: string
          periodicity?: string | null
          procedures?: Json | null
          project_info_id?: string | null
          required_evidences?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_process_templates_project_info_id_fkey"
            columns: ["project_info_id"]
            isOneToOne: false
            referencedRelation: "project_info"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_schedule: {
        Row: {
          actual_date: string | null
          audit_type: Database["public"]["Enums"]["audit_test_type"]
          auditor_name: string | null
          controle_id: string | null
          created_at: string | null
          id: string
          month: number | null
          observations: string | null
          planned_date: string | null
          processo_id: string | null
          project_info_id: string | null
          quarter: number | null
          status: Database["public"]["Enums"]["audit_status"] | null
          updated_at: string | null
          user_id: string | null
          year: number
        }
        Insert: {
          actual_date?: string | null
          audit_type: Database["public"]["Enums"]["audit_test_type"]
          auditor_name?: string | null
          controle_id?: string | null
          created_at?: string | null
          id?: string
          month?: number | null
          observations?: string | null
          planned_date?: string | null
          processo_id?: string | null
          project_info_id?: string | null
          quarter?: number | null
          status?: Database["public"]["Enums"]["audit_status"] | null
          updated_at?: string | null
          user_id?: string | null
          year: number
        }
        Update: {
          actual_date?: string | null
          audit_type?: Database["public"]["Enums"]["audit_test_type"]
          auditor_name?: string | null
          controle_id?: string | null
          created_at?: string | null
          id?: string
          month?: number | null
          observations?: string | null
          planned_date?: string | null
          processo_id?: string | null
          project_info_id?: string | null
          quarter?: number | null
          status?: Database["public"]["Enums"]["audit_status"] | null
          updated_at?: string | null
          user_id?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "audit_schedule_controle_id_fkey"
            columns: ["controle_id"]
            isOneToOne: false
            referencedRelation: "kris"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_schedule_processo_id_fkey"
            columns: ["processo_id"]
            isOneToOne: false
            referencedRelation: "processos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_schedule_project_info_id_fkey"
            columns: ["project_info_id"]
            isOneToOne: false
            referencedRelation: "project_info"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_tests: {
        Row: {
          audit_type: Database["public"]["Enums"]["audit_test_type"]
          auditor_name: string | null
          completion_date: string | null
          controle_id: string | null
          created_at: string | null
          effectiveness_score: number | null
          evidence_files: Json | null
          evidence_names: Json | null
          evidence_paths: Json | null
          findings: string | null
          id: string
          is_critical: boolean | null
          methodology: string | null
          procedures_executed: string | null
          processo_id: string | null
          project_info_id: string | null
          recommendations: string | null
          reviewer_name: string | null
          risco_id: string | null
          schedule_id: string | null
          status: Database["public"]["Enums"]["audit_status"] | null
          template_id: string | null
          test_code: string | null
          test_date: string | null
          test_name: string
          test_result: Database["public"]["Enums"]["test_result"] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          audit_type: Database["public"]["Enums"]["audit_test_type"]
          auditor_name?: string | null
          completion_date?: string | null
          controle_id?: string | null
          created_at?: string | null
          effectiveness_score?: number | null
          evidence_files?: Json | null
          evidence_names?: Json | null
          evidence_paths?: Json | null
          findings?: string | null
          id?: string
          is_critical?: boolean | null
          methodology?: string | null
          procedures_executed?: string | null
          processo_id?: string | null
          project_info_id?: string | null
          recommendations?: string | null
          reviewer_name?: string | null
          risco_id?: string | null
          schedule_id?: string | null
          status?: Database["public"]["Enums"]["audit_status"] | null
          template_id?: string | null
          test_code?: string | null
          test_date?: string | null
          test_name: string
          test_result?: Database["public"]["Enums"]["test_result"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          audit_type?: Database["public"]["Enums"]["audit_test_type"]
          auditor_name?: string | null
          completion_date?: string | null
          controle_id?: string | null
          created_at?: string | null
          effectiveness_score?: number | null
          evidence_files?: Json | null
          evidence_names?: Json | null
          evidence_paths?: Json | null
          findings?: string | null
          id?: string
          is_critical?: boolean | null
          methodology?: string | null
          procedures_executed?: string | null
          processo_id?: string | null
          project_info_id?: string | null
          recommendations?: string | null
          reviewer_name?: string | null
          risco_id?: string | null
          schedule_id?: string | null
          status?: Database["public"]["Enums"]["audit_status"] | null
          template_id?: string | null
          test_code?: string | null
          test_date?: string | null
          test_name?: string
          test_result?: Database["public"]["Enums"]["test_result"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_tests_controle_id_fkey"
            columns: ["controle_id"]
            isOneToOne: false
            referencedRelation: "kris"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_tests_processo_id_fkey"
            columns: ["processo_id"]
            isOneToOne: false
            referencedRelation: "processos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_tests_project_info_id_fkey"
            columns: ["project_info_id"]
            isOneToOne: false
            referencedRelation: "project_info"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_tests_risco_id_fkey"
            columns: ["risco_id"]
            isOneToOne: false
            referencedRelation: "riscos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_tests_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "audit_schedule"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_tests_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "audit_process_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      backup_logs: {
        Row: {
          arquivo: string
          created_at: string
          detalhes: string | null
          id: string
          status: string
          tipo: string
        }
        Insert: {
          arquivo: string
          created_at?: string
          detalhes?: string | null
          id?: string
          status: string
          tipo: string
        }
        Update: {
          arquivo?: string
          created_at?: string
          detalhes?: string | null
          id?: string
          status?: string
          tipo?: string
        }
        Relationships: []
      }
      dados_planilhas: {
        Row: {
          created_at: string
          criticidade: string | null
          descricao: string | null
          evidencia_names: string[] | null
          evidencia_paths: string[] | null
          frequencia_atualizacao: string | null
          id: string
          macro_processo: string
          nome_planilha: string
          observacoes: string | null
          processo_id: string | null
          processo_nome: string
          project_info_id: string | null
          responsavel_manutencao: string | null
          sistema_origem: string | null
          status: string | null
          tipo_dados: string | null
          updated_at: string
          user_id: string | null
          validacao_etapa: number | null
        }
        Insert: {
          created_at?: string
          criticidade?: string | null
          descricao?: string | null
          evidencia_names?: string[] | null
          evidencia_paths?: string[] | null
          frequencia_atualizacao?: string | null
          id?: string
          macro_processo: string
          nome_planilha: string
          observacoes?: string | null
          processo_id?: string | null
          processo_nome: string
          project_info_id?: string | null
          responsavel_manutencao?: string | null
          sistema_origem?: string | null
          status?: string | null
          tipo_dados?: string | null
          updated_at?: string
          user_id?: string | null
          validacao_etapa?: number | null
        }
        Update: {
          created_at?: string
          criticidade?: string | null
          descricao?: string | null
          evidencia_names?: string[] | null
          evidencia_paths?: string[] | null
          frequencia_atualizacao?: string | null
          id?: string
          macro_processo?: string
          nome_planilha?: string
          observacoes?: string | null
          processo_id?: string | null
          processo_nome?: string
          project_info_id?: string | null
          responsavel_manutencao?: string | null
          sistema_origem?: string | null
          status?: string | null
          tipo_dados?: string | null
          updated_at?: string
          user_id?: string | null
          validacao_etapa?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "dados_planilhas_processo_id_fkey"
            columns: ["processo_id"]
            isOneToOne: false
            referencedRelation: "processos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dados_planilhas_project_info_id_fkey"
            columns: ["project_info_id"]
            isOneToOne: false
            referencedRelation: "project_info"
            referencedColumns: ["id"]
          },
        ]
      }
      estruturas_cadeia_valor: {
        Row: {
          cor: string | null
          created_at: string
          descricao: string | null
          id: string
          nome: string
          ordem: number
          project_info_id: string | null
          updated_at: string
        }
        Insert: {
          cor?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          ordem?: number
          project_info_id?: string | null
          updated_at?: string
        }
        Update: {
          cor?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          ordem?: number
          project_info_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "estruturas_cadeia_valor_project_info_id_fkey"
            columns: ["project_info_id"]
            isOneToOne: false
            referencedRelation: "project_info"
            referencedColumns: ["id"]
          },
        ]
      }
      kris: {
        Row: {
          atividade: string | null
          categoria: string
          codigo: string | null
          created_at: string
          descricao: string | null
          forma_atuacao: string | null
          forma_execucao: string | null
          frequencia_medicao: string
          id: string
          macro_processo: string | null
          meta_tier1: number | null
          meta_tier2: number | null
          meta_tier3: number | null
          nome: string
          objetivo: string | null
          periodicidade: string | null
          prioridade: string | null
          processo_id: string | null
          project_info_id: string | null
          referencia_mercado: string | null
          responsavel: string | null
          risco_id: string | null
          status: string
          tipo_medicao: string
          updated_at: string
          user_id: string | null
          validacao_etapa: number | null
        }
        Insert: {
          atividade?: string | null
          categoria: string
          codigo?: string | null
          created_at?: string
          descricao?: string | null
          forma_atuacao?: string | null
          forma_execucao?: string | null
          frequencia_medicao: string
          id?: string
          macro_processo?: string | null
          meta_tier1?: number | null
          meta_tier2?: number | null
          meta_tier3?: number | null
          nome: string
          objetivo?: string | null
          periodicidade?: string | null
          prioridade?: string | null
          processo_id?: string | null
          project_info_id?: string | null
          referencia_mercado?: string | null
          responsavel?: string | null
          risco_id?: string | null
          status?: string
          tipo_medicao: string
          updated_at?: string
          user_id?: string | null
          validacao_etapa?: number | null
        }
        Update: {
          atividade?: string | null
          categoria?: string
          codigo?: string | null
          created_at?: string
          descricao?: string | null
          forma_atuacao?: string | null
          forma_execucao?: string | null
          frequencia_medicao?: string
          id?: string
          macro_processo?: string | null
          meta_tier1?: number | null
          meta_tier2?: number | null
          meta_tier3?: number | null
          nome?: string
          objetivo?: string | null
          periodicidade?: string | null
          prioridade?: string | null
          processo_id?: string | null
          project_info_id?: string | null
          referencia_mercado?: string | null
          responsavel?: string | null
          risco_id?: string | null
          status?: string
          tipo_medicao?: string
          updated_at?: string
          user_id?: string | null
          validacao_etapa?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_kris_processo"
            columns: ["processo_id"]
            isOneToOne: false
            referencedRelation: "processos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kris_project_info_id_fkey"
            columns: ["project_info_id"]
            isOneToOne: false
            referencedRelation: "project_info"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kris_risco_id_fkey"
            columns: ["risco_id"]
            isOneToOne: false
            referencedRelation: "riscos"
            referencedColumns: ["id"]
          },
        ]
      }
      macro_processos: {
        Row: {
          codigo: string | null
          created_at: string
          descricao: string | null
          estrutura_id: string | null
          id: string
          nome: string
          project_info_id: string | null
          updated_at: string
        }
        Insert: {
          codigo?: string | null
          created_at?: string
          descricao?: string | null
          estrutura_id?: string | null
          id: string
          nome: string
          project_info_id?: string | null
          updated_at?: string
        }
        Update: {
          codigo?: string | null
          created_at?: string
          descricao?: string | null
          estrutura_id?: string | null
          id?: string
          nome?: string
          project_info_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "macro_processos_estrutura_id_fkey"
            columns: ["estrutura_id"]
            isOneToOne: false
            referencedRelation: "estruturas_cadeia_valor"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "macro_processos_project_info_id_fkey"
            columns: ["project_info_id"]
            isOneToOne: false
            referencedRelation: "project_info"
            referencedColumns: ["id"]
          },
        ]
      }
      melhorias: {
        Row: {
          beneficio: string | null
          breve_descricao_problema: string | null
          codigo: string | null
          controle_id: string | null
          created_at: string | null
          descricao: string | null
          descricao_problema: string | null
          detalhamento_solucao: string | null
          diferenca_sap_s4hanna: string | null
          esforco: string | null
          esforco_beneficio: string | null
          financeiro: boolean | null
          id: string
          ifrs17: boolean | null
          ifrs4: boolean | null
          legal_regulatorio: boolean | null
          modulo_sistema: string | null
          necessidade_integracao: boolean | null
          nome: string
          novo_sistema: string | null
          ponto_risco_controle: boolean | null
          potencial_implementacao_imediata: boolean | null
          previsao_implementacao_novo_sistema: string | null
          priorizacao: string | null
          problema_sanado_novo_sistema: boolean | null
          processo_id: string | null
          produtividade: boolean | null
          project_info_id: string | null
          reducao_da: boolean | null
          responsavel: string | null
          risco_id: string | null
          sistema_envolvido: boolean | null
          sistema_sera_substituido: boolean | null
          status: string | null
          tipo_oportunidade: string | null
          tratativa: string | null
          updated_at: string | null
          user_id: string | null
          validacao_etapa: number | null
        }
        Insert: {
          beneficio?: string | null
          breve_descricao_problema?: string | null
          codigo?: string | null
          controle_id?: string | null
          created_at?: string | null
          descricao?: string | null
          descricao_problema?: string | null
          detalhamento_solucao?: string | null
          diferenca_sap_s4hanna?: string | null
          esforco?: string | null
          esforco_beneficio?: string | null
          financeiro?: boolean | null
          id?: string
          ifrs17?: boolean | null
          ifrs4?: boolean | null
          legal_regulatorio?: boolean | null
          modulo_sistema?: string | null
          necessidade_integracao?: boolean | null
          nome: string
          novo_sistema?: string | null
          ponto_risco_controle?: boolean | null
          potencial_implementacao_imediata?: boolean | null
          previsao_implementacao_novo_sistema?: string | null
          priorizacao?: string | null
          problema_sanado_novo_sistema?: boolean | null
          processo_id?: string | null
          produtividade?: boolean | null
          project_info_id?: string | null
          reducao_da?: boolean | null
          responsavel?: string | null
          risco_id?: string | null
          sistema_envolvido?: boolean | null
          sistema_sera_substituido?: boolean | null
          status?: string | null
          tipo_oportunidade?: string | null
          tratativa?: string | null
          updated_at?: string | null
          user_id?: string | null
          validacao_etapa?: number | null
        }
        Update: {
          beneficio?: string | null
          breve_descricao_problema?: string | null
          codigo?: string | null
          controle_id?: string | null
          created_at?: string | null
          descricao?: string | null
          descricao_problema?: string | null
          detalhamento_solucao?: string | null
          diferenca_sap_s4hanna?: string | null
          esforco?: string | null
          esforco_beneficio?: string | null
          financeiro?: boolean | null
          id?: string
          ifrs17?: boolean | null
          ifrs4?: boolean | null
          legal_regulatorio?: boolean | null
          modulo_sistema?: string | null
          necessidade_integracao?: boolean | null
          nome?: string
          novo_sistema?: string | null
          ponto_risco_controle?: boolean | null
          potencial_implementacao_imediata?: boolean | null
          previsao_implementacao_novo_sistema?: string | null
          priorizacao?: string | null
          problema_sanado_novo_sistema?: boolean | null
          processo_id?: string | null
          produtividade?: boolean | null
          project_info_id?: string | null
          reducao_da?: boolean | null
          responsavel?: string | null
          risco_id?: string | null
          sistema_envolvido?: boolean | null
          sistema_sera_substituido?: boolean | null
          status?: string | null
          tipo_oportunidade?: string | null
          tratativa?: string | null
          updated_at?: string | null
          user_id?: string | null
          validacao_etapa?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "melhorias_project_info_id_fkey"
            columns: ["project_info_id"]
            isOneToOne: false
            referencedRelation: "project_info"
            referencedColumns: ["id"]
          },
        ]
      }
      normas_procedimentos: {
        Row: {
          area: string | null
          arquivo_name: string | null
          arquivo_path: string | null
          codigo: string
          created_at: string
          descricao: string | null
          id: string
          project_info_id: string | null
          responsavel: string | null
          status: string
          tipo: string
          titulo: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          area?: string | null
          arquivo_name?: string | null
          arquivo_path?: string | null
          codigo: string
          created_at?: string
          descricao?: string | null
          id?: string
          project_info_id?: string | null
          responsavel?: string | null
          status?: string
          tipo: string
          titulo: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          area?: string | null
          arquivo_name?: string | null
          arquivo_path?: string | null
          codigo?: string
          created_at?: string
          descricao?: string | null
          id?: string
          project_info_id?: string | null
          responsavel?: string | null
          status?: string
          tipo?: string
          titulo?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "normas_procedimentos_project_info_id_fkey"
            columns: ["project_info_id"]
            isOneToOne: false
            referencedRelation: "project_info"
            referencedColumns: ["id"]
          },
        ]
      }
      normas_procedimentos_versoes: {
        Row: {
          aprovado_por: string | null
          arquivo_name: string | null
          arquivo_path: string | null
          ativo: boolean
          created_at: string
          data_aprovacao: string | null
          data_expiracao: string | null
          data_fim: string | null
          data_inicio: string
          id: string
          norma_procedimento_id: string
          observacoes: string | null
          proxima_revisao: string | null
          updated_at: string
          versao: string
        }
        Insert: {
          aprovado_por?: string | null
          arquivo_name?: string | null
          arquivo_path?: string | null
          ativo?: boolean
          created_at?: string
          data_aprovacao?: string | null
          data_expiracao?: string | null
          data_fim?: string | null
          data_inicio?: string
          id?: string
          norma_procedimento_id: string
          observacoes?: string | null
          proxima_revisao?: string | null
          updated_at?: string
          versao: string
        }
        Update: {
          aprovado_por?: string | null
          arquivo_name?: string | null
          arquivo_path?: string | null
          ativo?: boolean
          created_at?: string
          data_aprovacao?: string | null
          data_expiracao?: string | null
          data_fim?: string | null
          data_inicio?: string
          id?: string
          norma_procedimento_id?: string
          observacoes?: string | null
          proxima_revisao?: string | null
          updated_at?: string
          versao?: string
        }
        Relationships: [
          {
            foreignKeyName: "normas_procedimentos_versoes_norma_procedimento_id_fkey"
            columns: ["norma_procedimento_id"]
            isOneToOne: false
            referencedRelation: "normas_procedimentos"
            referencedColumns: ["id"]
          },
        ]
      }
      process_status_logs: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          observacoes: string | null
          processo_id: string
          project_info_id: string | null
          status_anterior: number | null
          status_novo: number
          usuario_anterior: string | null
          usuario_novo: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          observacoes?: string | null
          processo_id: string
          project_info_id?: string | null
          status_anterior?: number | null
          status_novo: number
          usuario_anterior?: string | null
          usuario_novo?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          observacoes?: string | null
          processo_id?: string
          project_info_id?: string | null
          status_anterior?: number | null
          status_novo?: number
          usuario_anterior?: string | null
          usuario_novo?: string | null
        }
        Relationships: []
      }
      processos: {
        Row: {
          arquivo_versoes: Json | null
          attachment_dates: string[] | null
          attachment_names: string[] | null
          attachment_paths: string[] | null
          bpmn_diagram_name: string | null
          bpmn_diagram_path: string | null
          codigo: string | null
          created_at: string
          descricao: string | null
          descritivo_attachment_dates: string[] | null
          descritivo_attachment_names: string[] | null
          descritivo_attachment_paths: string[] | null
          descritivo_validacao: string | null
          descritivo_validado_em: string | null
          descritivo_validado_por: string | null
          fluxograma_attachment_dates: string[] | null
          fluxograma_attachment_names: string[] | null
          fluxograma_attachment_paths: string[] | null
          fluxograma_validacao: string | null
          fluxograma_validado_em: string | null
          fluxograma_validado_por: string | null
          id: string
          macro_processo: string
          macro_processo_id: string | null
          nome: string
          project_info_id: string | null
          raci_attachment_dates: string[] | null
          raci_attachment_names: string[] | null
          raci_attachment_paths: string[] | null
          raci_validacao: string | null
          raci_validado_em: string | null
          raci_validado_por: string | null
          responsavel: string | null
          status: string
          updated_at: string
          validacao_etapa: number | null
        }
        Insert: {
          arquivo_versoes?: Json | null
          attachment_dates?: string[] | null
          attachment_names?: string[] | null
          attachment_paths?: string[] | null
          bpmn_diagram_name?: string | null
          bpmn_diagram_path?: string | null
          codigo?: string | null
          created_at?: string
          descricao?: string | null
          descritivo_attachment_dates?: string[] | null
          descritivo_attachment_names?: string[] | null
          descritivo_attachment_paths?: string[] | null
          descritivo_validacao?: string | null
          descritivo_validado_em?: string | null
          descritivo_validado_por?: string | null
          fluxograma_attachment_dates?: string[] | null
          fluxograma_attachment_names?: string[] | null
          fluxograma_attachment_paths?: string[] | null
          fluxograma_validacao?: string | null
          fluxograma_validado_em?: string | null
          fluxograma_validado_por?: string | null
          id: string
          macro_processo: string
          macro_processo_id?: string | null
          nome: string
          project_info_id?: string | null
          raci_attachment_dates?: string[] | null
          raci_attachment_names?: string[] | null
          raci_attachment_paths?: string[] | null
          raci_validacao?: string | null
          raci_validado_em?: string | null
          raci_validado_por?: string | null
          responsavel?: string | null
          status?: string
          updated_at?: string
          validacao_etapa?: number | null
        }
        Update: {
          arquivo_versoes?: Json | null
          attachment_dates?: string[] | null
          attachment_names?: string[] | null
          attachment_paths?: string[] | null
          bpmn_diagram_name?: string | null
          bpmn_diagram_path?: string | null
          codigo?: string | null
          created_at?: string
          descricao?: string | null
          descritivo_attachment_dates?: string[] | null
          descritivo_attachment_names?: string[] | null
          descritivo_attachment_paths?: string[] | null
          descritivo_validacao?: string | null
          descritivo_validado_em?: string | null
          descritivo_validado_por?: string | null
          fluxograma_attachment_dates?: string[] | null
          fluxograma_attachment_names?: string[] | null
          fluxograma_attachment_paths?: string[] | null
          fluxograma_validacao?: string | null
          fluxograma_validado_em?: string | null
          fluxograma_validado_por?: string | null
          id?: string
          macro_processo?: string
          macro_processo_id?: string | null
          nome?: string
          project_info_id?: string | null
          raci_attachment_dates?: string[] | null
          raci_attachment_names?: string[] | null
          raci_attachment_paths?: string[] | null
          raci_validacao?: string | null
          raci_validado_em?: string | null
          raci_validado_por?: string | null
          responsavel?: string | null
          status?: string
          updated_at?: string
          validacao_etapa?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "processos_macro_processo_id_fkey"
            columns: ["macro_processo_id"]
            isOneToOne: false
            referencedRelation: "macro_processos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "processos_project_info_id_fkey"
            columns: ["project_info_id"]
            isOneToOne: false
            referencedRelation: "project_info"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          cargo: string | null
          created_at: string
          id: string
          nome: string | null
          perfil: string | null
          telefone: string | null
          updated_at: string
        }
        Insert: {
          cargo?: string | null
          created_at?: string
          id: string
          nome?: string | null
          perfil?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          cargo?: string | null
          created_at?: string
          id?: string
          nome?: string | null
          perfil?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      project_details: {
        Row: {
          acoes_melhoria: number | null
          acoes_melhoria_meta: number | null
          controles_implementados: number | null
          controles_meta: number | null
          created_at: string
          criterios_sucesso: string | null
          descricao_detalhada: string | null
          escopo: string | null
          id: string
          premissas: string | null
          processos_mapeados: number | null
          processos_meta: number | null
          progresso_percentual: number | null
          project_info_id: string | null
          restricoes: string | null
          riscos_identificados: number | null
          riscos_meta: number | null
          status_projeto: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          acoes_melhoria?: number | null
          acoes_melhoria_meta?: number | null
          controles_implementados?: number | null
          controles_meta?: number | null
          created_at?: string
          criterios_sucesso?: string | null
          descricao_detalhada?: string | null
          escopo?: string | null
          id?: string
          premissas?: string | null
          processos_mapeados?: number | null
          processos_meta?: number | null
          progresso_percentual?: number | null
          project_info_id?: string | null
          restricoes?: string | null
          riscos_identificados?: number | null
          riscos_meta?: number | null
          status_projeto?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          acoes_melhoria?: number | null
          acoes_melhoria_meta?: number | null
          controles_implementados?: number | null
          controles_meta?: number | null
          created_at?: string
          criterios_sucesso?: string | null
          descricao_detalhada?: string | null
          escopo?: string | null
          id?: string
          premissas?: string | null
          processos_mapeados?: number | null
          processos_meta?: number | null
          progresso_percentual?: number | null
          project_info_id?: string | null
          restricoes?: string | null
          riscos_identificados?: number | null
          riscos_meta?: number | null
          status_projeto?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_details_project_info_id_fkey"
            columns: ["project_info_id"]
            isOneToOne: false
            referencedRelation: "project_info"
            referencedColumns: ["id"]
          },
        ]
      }
      project_history: {
        Row: {
          created_at: string
          dados_anteriores: Json | null
          dados_novos: Json | null
          descricao_mudanca: string
          id: string
          project_info_id: string | null
          tipo_mudanca: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dados_anteriores?: Json | null
          dados_novos?: Json | null
          descricao_mudanca: string
          id?: string
          project_info_id?: string | null
          tipo_mudanca: string
          user_id: string
        }
        Update: {
          created_at?: string
          dados_anteriores?: Json | null
          dados_novos?: Json | null
          descricao_mudanca?: string
          id?: string
          project_info_id?: string | null
          tipo_mudanca?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_history_project_info_id_fkey"
            columns: ["project_info_id"]
            isOneToOne: false
            referencedRelation: "project_info"
            referencedColumns: ["id"]
          },
        ]
      }
      project_info: {
        Row: {
          cliente: string
          created_at: string
          data_fim: string
          data_inicio: string
          id: string
          nome_projeto: string
          objetivo_projeto: string
          sponsor_principal: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cliente: string
          created_at?: string
          data_fim: string
          data_inicio: string
          id?: string
          nome_projeto: string
          objetivo_projeto: string
          sponsor_principal?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cliente?: string
          created_at?: string
          data_fim?: string
          data_inicio?: string
          id?: string
          nome_projeto?: string
          objetivo_projeto?: string
          sponsor_principal?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      project_users: {
        Row: {
          created_at: string
          id: string
          project_id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          project_id: string
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          project_id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_users_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_info"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      riscos: {
        Row: {
          archived: boolean | null
          archived_at: string | null
          archived_by: string | null
          area: string | null
          atual_novo: string | null
          categoria: string
          categorias_pontuacao: Json | null
          causas: string | null
          codigo: string | null
          consequencias: string | null
          created_at: string
          data_identificacao: string | null
          descricao: string | null
          id: string
          impacto_calculado: number | null
          nivel_impacto: string
          nome: string
          probabilidade: string
          processo_id: string | null
          project_info_id: string | null
          responsavel: string | null
          status: string
          updated_at: string
          user_id: string | null
          validacao_etapa: number | null
        }
        Insert: {
          archived?: boolean | null
          archived_at?: string | null
          archived_by?: string | null
          area?: string | null
          atual_novo?: string | null
          categoria: string
          categorias_pontuacao?: Json | null
          causas?: string | null
          codigo?: string | null
          consequencias?: string | null
          created_at?: string
          data_identificacao?: string | null
          descricao?: string | null
          id?: string
          impacto_calculado?: number | null
          nivel_impacto: string
          nome: string
          probabilidade: string
          processo_id?: string | null
          project_info_id?: string | null
          responsavel?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
          validacao_etapa?: number | null
        }
        Update: {
          archived?: boolean | null
          archived_at?: string | null
          archived_by?: string | null
          area?: string | null
          atual_novo?: string | null
          categoria?: string
          categorias_pontuacao?: Json | null
          causas?: string | null
          codigo?: string | null
          consequencias?: string | null
          created_at?: string
          data_identificacao?: string | null
          descricao?: string | null
          id?: string
          impacto_calculado?: number | null
          nivel_impacto?: string
          nome?: string
          probabilidade?: string
          processo_id?: string | null
          project_info_id?: string | null
          responsavel?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
          validacao_etapa?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_riscos_processo"
            columns: ["processo_id"]
            isOneToOne: false
            referencedRelation: "processos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "riscos_project_info_id_fkey"
            columns: ["project_info_id"]
            isOneToOne: false
            referencedRelation: "project_info"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_status_logs: {
        Row: {
          created_at: string
          created_by: string
          id: string
          observacoes: string | null
          project_info_id: string | null
          risco_id: string
          status_anterior: number | null
          status_novo: number
          usuario_anterior: string | null
          usuario_novo: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string
          id?: string
          observacoes?: string | null
          project_info_id?: string | null
          risco_id: string
          status_anterior?: number | null
          status_novo: number
          usuario_anterior?: string | null
          usuario_novo?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          observacoes?: string | null
          project_info_id?: string | null
          risco_id?: string
          status_anterior?: number | null
          status_novo?: number
          usuario_anterior?: string | null
          usuario_novo?: string | null
        }
        Relationships: []
      }
      temp_user_profiles: {
        Row: {
          cargo: string | null
          created_at: string
          email: string
          id: string
          invitation_token: string
          nome: string | null
          perfil: string | null
          project_id: string | null
          telefone: string | null
          used: boolean | null
        }
        Insert: {
          cargo?: string | null
          created_at?: string
          email: string
          id?: string
          invitation_token: string
          nome?: string | null
          perfil?: string | null
          project_id?: string | null
          telefone?: string | null
          used?: boolean | null
        }
        Update: {
          cargo?: string | null
          created_at?: string
          email?: string
          id?: string
          invitation_token?: string
          nome?: string | null
          perfil?: string | null
          project_id?: string | null
          telefone?: string | null
          used?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "temp_user_profiles_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_info"
            referencedColumns: ["id"]
          },
        ]
      }
      testes: {
        Row: {
          codigo: string | null
          controle_id: string | null
          created_at: string | null
          data_execucao: string | null
          descricao: string | null
          evidencia_names: string[] | null
          evidencia_paths: string[] | null
          executor: string | null
          id: string
          maturidade: number | null
          mitigacao: number | null
          nome: string
          procedimento_realizado: string | null
          processo_id: string | null
          project_info_id: string | null
          revisor: string | null
          risco_id: string | null
          updated_at: string | null
          user_id: string | null
          validacao_etapa: number | null
        }
        Insert: {
          codigo?: string | null
          controle_id?: string | null
          created_at?: string | null
          data_execucao?: string | null
          descricao?: string | null
          evidencia_names?: string[] | null
          evidencia_paths?: string[] | null
          executor?: string | null
          id?: string
          maturidade?: number | null
          mitigacao?: number | null
          nome: string
          procedimento_realizado?: string | null
          processo_id?: string | null
          project_info_id?: string | null
          revisor?: string | null
          risco_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          validacao_etapa?: number | null
        }
        Update: {
          codigo?: string | null
          controle_id?: string | null
          created_at?: string | null
          data_execucao?: string | null
          descricao?: string | null
          evidencia_names?: string[] | null
          evidencia_paths?: string[] | null
          executor?: string | null
          id?: string
          maturidade?: number | null
          mitigacao?: number | null
          nome?: string
          procedimento_realizado?: string | null
          processo_id?: string | null
          project_info_id?: string | null
          revisor?: string | null
          risco_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          validacao_etapa?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "testes_controle_id_fkey"
            columns: ["controle_id"]
            isOneToOne: false
            referencedRelation: "kris"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "testes_project_info_id_fkey"
            columns: ["project_info_id"]
            isOneToOne: false
            referencedRelation: "project_info"
            referencedColumns: ["id"]
          },
        ]
      }
      user_invitations: {
        Row: {
          created_at: string
          created_by: string | null
          email: string
          expires_at: string
          id: string
          project_id: string | null
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          email: string
          expires_at?: string
          id?: string
          project_id?: string | null
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          email?: string
          expires_at?: string
          id?: string
          project_id?: string | null
          token?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_invitations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_info"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      analyze_query_performance: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      archive_risk: {
        Args: { risk_id: string; should_archive: boolean; user_id?: string }
        Returns: undefined
      }
      calculate_max_impact_from_categories: {
        Args: { categorias_pontuacao: Json }
        Returns: number
      }
      clean_all_projects_except_template: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_orphaned_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_new_version: {
        Args: {
          p_norma_id: string
          p_versao: string
          p_data_inicio?: string
          p_data_expiracao?: string
          p_aprovado_por?: string
          p_observacoes?: string
        }
        Returns: string
      }
      create_user_invitation: {
        Args:
          | {
              p_email: string
              p_nome: string
              p_project_id: string
              p_telefone?: string
              p_cargo?: string
              p_perfil?: string
              p_created_by?: string
            }
          | {
              p_email: string
              p_nome: string
              p_telefone?: string
              p_cargo?: string
              p_perfil?: string
              p_created_by?: string
            }
        Returns: Json
      }
      generate_code: {
        Args: {
          prefix: string
          process_prefix: string
          table_name: string
          project_id?: string
        }
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_process_status_logs: {
        Args: { process_id: string }
        Returns: Json
      }
      get_risk_status_logs: {
        Args: { risk_id: string }
        Returns: Json
      }
      initialize_irb_template_project: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_project_metrics: {
        Args: { project_id: string }
        Returns: undefined
      }
      update_user_profile: {
        Args: {
          p_user_id: string
          p_telefone?: string
          p_cargo?: string
          p_perfil?: string
        }
        Returns: {
          id: string
          nome: string
          telefone: string
          cargo: string
          perfil: string
          created_at: string
          updated_at: string
        }[]
      }
      user_can_access_project: {
        Args: { project_uuid: string }
        Returns: boolean
      }
      user_has_project_access: {
        Args: { project_uuid: string }
        Returns: boolean
      }
    }
    Enums: {
      audit_status:
        | "planejado"
        | "em_andamento"
        | "concluido"
        | "pendente"
        | "cancelado"
      audit_test_type: "desenho" | "efetividade"
      test_result:
        | "efetivo"
        | "inefetivo"
        | "parcialmente_efetivo"
        | "nao_testado"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      audit_status: [
        "planejado",
        "em_andamento",
        "concluido",
        "pendente",
        "cancelado",
      ],
      audit_test_type: ["desenho", "efetividade"],
      test_result: [
        "efetivo",
        "inefetivo",
        "parcialmente_efetivo",
        "nao_testado",
      ],
    },
  },
} as const
