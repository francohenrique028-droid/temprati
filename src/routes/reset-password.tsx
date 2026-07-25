import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Redefinir senha · #temprati" }, { name: "robots", content: "noindex" }] }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [recovery, setRecovery] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Supabase places recovery tokens in the URL hash; the client auto-processes them.
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) setRecovery(true);
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setRecovery(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const passwordValid = password.length >= 8;
  const confirmValid = confirm === password && confirm.length > 0;
  const canSubmit = passwordValid && confirmValid && !loading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Senha atualizada com sucesso!");
    navigate({ to: "/admin/dashboard" });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-2xl font-semibold tracking-tight">#temprati</div>
          <div className="mt-1 text-xs uppercase tracking-[0.2em] text-neutral-500">redefinir senha</div>
        </div>
        <form onSubmit={handleSubmit} className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          {!recovery && (
            <p className="mb-4 rounded-lg bg-neutral-100 p-3 text-xs text-neutral-700">
              Abra este link a partir do e-mail de recuperação para redefinir sua senha.
            </p>
          )}

          <label className="block text-xs font-medium text-neutral-700">Nova senha</label>
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

          <label className="mt-4 block text-xs font-medium text-neutral-700">Confirmar nova senha</label>
          <input
            type={show ? "text" : "password"} autoComplete="new-password" required value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
          />
          {confirm && !confirmValid && <p className="mt-1 text-xs text-red-600">As senhas não coincidem</p>}

          <button
            type="submit" disabled={!canSubmit}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-neutral-900 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Salvar nova senha
          </button>

          <p className="mt-4 text-center text-xs text-neutral-600">
            <Link to="/admin/login" className="font-medium text-neutral-900 hover:underline">Voltar para o login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
