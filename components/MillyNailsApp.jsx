import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Phone, User, Sparkles, Check } from 'lucide-react';

// CONFIGURAÇÃO - SERVIÇOS E PREÇOS
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
];

// COMPONENTE PRINCIPAL
export default function MillyNailsApp() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    servico: '',
    data: '',
    hora: ''
  });
  const [horariosDisponiveis, setHorariosDisponiveis] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Função para buscar horários disponíveis
  const buscarHorarios = async () => {
    if (!formData.servico || !formData.data) return;
    
    setLoading(true);
    setError('');
    
    try {
      // Chamada real à API
      const response = await fetch(`/api/horarios?servico=${encodeURIComponent(formData.servico)}&data=${formData.data}`);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar horários');
      }
      
      const data = await response.json();
      setHorariosDisponiveis(data.horarios || gerarHorariosSimulados());
    } catch (err) {
      console.error('Erro ao buscar horários:', err);
      // Fallback para horários simulados se API falhar
      setHorariosDisponiveis(gerarHorariosSimulados());
    } finally {
      setLoading(false);
    }
  };

  // Gerar horários simulados (fallback)
  const gerarHorariosSimulados = () => {
    const horarios = [];
    const inicio = 8.5; // 08:30
    const fim = 18; // 18:00
    
    for (let h = inicio; h < fim; h += 0.5) {
      const horas = Math.floor(h);
      const minutos = (h % 1) * 60;
      horarios.push(`${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`);
    }
    
    return horarios;
  };

  // Validar data selecionada
  const validarData = (data) => {
    const dia = new Date(data + 'T00:00:00');
    const diaSemana = dia.getDay();
    
    // 0 = Domingo, 1 = Segunda
    if (diaSemana === 0 || diaSemana === 1) {
      setError('Não atendemos aos domingos e segundas-feiras');
      return false;
    }
    
    setError('');
    return true;
  };

  // Atualizar campo do formulário
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'data') {
      validarData(value);
    }
  };

  // Avançar para próxima etapa
  const nextStep = () => {
    if (step === 1 && (!formData.nome || !formData.telefone)) {
      setError('Preencha todos os campos');
      return;
    }
    
    if (step === 2 && !formData.servico) {
      setError('Selecione um serviço');
      return;
    }
    
    if (step === 3 && !formData.data) {
      setError('Selecione uma data');
      return;
    }
    
    setError('');
    setStep(step + 1);
    
    if (step === 3) {
      buscarHorarios();
    }
  };

  // Confirmar agendamento
  const confirmarAgendamento = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/agendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setSuccess(true);
      } else {
        setError(result.error || 'Erro ao agendar');
      }
    } catch (err) {
      console.error('Erro ao agendar:', err);
      setError('Erro ao processar agendamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Obter data mínima (hoje)
  const getMinDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // TELA DE SUCESSO
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-pink-600" />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Agendamento Confirmado!
          </h2>
          
          <div className="bg-pink-50 rounded-2xl p-6 mb-6 text-left">
            <p className="text-gray-700 mb-2"><strong>Nome:</strong> {formData.nome}</p>
            <p className="text-gray-700 mb-2"><strong>Serviço:</strong> {formData.servico}</p>
            <p className="text-gray-700 mb-2"><strong>Data:</strong> {new Date(formData.data + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
            <p className="text-gray-700"><strong>Horário:</strong> {formData.hora}</p>
          </div>
          
          <p className="text-gray-600 mb-6">
            Você receberá uma confirmação via WhatsApp em breve!
          </p>
          
          <button
            onClick={() => {
              setSuccess(false);
              setStep(1);
              setFormData({ nome: '', telefone: '', servico: '', data: '', hora: '' });
            }}
            className="w-full bg-pink-600 text-white py-3 rounded-xl hover:bg-pink-700 transition-colors font-semibold"
          >
            Fazer Novo Agendamento
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white">
      {/* HEADER */}
      <header className="bg-white shadow-sm border-b border-pink-100">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center gap-3">
            <Sparkles className="w-8 h-8 text-pink-600" />
            <h1 className="text-3xl font-bold text-gray-800">Milly Nails</h1>
          </div>
          <p className="text-center text-gray-600 mt-2">Agende seu horário com praticidade</p>
        </div>
      </header>

      {/* PROGRESS BAR */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3, 4].map((num) => (
            <div key={num} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                step >= num ? 'bg-pink-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {num}
              </div>
              {num < 4 && (
                <div className={`w-12 h-1 ${step > num ? 'bg-pink-600' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* CONTEÚDO */}
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-2xl mx-auto">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
              {error}
            </div>
          )}

          {/* STEP 1: DADOS PESSOAIS */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Seus Dados</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    <User className="inline w-5 h-5 mr-2" />
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => handleChange('nome', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="Digite seu nome"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    <Phone className="inline w-5 h-5 mr-2" />
                    WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={formData.telefone}
                    onChange={(e) => handleChange('telefone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>

              <button
                onClick={nextStep}
                className="w-full mt-6 bg-pink-600 text-white py-4 rounded-xl hover:bg-pink-700 transition-colors font-bold text-lg"
              >
                Continuar
              </button>
            </div>
          )}

          {/* STEP 2: ESCOLHA DO SERVIÇO */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Escolha o Serviço</h2>
              
              <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
                {SERVICOS.map((categoria, idx) => (
                  <div key={idx}>
                    <h3 className="text-lg font-bold text-pink-600 mb-3">{categoria.categoria}</h3>
                    <div className="space-y-2">
                      {categoria.items.map((servico, sidx) => (
                        <button
                          key={sidx}
                          onClick={() => handleChange('servico', servico.nome)}
                          className={`w-full text-left px-4 py-3 border-2 rounded-xl transition-all ${
                            formData.servico === servico.nome
                              ? 'border-pink-600 bg-pink-50'
                              : 'border-gray-200 hover:border-pink-300'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-gray-800">{servico.nome}</span>
                            <span className="text-pink-600 font-bold">R$ {servico.preco}</span>
                          </div>
                          <span className="text-sm text-gray-500">{servico.duracao} min</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-xl hover:bg-gray-300 transition-colors font-bold"
                >
                  Voltar
                </button>
                <button
                  onClick={nextStep}
                  className="flex-1 bg-pink-600 text-white py-4 rounded-xl hover:bg-pink-700 transition-colors font-bold"
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: ESCOLHA DA DATA */}
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Escolha a Data</h2>
              
              <div className="mb-4 bg-pink-50 border border-pink-200 rounded-xl p-4">
                <p className="text-sm text-pink-800 font-semibold">
                  📅 Atendemos de Terça a Sábado, das 08:30 às 18:00
                </p>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  <Calendar className="inline w-5 h-5 mr-2" />
                  Selecione o Dia
                </label>
                <input
                  type="date"
                  value={formData.data}
                  onChange={(e) => handleChange('data', e.target.value)}
                  min={getMinDate()}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-xl hover:bg-gray-300 transition-colors font-bold"
                >
                  Voltar
                </button>
                <button
                  onClick={nextStep}
                  disabled={!formData.data}
                  className="flex-1 bg-pink-600 text-white py-4 rounded-xl hover:bg-pink-700 transition-colors font-bold disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: ESCOLHA DO HORÁRIO */}
          {step === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Escolha o Horário</h2>
              
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-pink-600 border-t-transparent"></div>
                  <p className="mt-4 text-gray-600">Carregando horários...</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                    {horariosDisponiveis.map((hora) => (
                      <button
                        key={hora}
                        onClick={() => handleChange('hora', hora)}
                        className={`py-3 px-4 border-2 rounded-xl font-semibold transition-all ${
                          formData.hora === hora
                            ? 'border-pink-600 bg-pink-50 text-pink-700'
                            : 'border-gray-200 hover:border-pink-300 text-gray-700'
                        }`}
                      >
                        {hora}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setStep(3)}
                      className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-xl hover:bg-gray-300 transition-colors font-bold"
                    >
                      Voltar
                    </button>
                    <button
                      onClick={confirmarAgendamento}
                      disabled={!formData.hora || loading}
                      className="flex-1 bg-pink-600 text-white py-4 rounded-xl hover:bg-pink-700 transition-colors font-bold disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Confirmando...' : 'Confirmar Agendamento'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <footer className="text-center py-8 text-gray-500 text-sm">
        <p>© 2024 Milly Nails - Todos os direitos reservados</p>
        <p className="mt-2">WhatsApp: (75) 8866-9207</p>
      </footer>
    </div>
  );
}