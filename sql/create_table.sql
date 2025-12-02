-- Criação da tabela de agendamentos
CREATE TABLE IF NOT EXISTS agendamentos (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  servico TEXT NOT NULL,
  data DATE NOT NULL,
  hora TIME NOT NULL,
  duracao_minutos INTEGER NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'confirmado',
  UNIQUE(data, hora)
);

-- Índices para melhor performance
CREATE INDEX idx_agendamentos_data ON agendamentos(data);
CREATE INDEX idx_agendamentos_status ON agendamentos(status);
CREATE INDEX idx_agendamentos_data_hora ON agendamentos(data, hora);

-- Tabela de histórico de notificações
CREATE TABLE IF NOT EXISTS notificacoes (
  id SERIAL PRIMARY KEY,
  agendamento_id INTEGER REFERENCES agendamentos(id),
  tipo TEXT NOT NULL,
  enviado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status TEXT NOT NULL
);

-- Comentários nas tabelas
COMMENT ON TABLE agendamentos IS 'Armazena todos os agendamentos realizados';
COMMENT ON TABLE notificacoes IS 'Histórico de notificações enviadas via WhatsApp';