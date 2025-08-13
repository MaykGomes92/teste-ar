
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface InvitationRequest {
  email: string;
  nome: string;
  telefone?: string;
  cargo?: string;
  perfil?: string;
  project_id: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, nome, telefone, cargo, perfil, project_id }: InvitationRequest = await req.json();

    // Generate a secure token
    const token = crypto.randomUUID();
    
    // Get current user from auth header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Invalid authorization');
    }

    // Verify user has permission to invite to this project
    const { data: projectUser, error: permissionError } = await supabase
      .from('project_users')
      .select('role')
      .eq('project_id', project_id)
      .eq('user_id', user.id)
      .single();

    if (permissionError || !projectUser || !['admin', 'manager'].includes(projectUser.role)) {
      throw new Error('Você não tem permissão para convidar usuários para este projeto');
    }

    // Store invitation in database with additional user info
    const { error: insertError } = await supabase
      .from('user_invitations')
      .insert({
        email,
        token,
        created_by: user.id,
        project_id
      });

    if (insertError) {
      throw insertError;
    }

    // Store user profile data for when they complete registration
    const { error: profileError } = await supabase
      .from('temp_user_profiles')
      .insert({
        email,
        nome,
        telefone,
        cargo,
        perfil,
        invitation_token: token,
        project_id
      });

    if (profileError) {
      console.error('Error storing temp profile:', profileError);
      // Don't throw error here as the invitation was already created
    }

    // Create invitation URL
    const invitationUrl = `${Deno.env.get("SITE_URL") || "http://localhost:5173"}/convite/${token}`;

    // Send invitation email
    const emailResponse = await resend.emails.send({
      from: "Sistema de Gestão <noreply@orlaconsultoria.com.br>",
      to: [email],
      subject: "Convite para Sistema de Gestão de Processos - Orla Consultoria",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #7ca692;">Convite para Sistema de Gestão de Processos</h1>
          
          <p>Olá <strong>${nome}</strong>,</p>
          
          <p>Você foi convidado(a) para participar do Sistema de Gestão de Processos da Orla Consultoria.</p>
          
          <p>Para criar sua conta e definir sua senha, clique no link abaixo:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${invitationUrl}" 
               style="background-color: #7ca692; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Criar Minha Conta
            </a>
          </div>
          
          <p>Este convite é válido por 7 dias. Após esse período, será necessário solicitar um novo convite.</p>
          
          <p>Se você não conseguir clicar no botão, copie e cole o seguinte link no seu navegador:</p>
          <p style="background-color: #f5f5f5; padding: 10px; word-break: break-all; font-size: 12px;">
            ${invitationUrl}
          </p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          
          <p style="color: #666; font-size: 12px;">
            Este é um email automático. Por favor, não responda a esta mensagem.<br>
            © 2024 Orla Consultoria. Todos os direitos reservados.
          </p>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Convite enviado com sucesso!",
      invitationUrl 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-user-invitation function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
