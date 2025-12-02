import { Pool } from 'pg';
import twilio from 'twilio';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export default async function handler(req, res) {
  const authHeader = req.headers.authorization;
  
  if (authHeader !== `Bearer ${process.env.CRON_SECRET || 'milly-cron-2024'}`) {
    return res.status(401).json({ error: 'Não autorizado' });
  }

  try {
    const hoje = new Date().toISOString().split('T')[0];
    
    const result = await pool.query(
      `SELECT * FROM agendamentos 
       WHERE data = $1 AND status = 'confirmado'
       ORDER BY hora ASC`,
      [hoje]
    );

    const agendamentos = result.rows;

    if (agendamentos.length === 0) {
      console.log('Nenhum agendamento para hoje');
      return res.status(200).json({
        mensagem: 'Nenhum agendamento para hoje',
        executado_em: new Date().toISOString()
      });
    }

    for (const ag of agendamentos) {
      try {
        const numeroCliente = ag.telefone.replace(/\D/g, '');
        const whatsappCliente = `whatsapp:+55${numeroCliente}`;

        const mensagem = `✨ *Milly Nails* ✨\n\nOlá ${ag.nome}! 💅\n\n🔔 Lembrete:\n\nVocê tem agendamento *hoje* às *${ag.hora}*\n💎 ${ag.servico}\n\nTe esperamos! 🌸`;

        await twilioClient.messages.create({
          from: process.env.TWILIO_NUMBER,
          to: whatsappCliente,
          body: mensagem
        });

        await pool.query(
          'INSERT INTO notificacoes (agendamento_id, tipo, status) VALUES ($1, $2, $3)',
          [ag.id, 'lembrete', 'enviado']
        );

      } catch (err) {
        console.error(`Erro ao notificar cliente ${ag.nome}:`, err);
      }
    }

    let listaAdmin = `☀️ *Bom dia!*\n\n📋 Agendamentos de hoje (${agendamentos.length}):\n\n`;
    
    agendamentos.forEach((ag, idx) => {
      listaAdmin += `${idx + 1}. ${ag.hora} - ${ag.nome}\n   ${ag.servico}\n\n`;
    });

    await twilioClient.messages.create({
      from: process.env.TWILIO_NUMBER,
      to: process.env.ADMIN_WHATSAPP,
      body: listaAdmin
    });

    return res.status(200).json({
      success: true,
      total_notificacoes: agendamentos.length,
      executado_em: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro no cron:', error);
    return res.status(500).json({ 
      error: 'Erro ao executar cron',
      details: error.message 
    });
  }
}