import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { name, email, phone, subject, message } = await req.json();

        if (!RESEND_API_KEY) {
            throw new Error("RESEND_API_KEY not set");
        }

        const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: "HG Advogados <onboarding@resend.dev>", // Usando domínio de teste do Resend inicialmente
                to: ["laelton@gmail.com"], // Em modo de teste do Resend, só podemos enviar para o email da conta
                reply_to: email, // Responder para o email do cliente
                subject: `[Contato Site] ${subject || "Novo Mensagem"}`,
                html: `
          <h1>Nova Mensagem do Site</h1>
          <p><strong>Nome:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Telefone:</strong> ${phone}</p>
          <p><strong>Assunto:</strong> ${subject}</p>
          <hr />
          <h2>Mensagem:</h2>
          <p>${message.replace(/\n/g, "<br>")}</p>
        `,
            }),
        });

        const data = await res.json();

        if (!res.ok) {
            return new Response(JSON.stringify(data), {
                status: res.status,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
        });
    }
});
