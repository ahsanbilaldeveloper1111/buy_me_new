import { AuthForms } from "@/components/auth/auth-forms";

export default function AuthPage() {
  return (
    <section className="space-y-3">
      <h1 className="text-2xl font-semibold">Authentication</h1>
      <p>Create a user account and login to access protected task APIs.</p>
      <AuthForms />
    </section>
  );
}
