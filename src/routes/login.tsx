import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar · #temprati" },
      { name: "description", content: "Acesse sua conta #temprati para acompanhar pedidos, favoritos e endereços." },
      { property: "og:title", content: "Entrar · #temprati" },
      { property: "og:description", content: "Acesse sua conta #temprati." },
    ],
  }),
  component: LoginPage,
});

async function redirectByRole(userId: string, navigate: ReturnType<typeof useNavigate>) {
  const { data } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (data) navigate({ to: "/admin", replace: true });
  else navigate({ to: "/conta", replace: true });
}

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) redirectByRole(data.user.id, navigate);
    });
  }, [navigate]);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const canSubmit = emailValid && password.length >= 6 && !loading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { toast.error("Email ou senha incorretos."); return; }
    if (data.user) await redirectByRole(data.user.id, navigate);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/40 px-4 py-14">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-semibold tracking-tight lowercase text-primary">#temprati</Link>
          <div className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">entrar</div>
        </div>
        <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <label className="block text-xs font-medium text-neutral-700">Email</label>
          <input
            type="email" autoComplete="email" required value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
          />

          <label className="mt-4 block text-xs font-medium text-neutral-700">Senha</label>
          <div className="relative mt-1">
            <input
              type={show ? "text" : "password"} autoComplete="current-password" required value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 pr-10 text-sm outline-none focus:border-neutral-900"
            />
            <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-900">
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <div className="mt-3 text-right">
            <button
              type="button"
              onClick={async () => {
                if (!emailValid) { toast.error("Informe seu e-mail acima."); return; }
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                  redirectTo: `${window.location.origin}/reset-password`,
                });
                if (error) toast.error(error.message);
                else toast.success("Enviamos um e-mail de recuperação.");
              }}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Esqueceu sua senha?
            </button>
          </div>

          <button
            type="submit" disabled={!canSubmit}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Entrar
          </button>

          <p className="mt-5 text-center text-xs text-muted-foreground">
            Ainda não possui uma conta?{" "}
            <Link to="/register" className="font-medium text-foreground hover:underline">Criar conta</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
