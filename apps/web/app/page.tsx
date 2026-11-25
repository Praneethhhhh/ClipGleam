import Image from 'next/image';
import { Brand, ThemeToggle, SamplePlayer } from './homepage-controls';

const seasons = { title: 'Why We Get Seasons', source: '/samples/seasons.mp4', poster: '/samples/seasons.png' };

const steps = [
  ['Start with an idea', 'Enter a topic or brainstorm a teaching angle.'],
  ['Edit the storyboard', 'Refine the script, reorder scenes and preview the motion.'],
  ['Generate and preview', 'Review the animation, voiceover and synced captions.'],
  ['Export or publish', 'Download a vertical MP4 or publish to a connected Instagram account when available.'],
];

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#content">Skip to content</a>
      <header className="site-header">
        <div className="shell nav-row">
          <Brand />
          <nav aria-label="Main navigation">
            <a href="#sample">Sample</a>
            <a href="#workflow">How it works</a>
            <ThemeToggle />
            <a href="/sign-in">Sign in</a>
          </nav>
        </div>
      </header>

      <main id="content">
        <section className="shell hero" aria-labelledby="hero-title">
          <div>
            <h1 id="hero-title">Turn ideas into animated explainers.</h1>
            <p className="lede">
              Start with a topic. Review the storyboard, then create a short video with
              motion graphics, voiceover and captions.
            </p>
            <div className="actions">
              <SamplePlayer {...seasons}
                buttonLabel="Watch sample" primary />
              <a className="text-link" href="#workflow">How it works <span aria-hidden="true">→</span></a>
            </div>
          </div>
          <figure className="film" id="sample">
            <Image src={seasons.poster} alt="A scene from Why We Get Seasons showing sunlight reaching a tilted Earth"
              width={360} height={640} preload unoptimized />
            <figcaption><strong>{seasons.title}</strong><span>1:28</span></figcaption>
          </figure>
        </section>

        <section className="section storyboard" aria-labelledby="storyboard-title">
          <div className="shell">
            <h2 id="storyboard-title">Review every scene before you render.</h2>
            <p className="section-intro">Edit the script and see what will appear as the narrator explains it.</p>
            <div className="story-grid">
              <div className="story-panel">
                <h3>{seasons.title}</h3>
                <ol>
                  <li><strong>Earth tilts.</strong> Show the tilted axis beside a straight reference line.</li>
                  <li><strong>Sunlight spreads out.</strong> Show the beam making a wider patch at an angle.</li>
                </ol>
              </div>
              <div className="story-panel">
                <h3>Script and timing</h3>
                <p>“The same light spreads over a wider area.”</p>
                <details>
                  <summary>See the animation cue</summary>
                  <p>Widen the patch when the narrator says “wider area.”</p>
                </details>
              </div>
            </div>
          </div>
        </section>

        <section className="section workflow" id="workflow" aria-labelledby="workflow-title">
          <div className="shell">
            <h2 id="workflow-title">From topic to video.</h2>
            <p className="section-intro">You decide what the video says and shows before it renders.</p>
            <ol className="steps">
              {steps.map(([title, description]) => (
                <li key={title}><h3>{title}</h3><p>{description}</p></li>
              ))}
            </ol>
          </div>
        </section>

        <section className="shell section example" aria-labelledby="example-title">
          <div>
            <h2 id="example-title">{seasons.title}</h2>
            <p className="section-intro">See why sunlight hits each hemisphere at a different angle throughout the year.</p>
          </div>
          <SamplePlayer {...seasons} buttonLabel="Watch example" />
        </section>
      </main>

      <footer className="shell site-footer"><Brand /><span>Invite-only pilot</span></footer>
    </>
  );
}
