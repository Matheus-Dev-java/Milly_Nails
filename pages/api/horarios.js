import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

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
}

const INTERVALO = 20

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { servico, data } = req.query
    console.log('=== DEBUG HORARIOS ===');
  console.log('Servico:', servico);
  console.log('Data:', data);
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Configurada' : 'NÃO configurada');

    if (!servico || !data) {
      return res.status(400).json({ error: 'Serviço e data são obrigatórios' })
    }

    const diaData = new Date(data + 'T00:00:00')
    const diaSemana = diaData.getDay()
    
    if (diaSemana === 0 || diaSemana === 1) {
      return res.status(400).json({ 
        error: 'Não atendemos aos domingos e segundas-feiras',
        horarios: []
      })
    }

    const duracaoServico = SERVICOS[servico] || 60

    const result = await pool.query(
      'SELECT hora, duracao_minutos FROM agendamentos WHERE data = $1 ORDER BY hora',
      [data]
    )

    const agendamentosExistentes = result.rows
    const horariosDisponiveis = []
    const inicioMinutos = 8 * 60 + 30
    const fimMinutos = 18 * 60

    for (let minutos = inicioMinutos; minutos < fimMinutos; minutos += 30) {
      const horas = Math.floor(minutos / 60)
      const mins = minutos % 60
      const horario = `${String(horas).padStart(2, '0')}:${String(mins).padStart(2, '0')}`

      const fimAtendimento = minutos + duracaoServico + INTERVALO
      
      if (fimAtendimento > fimMinutos) continue

      let temConflito = false

      for (const agendamento of agendamentosExistentes) {
        const [h, m] = agendamento.hora.split(':').map(Number)
        const inicioAgendamento = h * 60 + m
        const fimAgendamento = inicioAgendamento + agendamento.duracao_minutos + INTERVALO

        if (
          (minutos >= inicioAgendamento && minutos < fimAgendamento) ||
          (fimAtendimento > inicioAgendamento && fimAtendimento <= fimAgendamento) ||
          (minutos <= inicioAgendamento && fimAtendimento >= fimAgendamento)
        ) {
          temConflito = true
          break
        }
      }

      if (!temConflito) {
        horariosDisponiveis.push(horario)
      }
    }

    return res.status(200).json({
      horarios: horariosDisponiveis,
      data,
      servico,
      duracao: duracaoServico
    })

  } catch (error) {
    console.error('Erro ao buscar horários:', error)
    return res.status(500).json({ 
      error: 'Erro ao buscar horários disponíveis',
      details: error.message 
    })
  }

}
