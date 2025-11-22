import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-black">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/100 backdrop-blur-md border-b border-zinc-200 dark:bg-black/80 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img src="Logo1.png" alt="" className="h-12" />
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100 transition-colors"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/reservas"
              className="rounded-md bg-[#FFBF2C] px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-[#FFBF2C]/90 transition-colors"
            >
              Reservá tu cancha
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative flex flex-1 items-center justify-center pt-20 bg-[url('/hero-bg.jpeg')] bg-cover bg-center bg-no-repeat">
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Content */}
        <div className="relative z-10 flex w-full max-w-3xl flex-col items-center justify-center gap-8 px-16 py-32 text-center">
          <div className="flex flex-col items-center gap-6">
            <h1 className="max-w-2xl text-5xl font-bold leading-tight tracking-tight text-white">
              Bienvenido a TuKancha
            </h1>
            <p className="max-w-xl text-xl leading-8 text-zinc-200">
              La forma mas facil de reservar tu cancha. <br />
              Encontra tu cancha ideal y reserva en segundos.
            </p>
            <div className="flex gap-4 pt-6">
              <Link
                href="/reservas"
                className="rounded-md bg-[#FFBF2C] px-6 py-2.5 text-sm font-medium text-zinc-900 hover:bg-[#FFBF2C]/90 transition-colors"
              >
                Reserva una cancha
              </Link>
              <Link
                href="/register"
                className="rounded-md border border-white/30 bg-white/10 backdrop-blur-sm px-6 py-2.5 text-sm font-medium text-white hover:bg-white/20 transition-colors"
              >
                Tenes un club?
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
