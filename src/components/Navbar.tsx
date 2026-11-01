import clsx from "clsx";
import { Link, useRouter } from "@/lib/router";

export function Navbar() {
  const { path } = useRouter();

  return (
    <div className="navbar">
      <nav className="header">
        <Link to="/" className={clsx("nav_button span-6", path === "/" && "w--current")}>
          <div className="button-square not-blinking" />
          <div className="text-color_inverse name-long">ben wroth</div>
          <div className="text-color_inverse name-short">ben wroth</div>
        </Link>
        <Link to="/photos" className={clsx("nav_button span-3", path === "/photos" && "w--current")}>
          <div className="button-square blinking" />
          <div className="text-color_inverse">photos</div>
        </Link>
        <Link to="/about" className={clsx("nav_button span-3", path === "/about" && "w--current")}>
          <div className="button-square blinking" />
          <div className="text-color_inverse">about</div>
        </Link>
      </nav>
    </div>
  );
}
