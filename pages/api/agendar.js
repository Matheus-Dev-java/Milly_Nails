import { Pool } from 'pg'
import twilio from 'twilio'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { nome, telefone, servico, data, hora } = req.body

    if (!nome || !telefone || !servico || !data || !hora) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' })
    }

  const diaData = new Date(data + 'T00:00:00')
    const diaSemana = diaData.getDay()
    
    if (diaSemana === 0 || diaSemana === 1) {
      return res.status(400).json({ 
        error: 'Não atendemos aos domingos e segundas-feiras'
      })
    }

    const duracaoMinutos = SERVICOS[servico] || 60

    const checkQuery = await pool.query(
      'SELECT * FROM agendamentos WHERE data = $1 AND hora = $2',
      [data, hora]
    )

    if (checkQuery.rows.length > 0) {
      return res.status(409).json({ error: 'Horário não disponível' })
    }

    const insertResult = await pool.query(
      `INSERT INTO agendamentos (nome, telefone, servico, data, hora, duracao_minutos) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [nome, telefone, servico, data, hora, duracaoMinutos]
    )

    const agendamento = insertResult.rows[0]

    try {
      const dataFormatada = new Date(data + 'T00:00:00').toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })

      const mensagemCliente = `✨ *Milly Nails* ✨\n\nOlá ${nome}! 💅\n\nSeu agendamento foi confirmado:\n\n📅 ${dataFormatada}\n🕐 ${hora}\n💎 ${servico}\n\nNos vemos em breve! 🌸`

      const numeroCliente = telefone.replace(/\D/g, '')
      const whatsappCliente = `whatsapp:+55${numeroCliente}`

      await twilioClient.messages.create({
        from: process.env.TWILIO_NUMBER,
        to: whatsappCliente,
        body: mensagemCliente
      })

      const mensagemAdmin = `🔔 *Novo Agendamento*\n\n👤 Cliente: ${nome}\n📱 Tel: ${telefone}\n💎 Serviço: ${servico}\n📅 Data: ${dataFormatada}\n🕐 Horário: ${hora}`

      await twilioClient.messages.create({
        from: process.env.TWILIO_NUMBER,
        to: process.env.ADMIN_WHATSAPP,
        body: mensagemAdmin
      })

    } catch (twilioError) {
      console.error('Erro ao enviar WhatsApp:', twilioError)
    }

    return res.status(201).json({
      success: true,
      agendamento,
      mensagem: 'Agendamento realizado com sucesso!'
    })

  } catch (error) {
    console.error('Erro ao agendar:', error)
    return res.status(500).json({ 
      error: 'Erro ao processar agendamento',
      details: error.message 
    })
  }

}

