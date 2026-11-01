import { AboutImageStack } from "@/components/AboutImageStack";
import { ScanWords } from "@/components/ScanWords";
import { aboutSections, type AboutPart } from "@/data/about";
import { aboutIntro } from "@/data/content";

function renderPart(part: AboutPart, i: number) {
  if (typeof part === "string") return part;
  if ("br" in part) return <br key={i} />;
  return (
    <a key={i} href={part.href} {...(part.external ? { target: "_blank", rel: "noreferrer" } : {})}>
      {part.text}
    </a>
  );
}

export function About() {
  return (
    <>
      <AboutImageStack />
      <header className="hero subpage-hero">
        <h1 className="title-h1 small-h1">
          <ScanWords text={aboutIntro} />
        </h1>
      </header>
      <div className="about-text_container">
        {aboutSections.map((section) => (
          <div key={section.title} className="about-text_grid">
            <h2 className="h2-about">{section.title}</h2>
            <div className="about-text">{section.content.map(renderPart)}</div>
          </div>
        ))}
      </div>
    </>
  );
}
