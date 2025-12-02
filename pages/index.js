import { useState } from 'react'
import Head from 'next/head'

const SERVICOS = [
  { categoria: 'Básico', items: [
    { nome: 'Manicure', preco: 25, duracao: 60 },
    { nome: 'Pedicure', preco: 25, duracao: 60 },
    { nome: 'Esmaltação comum', preco: 15, duracao: 40 }
  ]},
  { categoria: 'Aplicação', items: [
    { nome: 'Aplicação de alongamento em gel', preco: 100, duracao: 210 },
    { nome: 'Banho em gel', preco: 70, duracao: 150 },
    { nome: 'Postiça realista', preco: 50, duracao: 120 },
    { nome: 'Blindagem', preco: 50, duracao: 90 }
  ]},
  { categoria: 'Adicionais', items: [
    { nome: 'Manutenção de alongamento em gel', preco: 75, duracao: 120 },
    { nome: 'Remoção de gel', preco: 35, duracao: 40 },
    { nome: 'Reposição', preco: 10, duracao: 30 },
    { nome: 'Troca de formato', preco: 10, duracao: 30 }
  ]},
  { categoria: 'Decoração', items: [
    { nome: 'Encapsulada (par)', preco: 12, duracao: 20 },
    { nome: 'Adesivo (par)', preco: 4, duracao: 10 },
    { nome: 'Mix de decorações', preco: 5, duracao: 15 },
    { nome: 'Hiperdecorada', preco: 10, duracao: 25 }
  ]}
]

