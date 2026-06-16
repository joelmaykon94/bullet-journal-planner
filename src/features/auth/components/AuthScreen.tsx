import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useBujo } from '../../../context/BujoContext';
import { CheckSquare, Mail, Lock, ShieldAlert, Sparkles, Settings, ArrowLeft, Eye, EyeOff, Check, X, ShieldCheck } from 'lucide-react';

const GoogleIcon = () => (
  <svg className="w-4 h-4 mr-2.5 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
  </svg>
);

export const AuthScreen = () => {
  const {
    needsConfig,
    configError,
    signIn,
    signUp,
    resetPassword,
    updatePassword,
    signInWithGoogle,
    setOfflineMode
  } = useAuth();

  const { showToast } = useBujo();

  // Screen modes: 'login' | 'signup' | 'forgot' | 'recovery'
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'recovery'>('login');
  
  // Inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Detect recovery mode from URL
  useEffect(() => {
    const handleUrlParsing = () => {
      const hash = window.location.hash || '';
      const search = window.location.search || '';
      
      if (hash.includes('type=recovery') || search.includes('type=recovery') || hash.includes('access_token')) {
        setMode('recovery');
        showToast('🔑 Redirecionado! Por favor, insira sua nova senha.');
      }
    };

    handleUrlParsing();
    window.addEventListener('hashchange', handleUrlParsing);
    return () => window.removeEventListener('hashchange', handleUrlParsing);
  }, []);

  // Password Validation Metrics
  const passwordCriteria = {
    length: password.length >= 8,
    number: /[0-9]/.test(password),
    upper: /[A-Z]/.test(password),
    special: /[^A-Za-z0-9]/.test(password)
  };
  const passedCriteriaCount = Object.values(passwordCriteria).filter(Boolean).length;
  const passwordStrengthText = 
    passedCriteriaCount === 4 ? 'Forte 💪' :
    passedCriteriaCount === 3 ? 'Média 👍' :
    passedCriteriaCount === 2 ? 'Fraca ⚠️' : 'Muito Fraca 🚨';

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (needsConfig) {
      showToast('⚠️ Erro: Banco de dados não configurado no .env!');
      return;
    }
    if (!email.trim() || !password) {
      showToast('⚠️ Preencha todos os campos!');
      return;
    }

    setActionLoading(true);
    const { error } = await signIn(email.trim(), password);
    setActionLoading(false);

    if (error) {
      showToast(`❌ Erro no login: ${error.message || 'Credenciais inválidas'}`);
    } else {
      showToast('👋 Bem-vindo ao BuJo Focus!');
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (needsConfig) {
      showToast('⚠️ Erro: Banco de dados não configurado no .env!');
      return;
    }
    if (!email.trim() || !password || !confirmPassword) {
      showToast('⚠️ Preencha todos os campos!');
      return;
    }
    if (password !== confirmPassword) {
      showToast('⚠️ As senhas não coincidem!');
      return;
    }
    if (passedCriteriaCount < 3) {
      showToast('⚠️ A senha deve atender a pelo menos 3 critérios de segurança!');
      return;
    }

    setActionLoading(true);
    const { error } = await signUp(email.trim(), password);
    setActionLoading(false);

    if (error) {
      showToast(`❌ Erro no cadastro: ${error.message}`);
    } else {
      showToast('✉️ Link de confirmação enviado para o seu e-mail!');
      setMode('login');
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      showToast('⚠️ Digite seu e-mail!');
      return;
    }

    setActionLoading(true);
    const { error } = await resetPassword(email.trim());
    setActionLoading(false);

    if (error) {
      showToast(`❌ Erro ao enviar: ${error.message}`);
    } else {
      showToast('✉️ E-mail de recuperação enviado com sucesso!');
      setMode('login');
    }
  };

  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      showToast('⚠️ Preencha todos os campos!');
      return;
    }
    if (password !== confirmPassword) {
      showToast('⚠️ As senhas não coincidem!');
      return;
    }
    if (passedCriteriaCount < 3) {
      showToast('⚠️ A senha deve atender a pelo menos 3 critérios de segurança!');
      return;
    }

    setActionLoading(true);
    const { error } = await updatePassword(password);
    setActionLoading(false);

    if (error) {
      showToast(`❌ Erro ao atualizar: ${error.message}`);
    } else {
      showToast('🔒 Senha atualizada com sucesso! Redirecionando...');
      window.location.hash = '';
      window.location.search = '';
      setMode('login');
    }
  };

  const handleGoogleLogin = async () => {
    setActionLoading(true);
    const { error } = await signInWithGoogle();
    setActionLoading(false);
    
    if (error) {
      showToast(`❌ Erro Google Auth: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] dark:bg-zinc-950 flex items-center justify-center p-4 relative overflow-hidden font-mono select-none">
      
      {/* Background Ornaments */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-bujo-highlight/5 dark:bg-bujo-highlight/3 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-bujo-accent/5 dark:bg-bujo-accent/3 blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-md w-full bg-zinc-200/20 dark:bg-zinc-900/30 border border-zinc-200/30 dark:border-white/5 p-6 md:p-8 rounded-[32px] shadow-2xl backdrop-blur-md relative z-10 flex flex-col gap-6">
        
        {/* Header Section */}
        <div className="flex flex-col items-center text-center gap-2 relative">
          <div className="p-3 rounded-full bg-bujo-highlight/10 border border-bujo-highlight/20 text-bujo-highlight shadow-sm">
            <CheckSquare className="w-8 h-8" />
          </div>

          <h1 className="text-xl font-bold tracking-tight text-bujo-text mt-1">BuJo Focus</h1>
          <p className="text-[10px] text-zinc-550 uppercase tracking-widest">
            {mode === 'login' && 'Transformando o caos em foco'}
            {mode === 'signup' && 'Criar Nova Conta'}
            {mode === 'forgot' && 'Recuperar Acesso'}
            {mode === 'recovery' && 'Redefinir Senha'}
          </p>
        </div>

        {needsConfig && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[11px] leading-relaxed flex gap-2.5 items-start">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <strong>Configuração Necessária:</strong> O banco de dados (Supabase) não foi configurado corretamente no arquivo <code>.env</code>. O login e sincronização estão desabilitados.
            </div>
          </div>
        )}

        {/* 2. LOGIN MODE */}

        {mode === 'login' && (
          <div className="flex flex-col gap-5">
            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10.5px] font-bold text-zinc-500 uppercase pl-1">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="email"
                    placeholder="email@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-zinc-250/20 dark:bg-white/5 border border-zinc-200/30 dark:border-white/10 text-bujo-text placeholder-zinc-500 focus:outline-none focus:border-bujo-highlight/50 transition-all font-sans"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between pl-1">
                  <label className="text-[10.5px] font-bold text-zinc-500 uppercase">Senha</label>
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[9px] font-bold text-bujo-highlight hover:underline"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Sua senha secreta"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl bg-zinc-250/20 dark:bg-white/5 border border-zinc-200/30 dark:border-white/10 text-bujo-text placeholder-zinc-500 focus:outline-none focus:border-bujo-highlight/50 transition-all font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-bujo-text cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full py-3 bg-bujo-highlight text-white text-xs font-bold rounded-2xl hover:opacity-95 shadow-md shadow-bujo-highlight/15 transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2 disabled:opacity-50"
              >
                {actionLoading ? 'Verificando...' : 'Entrar na Conta'}
              </button>
            </form>

            {/* Separator */}
            <div className="flex items-center gap-3">
              <div className="h-[1px] bg-zinc-200/50 dark:bg-white/5 flex-1" />
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest shrink-0">Ou</span>
              <div className="h-[1px] bg-zinc-200/50 dark:bg-white/5 flex-1" />
            </div>

            {/* Google Authentication */}
            <button
              onClick={handleGoogleLogin}
              disabled={actionLoading}
              className="w-full py-3 bg-white hover:bg-zinc-50 border border-zinc-250/50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 text-zinc-700 dark:text-zinc-200 text-xs font-bold rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
            >
              <GoogleIcon />
              Entrar com Google
            </button>

            <button
              type="button"
              onClick={() => {
                setOfflineMode(true);
                showToast('📴 Modo offline ativado localmente!');
              }}
              className="w-full py-3 bg-zinc-200/40 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 text-xs font-bold rounded-2xl hover:bg-zinc-200/60 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Usar Modo Offline (Sem Nuvem)
            </button>

            {/* Change tab footer */}
            <div className="text-center text-[10.5px] text-zinc-500 font-sans mt-1">
              Não tem uma conta?{' '}
              <button
                onClick={() => setMode('signup')}
                className="font-bold text-bujo-highlight hover:underline font-mono"
              >
                Cadastre-se
              </button>
            </div>
          </div>
        )}

        {/* 3. SIGNUP MODE */}
        {mode === 'signup' && (
          <form onSubmit={handleSignUpSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10.5px] font-bold text-zinc-500 uppercase pl-1">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="email"
                  placeholder="email@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-zinc-250/20 dark:bg-white/5 border border-zinc-200/30 dark:border-white/10 text-bujo-text placeholder-zinc-500 focus:outline-none focus:border-bujo-highlight/50 transition-all font-sans"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10.5px] font-bold text-zinc-500 uppercase pl-1">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 8 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl bg-zinc-250/20 dark:bg-white/5 border border-zinc-200/30 dark:border-white/10 text-bujo-text placeholder-zinc-500 focus:outline-none focus:border-bujo-highlight/50 transition-all font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-bujo-text cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {password.length > 0 && (
                <div className="flex flex-col gap-1 mt-1 pl-1">
                  <div className="flex items-center justify-between text-[8px] uppercase tracking-wider font-bold">
                    <span className="text-zinc-500">Força da Senha:</span>
                    <span className={
                      passedCriteriaCount === 4 ? 'text-emerald-500' :
                      passedCriteriaCount === 3 ? 'text-teal-500' :
                      passedCriteriaCount === 2 ? 'text-amber-500' : 'text-red-500'
                    }>{passwordStrengthText}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 h-1 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden mt-0.5">
                    <div className={`h-full rounded-full transition-all ${passedCriteriaCount >= 1 ? (passedCriteriaCount === 1 ? 'bg-red-500' : passedCriteriaCount === 2 ? 'bg-amber-500' : passedCriteriaCount === 3 ? 'bg-teal-500' : 'bg-emerald-500') : ''}`} />
                    <div className={`h-full rounded-full transition-all ${passedCriteriaCount >= 2 ? (passedCriteriaCount === 2 ? 'bg-amber-500' : passedCriteriaCount === 3 ? 'bg-teal-500' : 'bg-emerald-500') : ''}`} />
                    <div className={`h-full rounded-full transition-all ${passedCriteriaCount >= 3 ? (passedCriteriaCount === 3 ? 'bg-teal-500' : 'bg-emerald-500') : ''}`} />
                    <div className={`h-full rounded-full transition-all ${passedCriteriaCount === 4 ? 'bg-emerald-500' : ''}`} />
                  </div>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 mt-1.5 text-[8.5px] text-zinc-500">
                    <div className="flex items-center gap-1">
                      {passwordCriteria.length ? <Check className="w-2.5 h-2.5 text-emerald-500" /> : <X className="w-2.5 h-2.5 text-zinc-400" />}
                      8+ caracteres
                    </div>
                    <div className="flex items-center gap-1">
                      {passwordCriteria.number ? <Check className="w-2.5 h-2.5 text-emerald-500" /> : <X className="w-2.5 h-2.5 text-zinc-400" />}
                      Pelo menos um número
                    </div>
                    <div className="flex items-center gap-1">
                      {passwordCriteria.upper ? <Check className="w-2.5 h-2.5 text-emerald-500" /> : <X className="w-2.5 h-2.5 text-zinc-400" />}
                      Letra maiúscula
                    </div>
                    <div className="flex items-center gap-1">
                      {passwordCriteria.special ? <Check className="w-2.5 h-2.5 text-emerald-500" /> : <X className="w-2.5 h-2.5 text-zinc-400" />}
                      Caractere especial
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10.5px] font-bold text-zinc-500 uppercase pl-1">Confirmar Senha</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="password"
                  placeholder="Repita sua senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-zinc-250/20 dark:bg-white/5 border border-zinc-200/30 dark:border-white/10 text-bujo-text placeholder-zinc-500 focus:outline-none focus:border-bujo-highlight/50 transition-all font-sans"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={actionLoading}
              className="w-full py-3 bg-bujo-highlight text-white text-xs font-bold rounded-2xl hover:opacity-95 shadow-md shadow-bujo-highlight/15 transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2 disabled:opacity-50"
            >
              {actionLoading ? 'Cadastrando...' : 'Confirmar Cadastro'}
            </button>

            <div className="text-center text-[10.5px] text-zinc-500 font-sans mt-2">
              Já tem uma conta?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="font-bold text-bujo-highlight hover:underline font-mono"
              >
                Faça Login
              </button>
            </div>
          </form>
        )}

        {/* 4. FORGOT PASSWORD MODE */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgotSubmit} className="flex flex-col gap-4">
            <div className="p-3.5 rounded-2xl bg-zinc-200/30 dark:bg-white/5 border border-zinc-200/20 dark:border-white/10 text-zinc-550 text-[11px] leading-relaxed">
              Digite seu e-mail de acesso. Se a conta existir, enviaremos um link seguro para você redefinir sua senha.
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10.5px] font-bold text-zinc-500 uppercase pl-1">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="email"
                  placeholder="email@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-zinc-250/20 dark:bg-white/5 border border-zinc-200/30 dark:border-white/10 text-bujo-text placeholder-zinc-500 focus:outline-none focus:border-bujo-highlight/50 transition-all font-sans"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={actionLoading}
              className="w-full py-3 bg-bujo-highlight text-white text-xs font-bold rounded-2xl hover:opacity-95 shadow-md shadow-bujo-highlight/15 transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2 disabled:opacity-50"
            >
              {actionLoading ? 'Enviando...' : 'Recuperar Acesso'}
            </button>

            <button
              type="button"
              onClick={() => setMode('login')}
              className="w-full py-3 bg-zinc-200/40 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 text-xs font-bold rounded-2xl hover:bg-zinc-200/60 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Voltar ao Login
            </button>
          </form>
        )}

        {/* 5. PASSWORD RECOVERY / NEW PASSWORD MODE */}
        {mode === 'recovery' && (
          <form onSubmit={handleRecoverySubmit} className="flex flex-col gap-4">
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] leading-relaxed flex gap-2.5 items-start">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <strong>Acesso liberado!</strong> Digite e confirme sua nova senha abaixo para salvar e restaurar seu login.
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10.5px] font-bold text-zinc-500 uppercase pl-1">Nova Senha</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Nova senha (mínimo 8 caracteres)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl bg-zinc-250/20 dark:bg-white/5 border border-zinc-200/30 dark:border-white/10 text-bujo-text placeholder-zinc-500 focus:outline-none focus:border-bujo-highlight/50 transition-all font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-bujo-text cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {password.length > 0 && (
                <div className="flex flex-col gap-1 mt-1 pl-1">
                  <div className="flex items-center justify-between text-[8px] uppercase tracking-wider font-bold">
                    <span className="text-zinc-500">Força da Senha:</span>
                    <span className={
                      passedCriteriaCount === 4 ? 'text-emerald-500' :
                      passedCriteriaCount === 3 ? 'text-teal-500' :
                      passedCriteriaCount === 2 ? 'text-amber-500' : 'text-red-500'
                    }>{passwordStrengthText}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 h-1 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden mt-0.5">
                    <div className={`h-full rounded-full transition-all ${passedCriteriaCount >= 1 ? (passedCriteriaCount === 1 ? 'bg-red-500' : passedCriteriaCount === 2 ? 'bg-amber-500' : passedCriteriaCount === 3 ? 'bg-teal-500' : 'bg-emerald-500') : ''}`} />
                    <div className={`h-full rounded-full transition-all ${passedCriteriaCount >= 2 ? (passedCriteriaCount === 2 ? 'bg-amber-500' : passedCriteriaCount === 3 ? 'bg-teal-500' : 'bg-emerald-500') : ''}`} />
                    <div className={`h-full rounded-full transition-all ${passedCriteriaCount >= 3 ? (passedCriteriaCount === 3 ? 'bg-teal-500' : 'bg-emerald-500') : ''}`} />
                    <div className={`h-full rounded-full transition-all ${passedCriteriaCount === 4 ? 'bg-emerald-500' : ''}`} />
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10.5px] font-bold text-zinc-500 uppercase pl-1">Confirmar Senha</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="password"
                  placeholder="Repita sua nova senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-zinc-250/20 dark:bg-white/5 border border-zinc-200/30 dark:border-white/10 text-bujo-text placeholder-zinc-500 focus:outline-none focus:border-bujo-highlight/50 transition-all font-sans"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={actionLoading}
              className="w-full py-3 bg-bujo-highlight text-white text-xs font-bold rounded-2xl hover:opacity-95 shadow-md shadow-bujo-highlight/15 transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2 disabled:opacity-50"
            >
              {actionLoading ? 'Salvando...' : 'Salvar Nova Senha'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
