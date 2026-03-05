export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="font-abhaya text-6xl font-bold mb-4">
        Orion <span className="text-gold-gradient">Social Suite</span>
      </h1>
      <p className="font-montserrat text-gray-400 mb-8 uppercase tracking-widest text-sm">
        Sistema Operacional VRTICE
      </p>
      
      <button className="glass-panel text-v-gold px-8 py-4 font-bold tracking-widest uppercase hover:bg-v-gold hover:text-v-black transition-all duration-300">
        Iniciar Protocolo
      </button>
    </main>
  );
}