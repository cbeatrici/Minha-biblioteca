import React, { useState } from 'react';
import { Mail, KeyRound, Smartphone, Laptop, CheckCircle2, ShieldCheck, ArrowRight, X, Sparkles, Loader2 } from 'lucide-react';
import { AuthSession, saveAuthSession } from '../utils/storage';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AuthSession, isNewUser: boolean) => void;
  initialEmail?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialEmail = '',
}) => {
  const [email, setEmail] = useState(initialEmail);
  const [accessCode, setAccessCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('Por favor, informe um endereço de e-mail válido.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login-or-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          accessCode: accessCode.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Falha ao realizar login.');
      }

      const session: AuthSession = {
        id: data.user.id,
        email: data.user.email,
        accessCode: data.user.accessCode,
        createdAt: data.user.createdAt,
      };

      saveAuthSession(session, data.token);
      onLoginSuccess(session, !!data.isNew);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro de conexão com o servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl border border-[#E6E1D8] shadow-2xl overflow-hidden">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-[#C86D51] to-[#A85138] p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full bg-black/20 hover:bg-black/30 text-white/90 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 rounded-lg bg-white/20 text-white">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono tracking-wider uppercase font-semibold text-white/80">
              Acesso & Sincronização
            </span>
          </div>

          <h2 className="text-xl font-serif font-bold text-white tracking-tight">
            Sua Conta na Nuvem
          </h2>
          <p className="text-xs text-white/90 mt-1 font-sans leading-relaxed">
            Acesse e sincronize seus livros e grifos entre o computador e celular com seu e-mail.
          </p>

          {/* Sync icons visual */}
          <div className="flex items-center gap-3 mt-4 pt-3 border-t border-white/20 text-xs text-white/90 font-medium">
            <div className="flex items-center gap-1.5">
              <Laptop className="w-3.5 h-3.5 text-[#F9E8B2]" />
              <span>Computador</span>
            </div>
            <span className="text-white/40">⇄</span>
            <div className="flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-[#F9E8B2]" />
              <span>Celular</span>
            </div>
            <span className="text-white/40">⇄</span>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#A7F3D0]" />
              <span>Nuvem</span>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
              <span>{errorMsg}</span>
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
                placeholder="seu.email@exemplo.com"
                className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm bg-[#FAF9F6] border border-[#DCD6CA] rounded-xl text-[#2D2A26] placeholder-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#C86D51] focus:border-transparent transition-all"
              />
            </div>
            <p className="text-[11px] text-[#78716A] mt-1">
              Quem acessar o link pode digitar seu próprio e-mail para ter seu histórico isolado.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[#4A443F]">
                Código de Acesso / PIN (Opcional ou crie um)
              </label>
              <span className="text-[10px] font-mono text-[#78716A] bg-[#F4F1EA] px-2 py-0.5 rounded">
                Ex: 123456
              </span>
            </div>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-[#A8A29E] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder="Digite seu código ou deixe em branco para gerar"
                className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm bg-[#FAF9F6] border border-[#DCD6CA] rounded-xl text-[#2D2A26] placeholder-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#C86D51] focus:border-transparent transition-all font-mono"
              />
            </div>
            <p className="text-[11px] text-[#78716A] mt-1">
              Guarde este código para acessar do celular e sincronizar seus livros em tempo real.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#C86D51] hover:bg-[#B35C42] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all transform active:scale-98 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Conectando...</span>
                </>
              ) : (
                <>
                  <span>Entrar / Criar Histórico</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          <div className="text-center pt-1">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-[#78716A] hover:text-[#2D2A26] underline font-medium"
            >
              Continuar apenas localmente neste navegador
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
