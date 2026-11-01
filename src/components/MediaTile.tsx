import { useEffect, useRef } from "react";
import clsx from "clsx";
import { imageSrc, imageSrcSet, videoSources, type Media, type Shape } from "@/data/content";

/** Background video (Webflow `w-background-video`), only playing while near the viewport. */
export function BackgroundVideo({ id }: { id: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const { mp4, webm, poster } = videoSources(id);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    v.defaultMuted = true;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  // iOS low-power mode blocks autoplay – kick it off on touch (same as the original)
  const onTouchStart = () => {
    const v = ref.current;
    if (v && v.paused) {
      v.load();
      v.play().catch(() => {});
    }
  };

  return (
    <div className="project-video" onTouchStart={onTouchStart}>
      <video
        ref={ref}
        muted
        loop
        playsInline
        preload="none"
        disablePictureInPicture
        style={{ backgroundImage: `url("${poster}")` }}
      >
        <source src={mp4} type="video/mp4" />
        <source src={webm} type="video/webm" />
      </video>
    </div>
  );
}

export function VideoBox({ id, shape }: { id: string; shape: Shape }) {
  return (
    <div className={clsx("video-container", shape !== "landscape" && shape)}>
      <BackgroundVideo id={id} />
    </div>
  );
}

export function MediaTile({ media, sizes }: { media: Media; sizes: string }) {
  return (
    <div className="layout-grid_item" data-layout-grid-item="">
      <div className="project-image_outer">
        {media.type === "image" ? (
          <div className="image-wrapper">
            <img
              className={clsx("thumbnail", media.shape)}
              src={imageSrc(media)}
              srcSet={imageSrcSet(media)}
              sizes={sizes}
              alt={media.alt}
              loading="lazy"
              decoding="async"
              draggable={false}
            />
          </div>
        ) : (
          <VideoBox id={media.id} shape={media.shape} />
        )}
        <div className="project-title_wrapper">
          <div className="project-image-tag">{media.name}</div>
        </div>
      </div>
    </div>
  );
}
