export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-dvh flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div
        aria-hidden
        className="absolute inset-0 -z-20 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=2400&q=80')",
        }}
      />
      {/* Dark overlay 35% */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-black/35"
      />
      {/* Subtle radial accent */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(900px circle at 50% 20%, hsl(22 92% 35% / 0.18), transparent 60%)",
        }}
      />

      <main className="relative z-10 w-full px-5 sm:px-6 py-10 flex items-center justify-center">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
