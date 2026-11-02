
"use client";

const lessons = [
  {
    number: "01",
    name: "Server Street",
    title: "Meet the servers",
    description: "Discover what a server does and why websites need one.",
    icon: "🏠",
  },
  {
    number: "02",
    name: "Gateway Square",
    title: "Guide the visitors",
    description: "Learn how a load balancer shares incoming traffic.",
    icon: "🚦",
  },
  {
    number: "03",
    name: "Scaling Heights",
    title: "Grow with demand",
    description: "See how Auto Scaling responds when more visitors arrive.",
    icon: "🏢",
  },
  {
    number: "04",
    name: "Storage Lane",
    title: "Give data a home",
    description: "Understand why applications need shared storage.",
    icon: "📦",
  },
  {
    number: "05",
    name: "Availability Avenue",
    title: "Stay available",
    description: "Explore why applications use more than one location.",
    icon: "☁️",
  },
];

function Cloud({ className = "" }) {
  return <div className={`welcome-cloud ${className}`} aria-hidden="true" />;
}

export default function CloudvilleWelcome({ onSelectLesson }) {
  return (
    <div className="city-home">
      <nav className="city-nav">
        <a href="#" className="city-logo">
          ☁️ Cloudville
        </a>

        <a href="#destinations" className="nav-link">
          Explore the city ↓
        </a>
      </nav>

      <header className="city-hero">
        <div className="hero-copy">
          <span className="eyebrow">YOUR CLOUD LEARNING ADVENTURE</span>

          <h1>
            Big cloud ideas.
            <br />
            <span>Little city stories.</span>
          </h1>

          <p>
            Welcome to Cloudville, a friendly little town where servers
            have jobs, data has a home, and the internet starts to make
            sense.
          </p>

          <a href="#destinations" className="explore-button">
            Explore Cloudville <span>→</span>
          </a>

          <p className="beginner-note">
            ✦ No cloud experience needed. Just curiosity!
          </p>
        </div>

        <div className="city-illustration" aria-label="Illustration of a little town in the clouds">
          <Cloud className="cloud-one" />
          <Cloud className="cloud-two" />

          <div className="sun" />

          <div className="city-ground">
            <div className="building building-one">
              <span>☁</span>
              <div className="windows">▦ ▦</div>
            </div>

            <div className="building building-two">
              <span>SERVER</span>
              <div className="windows">▦ ▦</div>
            </div>

            <div className="building building-three">
              <span>DATA</span>
              <div className="windows">▦ ▦</div>
            </div>
          </div>

          <div className="road">WELCOME TO CLOUDVILLE</div>
        </div>
      </header>

      <section className="destination-section" id="destinations">
        <div className="section-heading">
          <span className="eyebrow">FIVE PLACES TO DISCOVER</span>
          <h2>Where shall we go first?</h2>
          <p>
            Every stop introduces a cloud computing concept through
            a simple, interactive story.
          </p>
        </div>

        <div className="destination-grid">
          {lessons.map((lesson, index) => (
            <button
              className="destination-card"
              key={lesson.number}
              onClick={() => onSelectLesson(index)}
            >
              <span className="card-number">{lesson.number}</span>
              <span className="card-icon">{lesson.icon}</span>
              <span className="card-name">{lesson.name}</span>
              <span className="card-title">{lesson.title}</span>
              <span className="card-description">
                {lesson.description}
              </span>
              <span className="card-link">Visit destination →</span>
            </button>
          ))}
        </div>
      </section>

      <footer className="city-footer">
        Made for curious minds, one cloud concept at a time. ☁️
      </footer>
    </div>
  );
}
