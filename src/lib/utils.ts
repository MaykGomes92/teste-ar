import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { supabase } from "@/integrations/supabase/client"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Função para gerar 3 letras identificadoras a partir do nome
export function generateIdentifierLetters(name: string): string {
  // Remove acentos e caracteres especiais, mantém apenas letras
  const cleanName = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z]/g, "")
    .toUpperCase();
  
  if (cleanName.length >= 3) {
    return cleanName.substring(0, 3);
  } else {
    return cleanName.padEnd(3, 'X');
  }
}

// Função para gerar código sequencial de 3 dígitos
export async function getNextSequentialNumber(
  prefix: string, 
  tableName: 'macro_processos' | 'processos' | 'riscos' | 'kris' | 'testes' | 'melhorias', 
  projectId?: string
): Promise<string> {
  // Para processos e macro_processos, use o campo id diretamente
  if (tableName === 'processos' || tableName === 'macro_processos') {
    const { data, error } = await supabase
      .from(tableName)
      .select('id')
      .like('id', `${prefix}%`)
      .order('id', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Erro ao buscar último número:', error);
      return '001';
    }

    if (!data || data.length === 0) {
      return '001';
    }

    // Extrai o último número do código
    const lastCode = data[0].id;
    const numberMatch = lastCode.match(/(\d{3})$/);
    
    if (numberMatch) {
      const lastNumber = parseInt(numberMatch[1]);
      const nextNumber = lastNumber + 1;
      return nextNumber.toString().padStart(3, '0');
    }

    return '001';
  } else {
    // Para outras tabelas, use o campo codigo
    const { data, error } = await supabase
      .from(tableName)
      .select('codigo')
      .not('codigo', 'is', null)
      .like('codigo', `${prefix}%`)
      .order('codigo', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Erro ao buscar último número:', error);
      return '001';
    }

    if (!data || data.length === 0) {
      return '001';
    }

    // Extrai o último número do código
    const lastCode = data[0].codigo;
    const numberMatch = lastCode.match(/(\d{3})$/);
    
    if (numberMatch) {
      const lastNumber = parseInt(numberMatch[1]);
      const nextNumber = lastNumber + 1;
      return nextNumber.toString().padStart(3, '0');
    }

    return '001';
  }
}

// Funções específicas para gerar códigos por tipo
export async function generateMacroProcessCode(name: string): Promise<string> {
  const identifier = generateIdentifierLetters(name);
  const number = await getNextSequentialNumber(`MP.${identifier}.`, 'macro_processos');
  return `MP.${identifier}.${number}`;
}

export async function generateProcessCode(name: string): Promise<string> {
  const identifier = generateIdentifierLetters(name);
  const number = await getNextSequentialNumber(`PRO.${identifier}.`, 'processos');
  return `PRO.${identifier}.${number}`;
}

export async function generateRiskCode(name: string, processId: string): Promise<string> {
  // Para processos, o código está no campo id
  const { data: processData, error } = await supabase
    .from('processos')
    .select('id')
    .eq('id', processId)
    .single();
     
  if (error || !processData?.id) {
    console.error('Erro ao buscar código do processo:', error);
    const identifier = generateIdentifierLetters(name);
    const number = await getNextSequentialNumber(`RI.PRO.${identifier}.`, 'riscos');
    return `RI.PRO.${identifier}.${number}`;
  }
   
  // Extrai as 3 letras do processo (PRO.XXX.###)
  const processIdentifier = processData.id.split('.')[1] || 'XXX';
  const number = await getNextSequentialNumber(`RI.PRO.${processIdentifier}.`, 'riscos');
  return `RI.PRO.${processIdentifier}.${number}`;
}

export async function generateControlCode(name: string, riskId: string): Promise<string> {
  // Buscar o código do risco para extrair as 3 letras identificadoras
  const { data: riskData, error } = await supabase
    .from('riscos')
    .select('codigo')
    .eq('id', riskId)
    .single();
    
  if (error || !riskData?.codigo) {
    console.error('Erro ao buscar código do risco:', error);
    const identifier = generateIdentifierLetters(name);
    const number = await getNextSequentialNumber(`CT.RI.${identifier}.`, 'kris');
    return `CT.RI.${identifier}.${number}`;
  }
  
  // Extrai as 3 letras do risco (RI.PRO.XXX.###)
  const riskIdentifier = riskData.codigo.split('.')[2] || 'XXX';
  const number = await getNextSequentialNumber(`CT.RI.${riskIdentifier}.`, 'kris');
  return `CT.RI.${riskIdentifier}.${number}`;
}

export async function generateTestCode(name: string, controlId: string): Promise<string> {
  // Buscar o código do controle para extrair as 3 letras identificadoras
  const { data: controlData, error } = await supabase
    .from('kris')
    .select('codigo')
    .eq('id', controlId)
    .single();
    
  if (error || !controlData?.codigo) {
    console.error('Erro ao buscar código do controle:', error);
    const identifier = generateIdentifierLetters(name);
    const number = await getNextSequentialNumber(`TD.CT.${identifier}.`, 'testes');
    return `TD.CT.${identifier}.${number}`;
  }
  
  // Extrai as 3 letras do controle (CT.RI.XXX.###)
  const controlIdentifier = controlData.codigo.split('.')[2] || 'XXX';
  const number = await getNextSequentialNumber(`TD.CT.${controlIdentifier}.`, 'testes');
  return `TD.CT.${controlIdentifier}.${number}`;
}

export async function generateImprovementCode(name: string): Promise<string> {
  const identifier = generateIdentifierLetters(name);
  const number = await getNextSequentialNumber(`ME.${identifier}.`, 'melhorias');
  return `ME.${identifier}.${number}`;
}
