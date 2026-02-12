export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: "linear-gradient(135deg, #4A0E2B 0%, #2B0A1A 100%)",
      }}
    >
      {children}
    </div>
  );
}
