# 💅 Milly Nails - Sistema de Agendamento

Sistema completo de agendamento online com:
- Frontend React/Next.js responsivo
- Backend serverless (Vercel Functions)
- Banco PostgreSQL
- Notificações WhatsApp via Twilio
- Cron job diário às 08:00
- https://milly-nails-jo81.vercel.app/

## 🚀 Deploy Rápido

### 1. Configurar Banco de Dados

**Opção A: Supabase (Recomendado)**
1. Acesse https://supabase.com
2. Crie um novo projeto
3. Vá em SQL Editor
4. Execute o script `sql/create_tables.sql`
5. Copie a Connection String em Settings > Database

**Opção B: PostgreSQL próprio**
1. Execute `sql/create_tables.sql` no seu banco
2. Configure a URL de conexão

### 2. Deploy na Vercel
```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer deploy
vercel

# Configurar variáveis de ambiente
vercel env add TWILIO_ACCOUNT_SID
vercel env add TWILIO_AUTH_TOKEN
vercel env add TWILIO_NUMBER
vercel env add ADMIN_WHATSAPP
vercel env add DATABASE_URL
vercel env add CRON_SECRET

# Deploy em produção
vercel --prod
```

### 3. Variáveis de Ambiente

Copie `.env.example` para `.env.local` e preencha:
```env
TWILIO_ACCOUNT_SID=*******************
TWILIO_AUTH_TOKEN=*******************
TWILIO_NUMBER=whatsapp:*******************
ADMIN_WHATSAPP=whatsapp:*******************
DATABASE_URL=*******************
CRON_SECRET=*******************
```

## 📋 Funcionalidades

✅ Agendamento online com validação de conflitos
✅ Cálculo automático de horários disponíveis
✅ Bloqueio de domingos e segundas
✅ Intervalo de 20min entre atendimentos
✅ Notificações WhatsApp automáticas
✅ Lembretes diários às 08:00
✅ Interface rosa e branco
✅ Totalmente responsivo

## 🛠️ Tecnologias

- **Frontend**: Next.js 14, React 18, TailwindCSS
- **Backend**: Node.js, Vercel Serverless Functions
- **Banco**: PostgreSQL / Supabase
- **Notificações**: Twilio WhatsApp API
- **Deploy**: Vercel (com cron jobs)

## 📱 APIs Disponíveis

- `GET /api/horarios?servico=X&data=Y` - Horários disponíveis
- `POST /api/agendar` - Criar agendamento
- `GET /api/diario?data=Y` - Agendamentos do dia
- `GET /api/whatsapp-notificar` - Enviar notificações
- `GET /api/cron-trigger` - Cron automático (08:00)

## 🕒 Regras de Funcionamento

- **Dias**: Terça a Sábado
- **Horário**: 08:30 - 18:00
- **Intervalo**: 20 minutos entre atendimentos
- **Bloqueados**: Domingos e Segundas

## 💰 Serviços e Preços

### Básico
- Manicure: R$ 25 (1h)
- Pedicure: R$ 25 (1h)
- Esmaltação: R$ 15 (40min)

### Aplicação
- Unha em gel: R$ 100 (3h30)
- Banho em gel: R$ 70 (2h30)
- Postiça realista: R$ 50 (2h)
- Blindagem: R$ 50 (1h30)

### Adicionais
- Manutenção: R$ 75 (2h)
- Remoção: R$ 35 (40min)

### Decoração
- Encapsulada: R$ 12
- Adesivo: R$ 4
- Mix: R$ 5
- Hiperdecorada: R$ 10

## 📞 Suporte

WhatsApp: (75) 8866-9207

---


Desenvolvido por Matheus Costa




