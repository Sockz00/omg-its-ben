import { useEffect, useLayoutEffect } from "react";
import { Background, GridOverlay } from "@/components/Background";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { WordScan } from "@/components/WordScan";
import { RouterProvider, useRouter } from "@/lib/router";
import { About } from "@/pages/About";
import { Home } from "@/pages/Home";
import { Photos } from "@/pages/Photos";

const TITLES = {
  "/": "ben wroth",
  "/photos": "photos – ben wroth",
  "/about": "about – ben wroth",
} as const;

function Shell() {
  const { path, visit } = useRouter();
  const Page = path === "/photos" ? Photos : path === "/about" ? About : Home;

  useEffect(() => {
    document.title = TITLES[path];
  }, [path]);

  useLayoutEffect(() => {
    document.body.classList.toggle("photos-page", path === "/photos");
    return () => document.body.classList.remove("photos-page");
  }, [path]);

  return (
    <>
      <GridOverlay />
      <Navbar />
      {/* keyed so every navigation remounts the page, like the original full page loads */}
      <main key={visit}>
        <Page />
      </main>
      <Background />
      <Footer />
      <WordScan />
    </>
  );
}

export default function App() {
  return (
    <RouterProvider>
      <Shell />
    </RouterProvider>
  );
}
