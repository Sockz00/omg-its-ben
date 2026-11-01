import { MediaGrid } from "@/components/MediaGrid";
import { ScanWords } from "@/components/ScanWords";
import { photos, photosIntro } from "@/data/content";

export function Photos() {
  return (
    <>
      <header className="hero subpage-hero">
        <h1 className="title-h1 small-h1">
          <ScanWords text={photosIntro} />
        </h1>
      </header>
      <section className="photos_wrapper">
        <MediaGrid
          items={photos}
          columns={6}
          sizes="(max-width: 767px) 33vw, (max-width: 1919px) 17vw, 240px"
          className="photos-image_wrapper"
          imageGridClassName="photos-image_grid"
        />
      </section>
    </>
  );
}
