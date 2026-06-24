const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
// Use service role key if available to bypass RLS, otherwise fallback to anon key
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Erro: VITE_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY/VITE_SUPABASE_ANON_KEY não definidos no arquivo .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Iniciando envio de relatórios financeiros...");
  
  // 1. Fetch data from Supabase
  const { data: rows, error } = await supabase
    .from('bujo_user_data')
    .select('*');
    
  if (error) {
    console.error("Erro ao buscar dados do Supabase:", error);
    process.exit(1);
  }
  
  if (!rows || rows.length === 0) {
    console.log("Nenhum dado de usuário encontrado.");
    return;
  }
  
  console.log(`Processando ${rows.length} registros de usuários...`);
  
  // 2. Setup transporter for SMTP
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT || 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  
  if (!smtpHost || !smtpUser || !smtpPass) {
    console.warn("Aviso: Configurações de SMTP (SMTP_HOST, SMTP_USER, SMTP_PASS) não estão definidas no arquivo .env. O script não pode enviar e-mails.");
    return;
  }
  
  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: parseInt(smtpPort),
    secure: parseInt(smtpPort) === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass
    }
  });

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const currentMonthName = monthNames[currentMonth];

  for (const row of rows) {
    const data = row.data || {};
    const settings = data.bujo_budget_settings || {};
    
    if (!settings.dailyReportEnabled) {
      console.log(`Relatório diário desativado para o usuário: ${row.user_id}`);
      continue;
    }
    
    const emails = settings.emails;
    if (!emails || !emails.trim()) {
      console.log(`Nenhum e-mail configurado para o usuário: ${row.user_id}`);
      continue;
    }
    
    console.log(`Gerando relatório para o usuário: ${row.user_id} -> Enviando para: ${emails}`);
    
    // Parse budget items
    const incomes = data.bujo_budget_income || [];
    const fixedBills = data.bujo_budget_fixed || [];
    const installments = data.bujo_budget_installments || [];
    const overdueDebts = data.bujo_budget_debts || [];
    const newExpenses = data.bujo_budget_new || [];
    
    // Logic to filter and compute data for the current month
    // 1. Incomes
    const currentIncomes = incomes.filter(item => {
      if (item.isCancelled) return false;
      const d = new Date(item.date);
      // Monthly recurrence is always active, seasonal only matches the month of creation
      if (item.recurrenceType === 'seasonal') {
        return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
      }
      // Monthly income is active for any month after or equal to creation month
      return d.getFullYear() < currentYear || (d.getFullYear() === currentYear && d.getMonth() <= currentMonth);
    });
    
    // 2. Fixed Bills
    const currentFixed = fixedBills.filter(item => {
      const d = new Date(item.date || item.createdAt);
      return d.getFullYear() < currentYear || (d.getFullYear() === currentYear && d.getMonth() <= currentMonth);
    });
    
    // 3. Installments
    const currentInstallments = [];
    for (const item of installments) {
      const firstDate = new Date(item.firstInstallmentDate || item.date);
      const startYear = firstDate.getFullYear();
      const startMonth = firstDate.getMonth();
      const diffMonths = (currentYear - startYear) * 12 + (currentMonth - startMonth);
      
      const totalInst = item.totalInstallments || 12;
      const alreadyPaid = item.alreadyPaidInstallmentsCount || 0;
      
      // Calculate active installments
      const currentInstNum = diffMonths + 1 + alreadyPaid;
      if (currentInstNum >= 1 && currentInstNum <= totalInst) {
        currentInstallments.push({
          ...item,
          currentInstallment: currentInstNum
        });
      }
    }
    
    // 4. Arrears
    const currentArrears = overdueDebts.filter(item => {
      const d = new Date(item.date);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });
    
    // 5. Variables
    const currentVariable = newExpenses.filter(item => {
      const d = new Date(item.date);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });
    
    // Calculate values
    const totalIncome = currentIncomes.reduce((acc, curr) => acc + curr.value, 0);
    const totalFixed = currentFixed.reduce((acc, curr) => acc + curr.value, 0);
    const totalInstallments = currentInstallments.reduce((acc, curr) => acc + curr.value, 0);
    const totalArrears = currentArrears.reduce((acc, curr) => acc + curr.value, 0);
    const totalVariable = currentVariable.reduce((acc, curr) => acc + curr.value, 0);
    
    const totalExpenses = totalFixed + totalInstallments + totalArrears + totalVariable;
    const currentBalance = totalIncome - totalExpenses;
    
    // Paid vs Unpaid
    const paidFixed = currentFixed.filter(b => b.isPaid || (b.paidMonths && b.paidMonths.includes(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`))).reduce((acc, curr) => acc + curr.value, 0);
    
    // check if specific installment is paid
    const paidInstallments = currentInstallments.filter(item => {
      const key = `${item.id}-inst-${item.currentInstallment}`;
      return item.isPaid || (item.paidInstallmentNumbers && item.paidInstallmentNumbers.includes(item.currentInstallment));
    }).reduce((acc, curr) => acc + curr.value, 0);
    
    const paidArrears = currentArrears.filter(b => b.isPaid).reduce((acc, curr) => acc + curr.value, 0);
    const paidVariable = currentVariable.filter(b => b.isPaid).reduce((acc, curr) => acc + curr.value, 0);
    
    const totalPaidExpenses = paidFixed + paidInstallments + paidArrears + paidVariable;
    const remainingToPay = totalExpenses - totalPaidExpenses;
    
    // Formulate email content
    const dateFormatted = now.toLocaleDateString('pt-BR');
    
    const html = `
      <div style="font-family: monospace; color: #e4e4e7; background-color: #09090b; padding: 24px; border-radius: 16px; max-width: 600px; margin: 0 auto; border: 1px solid #3f3f46;">
        <h2 style="color: #ec4899; text-transform: uppercase; font-size: 16px; border-bottom: 1px solid #27272a; padding-bottom: 8px; margin-top: 0;">
          📊 Resumo Financeiro - ${currentMonthName} de ${currentYear}
        </h2>
        <p style="font-size: 10px; color: #a1a1aa;">Gerado em: ${dateFormatted} às 06:00</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px;">
          <tr>
            <td style="padding: 8px 0; color: #a1a1aa;">Saldo Previsto:</td>
            <td style="text-align: right; font-weight: bold; color: ${currentBalance >= 0 ? '#10b981' : '#ef4444'};">
              R$ ${currentBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #a1a1aa;">Total Ganhos:</td>
            <td style="text-align: right; font-weight: bold; color: #10b981;">
              R$ ${totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #a1a1aa;">Total Despesas:</td>
            <td style="text-align: right; font-weight: bold; color: #ef4444;">
              R$ ${totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </td>
          </tr>
          <tr style="border-top: 1px dashed #27272a;">
            <td style="padding: 8px 0; color: #a1a1aa;">Despesas Pagas:</td>
            <td style="text-align: right; font-weight: bold; color: #ec4899;">
              R$ ${totalPaidExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #a1a1aa;">Despesas Pendentes:</td>
            <td style="text-align: right; font-weight: bold; color: #f59e0b;">
              R$ ${remainingToPay.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </td>
          </tr>
        </table>
        
        <div style="margin-top: 24px; padding: 12px; background-color: #18181b; border-radius: 8px; border: 1px solid #27272a;">
          <h4 style="color: #6366f1; margin: 0 0 8px 0; font-size: 11px; text-transform: uppercase;">⚠️ Contas Pendentes no Mês</h4>
          <ul style="margin: 0; padding-left: 16px; font-size: 11px; line-height: 1.6; color: #d4d4d8;">
            ${[
              ...currentFixed.filter(b => !(b.paidMonths && b.paidMonths.includes(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`))),
              ...currentInstallments.filter(item => !(item.paidInstallmentNumbers && item.paidInstallmentNumbers.includes(item.currentInstallment))),
              ...currentArrears.filter(b => !b.isPaid),
              ...currentVariable.filter(b => !b.isPaid)
            ].slice(0, 10).map(item => `
              <li>
                <strong>R$ ${item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong> - ${item.description} 
                ${item.dueDay ? `(Dia ${item.dueDay})` : ''}
              </li>
            `).join('') || '<li style="list-style: none; color: #10b981;">🎉 Nenhuma conta pendente!</li>'}
          </ul>
        </div>
        
        <div style="margin-top: 20px; text-align: center; font-size: 9px; color: #71717a; border-top: 1px solid #27272a; padding-top: 12px;">
          Bullet Journal Planner • Organização e Foco Mental TDAH
        </div>
      </div>
    `;
    
    try {
      await transporter.sendMail({
        from: `"${process.env.SMTP_FROM_NAME || 'Bujo Planner'}" <${smtpUser}>`,
        to: emails,
        subject: `📊 Resumo Financeiro Diário - ${dateFormatted}`,
        html: html
      });
      console.log(`Relatório enviado com sucesso para ${emails}`);
    } catch (sendError) {
      console.error(`Erro ao enviar e-mail para ${emails}:`, sendError);
    }
  }
}

run().catch(console.error);
