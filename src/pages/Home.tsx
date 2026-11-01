import { FitHeadline } from "@/components/FitHeadline";
import { ProjectSection } from "@/components/ProjectSection";
import { ScrollDownCursor } from "@/components/ScrollDownCursor";
import { heroTitle, projects } from "@/data/content";

export function Home() {
  return (
    <>
      <header className="hero">
        <FitHeadline text={heroTitle} />
        <ScrollDownCursor />
      </header>
      {projects.map((project, i) => (
        <ProjectSection key={project.title} project={project} showTag={i === 0} />
      ))}
    </>
  );
}
