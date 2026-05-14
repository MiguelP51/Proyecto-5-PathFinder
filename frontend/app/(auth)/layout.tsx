import Navbar from "@/components/Navbar";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Navbar />
      <main style={{ marginTop: '80px' }}>{children}</main>
    </div>
  );
}
