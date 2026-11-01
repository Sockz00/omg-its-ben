import { CDN } from "./content";

export type AboutPart = string | { text: string; href: string; external?: boolean } | { br: true };

export type AboutSection = {
  title: string;
  content: AboutPart[];
};

export const aboutSections: AboutSection[] = [
  {
    title: "background",
    content: [
      "I first started my professional career as a apprentice at namics ag (now ",
      { text: "merkle", href: "https://www.merkle.com/", external: true },
      "), where I developed websites and mobile apps. Having gathered a lot of technical know-how over these 4 years, I decided to turn my focus to design. I then completed the BMS with a focus on design and art, and worked at the Museum of Design Zurich for six months, which deepened my understanding and interest in design.",
    ],
  },
  {
    title: "focus",
    content: [
      "My work mainly focuses on web and brand design but it also frequently extends into communication, campaigning, photography and web development. Always eager to learn something new, I like being pushed by projects that stretch my skill sets. In almost all of my work my background in software development has remained a key asset in shaping how I approach projects, helping me to think further about how something should work and how it can be realized.",
    ],
  },
  {
    title: "experience",
    content: [
      "For the past three years, I've been working at ",
      { text: "Absolut Agentur,", href: "https://www.absolutagentur.ch/", external: true },
      " a small design agency in St.Gallen, as a UI/UX and graphic designer. Having worked in very different environments, from large corporate companies to small creative teams and cultural spaces, each with their own ways of working and thinking, has taught me a lot. Through that I've built a broad understanding of how different projects and people work. These experiences have shaped my way of working, allowing me to approach different projects and needs from various angles.",
    ],
  },
  {
    title: "contact",
    content: [
      "m: ",
      { text: "mail@benwroth.com", href: "mailto:mail@benwroth.com" },
      { br: true },
      "ig: ",
      { text: "ben.wroth", href: "https://www.instagram.com/ben.wroth", external: true },
      { br: true },
      "li: \u00a0",
      { text: "Ben Wroth", href: "https://www.linkedin.com/in/ben-wroth/", external: true },
    ],
  },
];

export type AboutImage =
  | { key: string; type: "image"; src: string }
  | { key: string; type: "video"; id: string };

/** DOM order matches the original site (img_4 is on top of the stack). */
export const aboutImages: AboutImage[] = [
  { key: "about-img_4", type: "video", id: "6967cb5bb88d4a4c0242fd29_about-img_4" },
  { key: "about-img_3", type: "image", src: `${CDN}6967c6f4a370aa87081b74ee_about-img_3.avif` },
  { key: "about-img_2", type: "image", src: `${CDN}6967c6f40f305629735ecf78_about-img_2.avif` },
  { key: "about-img_1", type: "image", src: `${CDN}6967c6f400fc6c7fbace4427_about-img_1.avif` },
];
