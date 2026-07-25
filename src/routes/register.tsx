import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Criar conta · Admin #temprati" }, { name: "robots", content: "noindex" }] }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [accept, setAccept] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/admin/dashboard" });
    });
  }, [navigate]);

  const nomeValid = nome.trim().length >= 2;
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const passwordValid = password.length >= 8;
  const confirmValid = confirm === password && confirm.length > 0;
  const canSubmit = nomeValid && emailValid && passwordValid && confirmValid && accept && !loading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/admin/dashboard`,
        data: { nome: nome.trim() },
      },
    });

    if (error) {
      setLoading(false);
      const msg = error.message.toLowerCase();
      if (msg.includes("already") || msg.includes("registered") || msg.includes("exists")) {
        toast.error("Já existe uma conta com este e-mail.");
      } else {
        toast.error(error.message);
      }
      return;
    }

    // If email confirmation is disabled, session is returned; otherwise sign in.
    if (!data.session) {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setLoading(false);
        toast.success("Conta criada. Verifique seu e-mail para confirmar antes de entrar.");
        navigate({ to: "/admin/login" });
        return;
      }
    }

    setLoading(false);
    toast.success("Conta criada com sucesso!");
    navigate({ to: "/admin/dashboard" });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-2xl font-semibold tracking-tight">#temprati</div>
          <div className="mt-1 text-xs uppercase tracking-[0.2em] text-neutral-500">criar conta</div>
        </div>
        <form onSubmit={handleSubmit} className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <label className="block text-xs font-medium text-neutral-700">Nome completo</label>
          <input
            type="text" autoComplete="name" required value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
          />
          {nome && !nomeValid && <p className="mt-1 text-xs text-red-600">Informe seu nome</p>}

          <label className="mt-4 block text-xs font-medium text-neutral-700">E-mail</label>
          <input
            type="email" autoComplete="email" required value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
          />
          {email && !emailValid && <p className="mt-1 text-xs text-red-600">E-mail inválido</p>}

          <label className="mt-4 block text-xs font-medium text-neutral-700">Senha</label>
          <div className="relative mt-1">
            <input
              type={show ? "text" : "password"} autoComplete="new-password" required value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 pr-10 text-sm outline-none focus:border-neutral-900"
            />
            <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-900">
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {password && !passwordValid && <p className="mt-1 text-xs text-red-600">Mínimo 8 caracteres</p>}

          <label className="mt-4 block text-xs font-medium text-neutral-700">Confirmar senha</label>
          <input
            type={show ? "text" : "password"} autoComplete="new-password" required value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
          />
          {confirm && !confirmValid && <p className="mt-1 text-xs text-red-600">As senhas não coincidem</p>}

          <label className="mt-4 flex items-start gap-2 text-xs text-neutral-700">
            <input type="checkbox" checked={accept} onChange={(e) => setAccept(e.target.checked)} className="mt-0.5 rounded" />
            <span>Aceito os termos de uso</span>
          </label>

          <button
            type="submit" disabled={!canSubmit}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-neutral-900 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Criar conta
          </button>

          <p className="mt-4 text-center text-xs text-neutral-600">
            Já possui uma conta?{" "}
            <Link to="/admin/login" className="font-medium text-neutral-900 hover:underline">Entrar</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
