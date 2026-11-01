import { Fragment, useEffect, useRef, type Ref } from "react";
import type { Project } from "@/data/content";
import { gsap } from "@/lib/motion";
import { MediaGrid } from "./MediaGrid";

function PlusIcon({ iconRef }: { iconRef: Ref<SVGSVGElement> }) {
  return (
    <svg ref={iconRef} className="plus-icon" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M18 8.30769V9.69231H10.9938L9.69231 10.9938V18H8.30769V10.9938L7.00615 9.69231H0V8.30769H7.00615L8.30769 7.01308V0H9.69231V7.01308L10.9938 8.30769H18Z"
        fill="white"
      />
    </svg>
  );
}

export function ProjectSection({ project, showTag }: { project: Project; showTag: boolean }) {
  const headerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const plusRef = useRef<SVGSVGElement>(null);
  const isOpen = useRef(false);

  const toggle = () => {
    const content = contentRef.current;
    const plus = plusRef.current;
    const cols = gridRef.current ? Array.from(gridRef.current.children) : [];
    if (!content || !plus) return;
    gsap.killTweensOf([content, plus, ...cols]);

    if (!isOpen.current) {
      // IX2 "Open-Acc"
      isOpen.current = true;
      gsap.set(content, { height: 0 });
      gsap.set(cols, { opacity: 0, y: 12 });
      gsap.set(plus, { rotation: 0 });
      gsap.to(content, { height: "auto", duration: 0.5, ease: "power3.out" });
      gsap.to(plus, { rotation: 45, duration: 0.25, ease: "wfEase" });
      gsap.to(cols, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" });
    } else {
      // IX2 "Close-Acc"
      isOpen.current = false;
      gsap.to(content, { height: 0, duration: 0.5, ease: "power3.out" });
      gsap.to(plus, { rotation: 0, duration: 0.25, ease: "wfEase" });
      gsap.to(cols, { opacity: 0, y: 12, duration: 0.5, ease: "power3.out" });
    }
  };

  const toggleRef = useRef(toggle);
  toggleRef.current = toggle;

  // the description opens by itself the first time the header scrolls into view
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    let triggered = false;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !triggered) {
            triggered = true;
            io.disconnect();
            toggleRef.current();
          }
        });
      },
      { rootMargin: "0px 0px -25% 0px", threshold: 0 },
    );
    io.observe(header);
    return () => io.disconnect();
  }, []);

  return (
    <section className="project_wrapper">
      <div className="project-text_wrapper">
        <div className="project-text_header" ref={headerRef} onClick={toggle}>
          <div className="project-tag_wrapper">
            <div className="project-tag">{showTag ? "projects" : ""}</div>
          </div>
          <div className="project_header-container">
            <div className="project_header">
              <div className="project-info_container text-color_inverse span-6">
                <h2 className="project-info">{project.title}</h2>
              </div>
              <div className="project-info_container text-color_inverse span-3">
                <div className="project-info mobile_invisible">{project.category}</div>
              </div>
              <div className="project-info_container text-color_inverse span-3 stretch">
                <div className="project-info mobile_invisible">{project.year}</div>
                <PlusIcon iconRef={plusRef} />
              </div>
            </div>
          </div>
        </div>

        <div className="project-content_wrapper" ref={contentRef} style={{ height: 0 }}>
          <div className="project-contant_wrapper" ref={gridRef}>
            <div className="acc-content_col acc-desc">
              <div>{project.description}</div>
            </div>
            <div className="acc-content_col acc-labels">
              <div className="project-detail-text">
                {project.credits.map((c) => (
                  <Fragment key={c.label}>
                    {c.label}:
                    <br />
                  </Fragment>
                ))}
              </div>
            </div>
            <div className="acc-content_col acc-values">
              <div className="project-detail-text">
                {project.credits.map((c) => (
                  <Fragment key={c.label}>
                    {c.parts.map((part, i) =>
                      part.href ? (
                        <a key={i} href={part.href} target="_blank" rel="noreferrer">
                          {part.text}
                        </a>
                      ) : (
                        <Fragment key={i}>{part.text}</Fragment>
                      ),
                    )}
                    <br />
                  </Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <MediaGrid
        items={project.media}
        columns={4}
        sizes="(max-width: 767px) 50vw, 25vw"
        className="project-image_wrapper"
        imageGridClassName="project-image_grid"
      />
    </section>
  );
}
