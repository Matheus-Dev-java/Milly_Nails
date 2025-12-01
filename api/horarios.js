import { Pool } from 'pg';

// Configuração do banco de dados
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Tabela de serviços com durações (em minutos)
const SERVICOS = {
  'Manicure': 60,
  'Pedicure': 60,
  'Esmaltação comum': 40,
  'Aplicação de alongamento em gel': 210,
  'Banho em gel': 150,
  'Postiça realista': 120,
  'Blindagem': 90,
  'Manutenção de alongamento em gel': 120,
  'Remoção de gel': 40,
  'Reposição': 30,
  'Troca de formato': 30,
  'Encapsulada (par)': 20,
  'Adesivo (par)': 10,
  'Mix de decorações': 15,
  'Hiperdecorada': 25
};

const INTERVALO_ENTRE_ATENDIMENTOS = 20; // minutos

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { servico, data } = req.query;

    if (!servico || !data) {
      return res.status(400).json({ error: 'Serviço e data são obrigatórios' });
    }

    // Validar dia da semana
    const diaData = new Date(data + 'T00:00:00');
    const diaSemana = diaData.getDay();
    
    if (diaSemana === 0 || diaSemana === 1) {
      return res.status(400).json({ 
        error: 'Não atendemos aos domingos e segundas-feiras',
        horarios: []
      });
    }

    // Obter duração do serviço selecionado
    const duracaoServico = SERVICOS[servico] || 60;

    // Buscar agendamentos existentes para o dia
    const result = await pool.query(
      'SELECT hora, duracao_minutos FROM agendamentos WHERE data = $1 ORDER BY hora',
      [data]
    );

    const agendamentosExistentes = result.rows;

    // Gerar todos os horários possíveis (08:30 - 18:00)
    const horariosDisponiveis = [];
    const inicioMinutos = 8 * 60 + 30; // 08:30 em minutos
    const fimMinutos = 18 * 60; // 18:00 em minutos

    for (let minutos = inicioMinutos; minutos < fimMinutos; minutos += 30) {
      const horas = Math.floor(minutos / 60);
      const mins = minutos % 60;
      const horario = `${String(horas).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;

      // Verificar se o horário + duração do serviço + intervalo cabe no horário de funcionamento
      const fimAtendimento = minutos + duracaoServico + INTERVALO_ENTRE_ATENDIMENTOS;
      
      if (fimAtendimento > fimMinutos) {
        continue; // Horário muito tarde para este serviço
      }

      // Verificar conflitos com agendamentos existentes
      let temConflito = false;

      for (const agendamento of agendamentosExistentes) {
        const [h, m] = agendamento.hora.split(':').map(Number);
        const inicioAgendamento = h * 60 + m;
        const fimAgendamento = inicioAgendamento + agendamento.duracao_minutos + INTERVALO_ENTRE_ATENDIMENTOS;

        // Verificar se há sobreposição
        if (
          (minutos >= inicioAgendamento && minutos < fimAgendamento) ||
          (fimAtendimento > inicioAgendamento && fimAtendimento <= fimAgendamento) ||
          (minutos <= inicioAgendamento && fimAtendimento >= fimAgendamento)
        ) {
          temConflito = true;
          break;
        }
      }

      if (!temConflito) {
        horariosDisponiveis.push(horario);
      }
    }

    return res.status(200).json({
      horarios: horariosDisponiveis,
      data,
      servico,
      duracao: duracaoServico
    });

  } catch (error) {
    console.error('Erro ao buscar horários:', error);
    return res.status(500).json({ 
      error: 'Erro ao buscar horários disponíveis',
      details: error.message 
    });
  }
}