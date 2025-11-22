import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-black">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/100 backdrop-blur-md border-b border-zinc-200 dark:bg-black/80 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img src="Logo1.png" alt="TuKancha" className="h-10 sm:h-12" />
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/login"
              className="text-xs sm:text-sm font-medium text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100 transition-colors px-2 sm:px-0"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/reservas"
              className="rounded-md bg-[#FFBF2C] px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-zinc-900 hover:bg-[#FFBF2C]/90 transition-colors whitespace-nowrap"
            >
              Reservá tu cancha
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative flex flex-1 items-center justify-center pt-16 sm:pt-20 bg-[url('/hero-bg.jpeg')] bg-cover bg-center bg-no-repeat">
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Content */}
        <div className="relative z-10 flex w-full max-w-3xl flex-col items-center justify-center gap-6 sm:gap-8 px-4 sm:px-8 md:px-16 py-16 sm:py-24 md:py-32 text-center">
          <div className="flex flex-col items-center gap-4 sm:gap-6">
            <h1 className="max-w-2xl text-3xl sm:text-4xl md:text-5xl font-bold leading-tight tracking-tight text-white">
              Bienvenido a TuKancha
            </h1>
            <p className="max-w-xl text-base sm:text-lg md:text-xl leading-6 sm:leading-7 md:leading-8 text-zinc-200 px-4 sm:px-0">
              La forma mas facil de reservar tu cancha.{" "}
              <br className="hidden sm:block" />
              Encontra tu cancha ideal y reserva en segundos.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6 w-full sm:w-auto px-4 sm:px-0">
              <Link
                href="/reservas"
                className="rounded-md bg-[#FFBF2C] px-6 py-2.5 text-sm font-medium text-zinc-900 hover:bg-[#FFBF2C]/90 transition-colors text-center"
              >
                Reserva una cancha
              </Link>
              <Link
                href="/register"
                className="rounded-md border border-white/30 bg-white/10 backdrop-blur-sm px-6 py-2.5 text-sm font-medium text-white hover:bg-white/20 transition-colors text-center"
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
