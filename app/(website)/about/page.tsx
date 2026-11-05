import Navbar from "@/components/navigation/Navbar";

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-32 px-6 md:px-12 max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-light text-black">About</h1>
        <p className="mt-4 text-neutral-600">
          CULT.URE &mdash; Beyond the noise. Into the culture.
        </p>
      </main>
    </>
  );
}