export default function Home() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    servico: '',
    data: '',
    hora: ''
  })
  const [horariosDisponiveis, setHorariosDisponiveis] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const buscarHorarios = async () => {
    if (!formData.servico || !formData.data) return
    
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch(`/api/horarios?servico=${encodeURIComponent(formData.servico)}&data=${formData.data}`)
      const data = await response.json()
      setHorariosDisponiveis(data.horarios || [])
    } catch (err) {
      setError('Erro ao carregar horários')
    } finally {
      setLoading(false)
    }
  }

  const validarData = (data) => {
    const dia = new Date(data + 'T00:00:00')
    const diaSemana = dia.getDay()
    
    if (diaSemana === 0 || diaSemana === 1) {
      setError('Não atendemos aos domingos e segundas-feiras')
      return false
    }
    
    setError('')
    return true
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (field === 'data') validarData(value)
  }

  const nextStep = () => {
    if (step === 1 && (!formData.nome || !formData.telefone)) {
      setError('Preencha todos os campos')
      return
    }
    if (step === 2 && !formData.servico) {
      setError('Selecione um serviço')
      return
    }
    if (step === 3 && !formData.data) {
      setError('Selecione uma data')
      return
    }
    
    setError('')
    setStep(step + 1)
    
    if (step === 3) buscarHorarios()
  }

  const confirmarAgendamento = async () => {
    if (!formData.hora) {
      setError('Selecione um horário')
      return
    }
    
    setLoading(true)
    
    try {
      const response = await fetch('/api/agendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      const result = await response.json()
      
      if (response.ok) {
        setSuccess(true)
      } else {
        setError(result.error || 'Erro ao agendar')
      }
    } catch (err) {
      setError('Erro ao processar agendamento')
    } finally {
      setLoading(false)
    }
  }

  const getMinDate = () => new Date().toISOString().split('T')[0]

  if (success) {
    return (
      <>
        <Head><title>Milly Nails - Agendamento Confirmado</title></Head>
        <div style={styles.container}>
          <div style={styles.successCard}>
            <div style={styles.successIcon}>✅</div>
            <h2 style={styles.successTitle}>Agendamento Confirmado!</h2>
            <div style={styles.successInfo}>
              <p><strong>Nome:</strong> {formData.nome}</p>
              <p><strong>Serviço:</strong> {formData.servico}</p>
              <p><strong>Data:</strong> {new Date(formData.data + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
              <p><strong>Horário:</strong> {formData.hora}</p>
            </div>
            <p style={styles.successMsg}>Você receberá uma confirmação via WhatsApp em breve!</p>
            <button
              onClick={() => {
                setSuccess(false)
                setStep(1)
                setFormData({ nome: '', telefone: '', servico: '', data: '', hora: '' })
              }}
              style={styles.button}
            >
              Fazer Novo Agendamento
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Head><title>Milly Nails - Agendamento Online</title></Head>
      
      <div style={styles.page}>
        <header style={styles.header}>
          <div style={styles.headerContent}>
            <span style={styles.logo}>✨</span>
            <h1 style={styles.title}>Milly Nails</h1>
          </div>
          <p style={styles.subtitle}>Agende seu horário com praticidade</p>
        </header>

        <main style={styles.main}>
          <div style={styles.progress}>
            {[1, 2, 3, 4].map((num) => (
              <div key={num} style={styles.progressItem}>
                <div style={step >= num ? styles.progressCircleActive : styles.progressCircle}>
                  {num}
                </div>
                {num < 4 && <div style={step > num ? styles.progressLineActive : styles.progressLine} />}
              </div>
            ))}
          </div>

          <div style={styles.card}>
            {error && <div style={styles.error}>{error}</div>}

            {step === 1 && (
              <div>
                <h2 style={styles.stepTitle}>Seus Dados</h2>
                <div style={styles.formGroup}>
                  <label style={styles.label}>👤 Nome Completo</label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => handleChange('nome', e.target.value)}
                    style={styles.input}
                    placeholder="Digite seu nome"
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>📱 WhatsApp</label>
                  <input
                    type="tel"
                    value={formData.telefone}
                    onChange={(e) => handleChange('telefone', e.target.value)}
                    style={styles.input}
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <button onClick={nextStep} style={styles.button}>Continuar</button>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 style={styles.stepTitle}>Escolha o Serviço</h2>
                <div style={styles.servicesContainer}>
                  {SERVICOS.map((cat, idx) => (
                    <div key={idx} style={styles.serviceCategory}>
                      <h3 style={styles.categoryTitle}>{cat.categoria}</h3>
                      {cat.items.map((s, sidx) => (
                        <button
                          key={sidx}
                          onClick={() => handleChange('servico', s.nome)}
                          style={formData.servico === s.nome ? styles.serviceItemSelected : styles.serviceItem}
                        >
                          <div style={styles.serviceHeader}>
                            <span style={styles.serviceName}>{s.nome}</span>
                            <span style={styles.servicePrice}>R$ {s.preco}</span>
                          </div>
                          <div style={styles.serviceDuration}>{s.duracao} min</div>
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
                <div style={styles.buttonGroup}>
                  <button onClick={() => setStep(1)} style={styles.buttonSecondary}>Voltar</button>
                  <button onClick={nextStep} style={styles.button}>Continuar</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 style={styles.stepTitle}>Escolha a Data</h2>
                <div style={styles.infoBox}>
                  📅 Atendemos de Terça a Sábado, das 08:30 às 18:00
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>📆 Selecione o Dia</label>
                  <input
                    type="date"
                    value={formData.data}
                    onChange={(e) => handleChange('data', e.target.value)}
                    min={getMinDate()}
                    style={styles.input}
                  />
                </div>
                <div style={styles.buttonGroup}>
                  <button onClick={() => setStep(2)} style={styles.buttonSecondary}>Voltar</button>
                  <button onClick={nextStep} style={styles.button} disabled={!formData.data}>Continuar</button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                <h2 style={styles.stepTitle}>Escolha o Horário</h2>
                {loading ? (
                  <div style={styles.loading}>
                    <div style={styles.spinner}></div>
                    <p>Carregando horários...</p>
                  </div>
                ) : (
                  <>
                    <div style={styles.horariosGrid}>
                      {horariosDisponiveis.length > 0 ? (
                        horariosDisponiveis.map((h) => (
                          <button
                            key={h}
                            onClick={() => handleChange('hora', h)}
                            style={formData.hora === h ? styles.horarioSelected : styles.horario}
                          >
                            {h}
                          </button>
                        ))
                      ) : (
                        <p style={styles.noHorarios}>Nenhum horário disponível</p>
                      )}
                    </div>
                    <div style={styles.buttonGroup}>
                      <button onClick={() => setStep(3)} style={styles.buttonSecondary}>Voltar</button>
                      <button onClick={confirmarAgendamento} style={styles.button} disabled={!formData.hora || loading}>
                        {loading ? 'Confirmando...' : 'Confirmar Agendamento'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </main>

        <footer style={styles.footer}>
          <p>© 2024 Milly Nails - Todos os direitos reservados</p>
          <p>WhatsApp: (75) 8866-9207</p>
        </footer>
      </div>
    </>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #fdf2f8 0%, #ffffff 100%)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    background: 'white',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    borderBottom: '1px solid #fce7f3',
    padding: '1.5rem',
    marginBottom: '2rem',
  },
  headerContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
  },
  logo: { fontSize: '2rem' },
  title: {
    fontSize: '1.875rem',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: 0,
  },
  subtitle: {
    textAlign: 'center',
    color: '#6b7280',
    marginTop: '0.5rem',
  },
  main: {
    maxWidth: '1024px',
    margin: '0 auto',
    padding: '0 1rem 2rem',
  },
  progress: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    marginBottom: '2rem',
  },
  progressItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  progressCircle: {
    width: '2.5rem',
    height: '2.5rem',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    background: '#e5e7eb',
    color: '#9ca3af',
  },
  progressCircleActive: {
    width: '2.5rem',
    height: '2.5rem',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    background: '#db2777',
    color: 'white',
  },
  progressLine: {
    width: '3rem',
    height: '0.25rem',
    background: '#e5e7eb',
  },
  progressLineActive: {
    width: '3rem',
    height: '0.25rem',
    background: '#db2777',
  },
  card: {
    background: 'white',
    borderRadius: '1.5rem',
    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
    padding: '2rem',
    maxWidth: '48rem',
    margin: '0 auto',
  },
  stepTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '1.5rem',
  },
  formGroup: { marginBottom: '1rem' },
  label: {
    display: 'block',
    color: '#374151',
    fontWeight: '600',
    marginBottom: '0.5rem',
  },
  input: {
    width: '100%',
    padding: '0.75rem 1rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.75rem',
    fontSize: '1rem',
    outline: 'none',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '1rem',
    background: '#db2777',
    color: 'white',
    border: 'none',
    borderRadius: '0.75rem',
    fontSize: '1.125rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '1rem',
  },
  buttonSecondary: {
    flex: 1,
    padding: '1rem',
    background: '#e5e7eb',
    color: '#374151',
    border: 'none',
    borderRadius: '0.75rem',
    fontSize: '1.125rem',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  buttonGroup: {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '1.5rem',
  },
  error: {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#991b1b',
    padding: '0.75rem 1rem',
    borderRadius: '0.75rem',
    marginBottom: '1rem',
  },
  infoBox: {
    background: '#fdf2f8',
    border: '1px solid #fbcfe8',
    borderRadius: '0.75rem',
    padding: '1rem',
    marginBottom: '1rem',
    color: '#831843',
    fontWeight: '600',
  },
  servicesContainer: {
    maxHeight: '24rem',
    overflowY: 'auto',
    marginBottom: '1rem',
  },
  serviceCategory: { marginBottom: '1.5rem' },
  categoryTitle: {
    fontSize: '1.125rem',
    fontWeight: 'bold',
    color: '#db2777',
    marginBottom: '0.75rem',
  },
  serviceItem: {
    width: '100%',
    textAlign: 'left',
    padding: '0.75rem 1rem',
    border: '2px solid #e5e7eb',
    borderRadius: '0.75rem',
    cursor: 'pointer',
    marginBottom: '0.5rem',
    background: 'white',
  },
  serviceItemSelected: {
    width: '100%',
    textAlign: 'left',
    padding: '0.75rem 1rem',
    border: '2px solid #db2777',
    borderRadius: '0.75rem',
    cursor: 'pointer',
    marginBottom: '0.5rem',
    background: '#fdf2f8',
  },
  serviceHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceName: { fontWeight: '600', color: '#1f2937' },
  servicePrice: { color: '#db2777', fontWeight: 'bold' },
  serviceDuration: { fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' },
  horariosGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '0.75rem',
    marginBottom: '1rem',
    maxHeight: '16rem',
    overflowY: 'auto',
  },
  horario: {
    padding: '0.75rem',
    border: '2px solid #e5e7eb',
    borderRadius: '0.75rem',
    textAlign: 'center',
    fontWeight: '600',
    cursor: 'pointer',
    background: 'white',
  },
  horarioSelected: {
    padding: '0.75rem',
    border: '2px solid #db2777',
    borderRadius: '0.75rem',
    textAlign: 'center',
    fontWeight: '600',
    cursor: 'pointer',
    background: '#fdf2f8',
    color: '#be185d',
  },
  noHorarios: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    color: '#6b7280',
    padding: '2rem',
  },
  loading: { textAlign: 'center', padding: '3rem 0' },
  spinner: {
    display: 'inline-block',
    width: '3rem',
    height: '3rem',
    border: '4px solid #fce7f3',
    borderTopColor: '#db2777',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  footer: {
    textAlign: 'center',
    padding: '2rem',
    color: '#9ca3af',
    fontSize: '0.875rem',
  },
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #fdf2f8 0%, #ffffff 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
  },
  successCard: {
    background: 'white',
    borderRadius: '1.5rem',
    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
    padding: '2rem',
    maxWidth: '28rem',
    width: '100%',
    textAlign: 'center',
  },
  successIcon: { fontSize: '5rem', marginBottom: '1.5rem' },
  successTitle: {
    fontSize: '1.875rem',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '1.5rem',
  },
  successInfo: {
    background: '#fdf2f8',
    borderRadius: '1rem',
    padding: '1.5rem',
    marginBottom: '1.5rem',
    textAlign: 'left',
  },
  successMsg: { color: '#6b7280', marginBottom: '1.5rem' },
}