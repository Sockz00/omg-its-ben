import { FlowField } from '../components/experiments';
import { randomProject } from '../lib/content';
import { Link } from '../lib/router';

export default function NotFound() {
  const r = randomProject();
  return (
    <div className="page nf">
      <div className="nf__bg"><FlowField compact /></div>
      <p className="mono nf__code">Error 404 — object not catalogued</p>
      <h1 className="nf__title">Lost in <em className="serif">the stacks.</em></h1>
      <p className="serif nf__text">This shelf is empty. The object may have moved, or never existed.</p>
      <div className="nf__links">
        <Link to="/" className="btn btn--solid">Back to the index</Link>
        <Link to="/archive" className="btn">Browse the archive</Link>
        <Link to={`/project/${r.slug}`} className="btn">Something random: {r.title}</Link>
      </div>
    </div>
  );
}
