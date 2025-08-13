import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface DiagnosticRequest {
  nomeCompleto: string;
  empresa: string;
  cargo: string;
  email: string;
  telefone: string;
  areaInteresse: string;
  mensagem?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: DiagnosticRequest = await req.json();

    // Criar o conteúdo do e-mail
    const emailContent = `
      <h2>Nova Solicitação de Diagnóstico - Orla Consultoria</h2>
      
      <p>Olá pessoal!</p>
      
      <p>Temos uma nova solicitação de diagnóstico através do site. Seguem os dados:</p>
      
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #333;">Dados do Solicitante</h3>
        <p><strong>Nome:</strong> ${requestData.nomeCompleto}</p>
        <p><strong>Empresa:</strong> ${requestData.empresa}</p>
        <p><strong>Cargo:</strong> ${requestData.cargo}</p>
        <p><strong>E-mail:</strong> ${requestData.email}</p>
        <p><strong>Telefone:</strong> ${requestData.telefone}</p>
        <p><strong>Área de Interesse:</strong> ${requestData.areaInteresse}</p>
        ${requestData.mensagem ? `<p><strong>Mensagem:</strong><br>${requestData.mensagem}</p>` : ''}
      </div>
      
      <p>Lembrem-se: prometemos retornar em até 24 horas! 😊</p>
      
      <p>Boa sorte com o novo contato!</p>
      
      <p style="margin-top: 30px; font-size: 12px; color: #666;">
        Esta mensagem foi enviada automaticamente pelo sistema de solicitação de diagnóstico da Orla Consultoria.
      </p>
    `;

    // Enviar e-mail para a equipe da Orla
    const emailResponse = await resend.emails.send({
      from: "Sistema Orla <onboarding@resend.dev>",
      to: ["guilherme.carvalho@orlaconsultoria.com.br", "tatianarangel@orlaconsultoria.com.br"],
      subject: `Nova Solicitação de Diagnóstico - ${requestData.empresa}`,
      html: emailContent,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-diagnostic-request function:", error);
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