import React, { useState } from 'react';
import {
  BookOpen,
  Mail,
  Lock,
  User as UserIcon,
  Sparkles,
  Smartphone,
  Monitor,
  CloudCheck,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import {
  loginWithGoogle,
  loginWithEmail,
  registerWithEmail,
  resetPassword,
} from '../firebase/config';

interface AuthGateProps {
  onSuccess?: () => void;
}

export const AuthGate: React.FC<AuthGateProps> = () => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      // Auth state listener in App will automatically transition to main app
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('O login com Google foi cancelado.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('A janela pop-up foi bloqueada pelo navegador. Permita pop-ups para continuar.');
      } else {
        setError(err.message || 'Erro ao conectar com conta Google. Tente novamente.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Por favor, informe seu endereço de e-mail.');
      return;
    }

    if (mode === 'forgot') {
      setLoading(true);
      try {
        await resetPassword(cleanEmail);
        setSuccessMessage('E-mail de redefinição de senha enviado com sucesso! Verifique sua caixa de entrada.');
      } catch (err: any) {
        if (err.code === 'auth/user-not-found') {
          setError('Nenhuma conta encontrada com este e-mail.');
        } else if (err.code === 'auth/invalid-email') {
          setError('E-mail inválido.');
        } else {
          setError(err.message || 'Erro ao enviar e-mail de redefinição.');
        }
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!password || password.length < 6) {
      setError('A senha deve conter no mínimo 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'register') {
        await registerWithEmail(cleanEmail, password, name.trim());
      } else {
        await loginWithEmail(cleanEmail, password);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Este e-mail já está cadastrado. Alterne para "Entrar".');
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('E-mail ou senha incorretos.');
      } else if (err.code === 'auth/user-not-found') {
        setError('Nenhuma conta encontrada com este e-mail. Crie sua conta ao lado.');
      } else if (err.code === 'auth/weak-password') {
        setError('A senha é muito fraca. Escolha uma senha mais segura.');
      } else {
        setError(err.message || 'Falha ao autenticar. Verifique seus dados.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col justify-center items-center px-4 py-8 sm:py-12 selection:bg-[#EAE4D9]">
      <div className="w-full max-w-md space-y-6">
        {/* App Branding Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#C86D51] to-[#A85138] text-white shadow-md shadow-[#C86D51]/20">
            <BookOpen className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2D2A26] tracking-tight">
              App de Leitura
            </h1>
            <p className="text-xs sm:text-sm text-[#78716A] max-w-xs mx-auto">
              Seu estúdio inteligente de leitura, fotos de páginas, grifos e estudos com dados salvos na nuvem.
            </p>
          </div>

          {/* Sync badge info */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F4F1EA] border border-[#E6E1D8] text-[11px] text-[#5C554E] font-medium">
            <Monitor className="w-3.5 h-3.5 text-[#C86D51]" />
            <span>PC</span>
            <span>⇄</span>
            <Smartphone className="w-3.5 h-3.5 text-[#6A8E6B]" />
            <span>Celular</span>
            <span>⇄</span>
            <CloudCheck className="w-3.5 h-3.5 text-[#2E3D2A]" />
            <span>Sincronizado</span>
          </div>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E6E1D8] shadow-sm space-y-5">
          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading}
            className="w-full h-12 flex items-center justify-center gap-3 px-4 rounded-xl border border-[#DCD6CA] bg-white hover:bg-[#FAF9F6] text-[#2D2A26] font-semibold text-sm transition-all duration-200 shadow-2xs hover:shadow-xs active:scale-[0.99] disabled:opacity-50"
          >
            {googleLoading ? (
              <div className="w-5 h-5 border-2 border-[#C86D51] border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>Entrar com a Conta Google</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#E6E1D8] w-full" />
            <span className="bg-white px-3 text-[11px] font-medium uppercase tracking-wider text-[#A8A29E]">
              ou com e-mail
            </span>
          </div>

          {/* Mode Switch Tabs */}
          {mode !== 'forgot' && (
            <div className="flex bg-[#F4F1EA] p-1 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                  mode === 'login'
                    ? 'bg-white text-[#2D2A26] shadow-2xs'
                    : 'text-[#78716A] hover:text-[#2D2A26]'
                }`}
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError(null);
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                  mode === 'register'
                    ? 'bg-white text-[#2D2A26] shadow-2xs'
                    : 'text-[#78716A] hover:text-[#2D2A26]'
                }`}
              >
                Criar Nova Conta
              </button>
            </div>
          )}

          {/* Error Message Alert */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message Alert */}
          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-[#4A443F] mb-1.5">
                  Seu Nome
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-[#A8A29E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Como prefere ser chamado(a)?"
                    className="w-full h-11 pl-10 pr-3 rounded-xl bg-[#FAF9F6] border border-[#DCD6CA] text-sm text-[#2D2A26] placeholder-[#A8A29E] focus:outline-none focus:border-[#C86D51] focus:ring-1 focus:ring-[#C86D51]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#4A443F] mb-1.5">
                Endereço de E-mail
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#A8A29E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@gmail.com"
                  autoComplete="email"
                  className="w-full h-11 pl-10 pr-3 rounded-xl bg-[#FAF9F6] border border-[#DCD6CA] text-sm text-[#2D2A26] placeholder-[#A8A29E] focus:outline-none focus:border-[#C86D51] focus:ring-1 focus:ring-[#C86D51]"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-[#4A443F]">
                    Senha
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        setError(null);
                        setSuccessMessage(null);
                      }}
                      className="text-[11px] text-[#C86D51] hover:underline"
                    >
                      Esqueceu a senha?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#A8A29E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                    className="w-full h-11 pl-10 pr-10 rounded-xl bg-[#FAF9F6] border border-[#DCD6CA] text-sm text-[#2D2A26] placeholder-[#A8A29E] focus:outline-none focus:border-[#C86D51] focus:ring-1 focus:ring-[#C86D51]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1.5 text-[#A8A29E] hover:text-[#4A443F] absolute right-2.5 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-[#C86D51] hover:bg-[#B35C42] text-white font-semibold text-sm transition-colors shadow-xs active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    {mode === 'login'
                      ? 'Entrar no App de Leitura'
                      : mode === 'register'
                      ? 'Criar Conta e Iniciar'
                      : 'Enviar Link de Redefinição'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {mode === 'forgot' && (
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  className="text-xs text-[#78716A] hover:text-[#2D2A26] underline"
                >
                  Voltar para tela de login
                </button>
              </div>
            )}
          </form>

          {/* Data Isolation Guarantee */}
          <div className="pt-2 border-t border-[#F0ECE1] flex items-center gap-2 text-[11px] text-[#78716A]">
            <ShieldCheck className="w-4 h-4 text-[#6A8E6B] flex-shrink-0" />
            <span>
              Banco de dados individual e criptografado: cada usuário acessa exclusivamente o seu próprio acervo.
            </span>
          </div>
        </div>

        {/* Feature Highlights on Mobile/Desktop */}
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="p-3 rounded-2xl bg-white/70 border border-[#E6E1D8] text-left space-y-1">
            <Sparkles className="w-4 h-4 text-[#C86D51]" />
            <p className="text-xs font-bold text-[#2D2A26]">Câmera e captura de página</p>
            <p className="text-[11px] text-[#78716A] leading-tight">
              Aponte a câmera do celular para qualquer página de livro físico.
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-white/70 border border-[#E6E1D8] text-left space-y-1">
            <CloudCheck className="w-4 h-4 text-[#6A8E6B]" />
            <p className="text-xs font-bold text-[#2D2A26]">Em qualquer lugar</p>
            <p className="text-[11px] text-[#78716A] leading-tight">
              Acesse suas notas pelo celular no transporte ou pelo PC em casa.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
