// pages/index.tsx
import Head from "next/head";
import Header from "@/components/landingpage/header";
import Hero from "@/components/landingpage/hero";
import Planos from "@/components/landingpage/planos";
import Sobre from "@/components/landingpage/sobre";
import CTA from "@/components/landingpage/cta";
import Footer from "@/components/landingpage/footer";
import localFont from "next/font/local";

const madimi = localFont({
  src: "../public/fonts/MadimiOne-Regular.ttf",
  variable: "--font-madimi",
});

export default function Home() {
  return (
    <div className={madimi.variable}>
      <Head>
        <title>Delivize — Cardápios para Delivery</title>
        <meta
          name="description"
          content="Crie cardápios digitais para seu delivery com Delivize. Experimente grátis por 14 dias!"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <main>
        <Hero />
        <Planos />
        <Sobre />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
