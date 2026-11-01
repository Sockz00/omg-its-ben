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
      {projects.length ? projects.map((project, i) => (
        <ProjectSection key={project.title} project={project} showTag={i === 0} />
      )) : (
        <section className="project_wrapper" aria-label="projects">
          <div className="project-tag_wrapper"><div className="project-tag">projects</div></div>
          <div className="project_header-container"><h2 className="project-info">nothing here yet</h2></div>
        </section>
      )}
    </>
  );
}
