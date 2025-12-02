import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { data } = req.query;
    
    const dataConsulta = data || new Date().toISOString().split('T')[0];

    const result = await pool.query(
      `SELECT id, nome, telefone, servico, data, hora, duracao_minutos, status 
       FROM agendamentos 
       WHERE data = $1 
       ORDER BY hora ASC`,
      [dataConsulta]
    );

    return res.status(200).json({
      data: dataConsulta,
      total: result.rows.length,
      agendamentos: result.rows
    });

  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error);
    return res.status(500).json({ 
      error: 'Erro ao buscar agendamentos do dia',
      details: error.message 
    });
  }
}