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
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const hoje = new Date().toISOString().split('T')[0];
    
    const result = await pool.query(
      `SELECT * FROM agendamentos 
       WHERE data = $1 
       ORDER BY hora ASC`,
      [hoje]
    );

    const agendamentos = result.rows;

    if (agendamentos.length === 0) {
      return res.status(200).json({
        mensagem: 'Nenhum agendamento para hoje',
        total: 0
      });
    }

    let listaAgendamentos = '📋 *Agendamentos de Hoje*\n\n';
    
    agendamentos.forEach((ag, index) => {
      listaAgendamentos += `${index + 1}. 🕐 ${ag.hora}\n`;
      listaAgendamentos += `   👤 ${ag.nome}\n`;
      listaAgendamentos += `   💎 ${ag.servico}\n`;
      listaAgendamentos += `   📱 ${ag.telefone}\n\n`;
    });

    listaAgendamentos += `✨ Total: ${agendamentos.length} agendamento(s)`;

    await twilioClient.messages.create({
      from: process.env.TWILIO_NUMBER,
      to: process.env.ADMIN_WHATSAPP,
      body: listaAgendamentos
    });

    return res.status(200).json({
      success: true,
      total: agendamentos.length,
      mensagem: 'Notificação enviada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao notificar:', error);
    return res.status(500).json({ 
      error: 'Erro ao enviar notificação',
      details: error.message 
    });
  }
}