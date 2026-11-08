"use client";

export const lessons = [
  { number: "01", name: "Server Street", title: "Every website starts somewhere.", description: "Meet the hardworking servers keeping the café open.", icon: "☕", color: "peach", tag: "THE BASICS" },
  { number: "02", name: "Gateway Square", title: "A little help goes a long way.", description: "Spread the rush with servers and a clever greeter.", icon: "🚦", color: "blue", tag: "LOAD BALANCING" },
  { number: "03", name: "Scaling Heights", title: "Grow when the crowds arrive.", description: "Watch your café grow during the busiest hours.", icon: "🏙️", color: "yellow", tag: "AUTO SCALING" },
  { number: "04", name: "Storage Lane", title: "Every recipe needs a home.", description: "Keep important data safe when servers come and go.", icon: "📦", color: "mint", tag: "DATA & STORAGE" },
  { number: "05", name: "Availability Avenue", title: "Always keep a light on.", description: "Learn how two locations keep things running.", icon: "🌈", color: "lavender", tag: "RELIABILITY" },
];


export function CityArt() {
  return (
    <div className="cv-world" aria-label="Illustrated Cloudville town with a café, data center, buildings and floating clouds" role="img">
      <span className="cv-world-label cv-world-label-top">✦ EST. IN THE CLOUDS</span>
      <svg viewBox="0 0 650 500" className="cv-city-svg" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="cvSky" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#c4e8ff"/><stop offset="1" stopColor="#eef9ff"/></linearGradient>
          <linearGradient id="cvLand" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#b5dcbd"/><stop offset="1" stopColor="#88c7aa"/></linearGradient>
          <filter id="cvShadow" x="-35%" y="-35%" width="170%" height="190%"><feDropShadow dx="0" dy="12" stdDeviation="11" floodColor="#3a668c" floodOpacity=".17"/></filter>
          <pattern id="cvDots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="#547e9b" opacity=".14"/></pattern>
        </defs>
        <rect width="650" height="500" fill="url(#cvSky)"/>
        <rect width="650" height="500" fill="url(#cvDots)"/>
        <circle cx="517" cy="91" r="45" fill="#ffda75" className="cv-sun"/>
        <circle cx="517" cy="91" r="60" stroke="#fff3c5" strokeWidth="2" strokeDasharray="4 9" fill="none"/>
        <g fill="#fff" className="cv-cloud cloud-a"><ellipse cx="124" cy="99" rx="60" ry="21"/><circle cx="103" cy="80" r="31"/><circle cx="143" cy="75" r="37"/></g>
        <g fill="#fff" opacity=".89" className="cv-cloud cloud-b"><ellipse cx="460" cy="170" rx="53" ry="17"/><circle cx="448" cy="151" r="26"/><circle cx="475" cy="149" r="29"/></g>
        <g className="cv-island" filter="url(#cvShadow)">
          <path d="M44 307 L310 183 Q331 173 351 183 L604 300 Q628 314 608 329 L348 454 Q327 465 308 456 L46 334 Q25 323 44 307Z" fill="#6d9da3" stroke="#244763" strokeWidth="5"/>
          <path d="M44 285 L310 161 Q331 151 351 161 L604 278 Q628 292 608 307 L348 432 Q327 443 308 434 L46 312 Q25 301 44 285Z" fill="url(#cvLand)" stroke="#244763" strokeWidth="5"/>
          <path d="M129 298 L332 203 L529 295 L329 392Z" fill="#f5ead1" stroke="#ebd9b9" strokeWidth="3"/>
          <path d="M290 229 L316 217 L479 299 L451 312Z" fill="#d9caac" opacity=".9"/>
          <path d="M174 325 L188 318 L359 400 L345 407Z" fill="#d9caac"/>
          <g transform="translate(94 196)">
            <path d="M0 63 L75 28 L151 63 L77 101Z" fill="#e9a9a2" stroke="#244763" strokeWidth="4"/>
            <path d="M0 63 V145 L77 181 V101Z" fill="#f4a999" stroke="#244763" strokeWidth="4"/>
            <path d="M77 101 L151 63 V145 L77 181Z" fill="#fbc9a9" stroke="#244763" strokeWidth="4"/>
            <path d="M-8 57 L75 14 L159 57 L151 71 L75 35 L0 75Z" fill="#ffdf91" stroke="#244763" strokeWidth="4"/>
            <path d="M24 99 L55 114 V143 L24 128Z" fill="#fff0cc" stroke="#244763" strokeWidth="3"/>
            <path d="M90 121 L121 106 V145 L90 160Z" fill="#9cd4e8" stroke="#244763" strokeWidth="3"/>
            <path d="M94 110 V149 M117 102 V137" stroke="#fff" strokeWidth="3"/>
            <path d="M27 60 Q75 34 124 60" stroke="#244763" strokeWidth="2" fill="none"/>
            <text x="75" y="70" textAnchor="middle" fontSize="15" fontWeight="900" fill="#244763">CLOUD CAFÉ</text>
            <g className="cv-steam" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><path d="M137 14 Q127 4 137 -7"/><path d="M150 18 Q142 10 151 1"/></g>
          </g>
          <g transform="translate(305 114)">
            <path d="M0 90 L62 60 L125 89 L62 120Z" fill="#b2d7f2" stroke="#244763" strokeWidth="4"/>
            <path d="M0 90 V233 L62 263 V120Z" fill="#8db9e1" stroke="#244763" strokeWidth="4"/>
            <path d="M62 120 L125 89 V232 L62 263Z" fill="#b9d9ee" stroke="#244763" strokeWidth="4"/>
            <path d="M-6 89 L62 55 L132 89 L62 125Z" fill="#fff2bf" stroke="#244763" strokeWidth="4"/>
            <g fill="#e5f5ff" stroke="#244763" strokeWidth="2"><path d="M16 127 L44 139 V164 L16 152Z"/><path d="M16 175 L44 187 V212 L16 200Z"/><path d="M79 139 L108 126 V151 L79 164Z"/><path d="M79 185 L108 171 V196 L79 210Z"/></g>
            <path d="M65 118 V259" stroke="#244763" opacity=".2" strokeWidth="3"/>
            <g transform="translate(26 5)"><rect width="74" height="37" rx="12" fill="#fff" stroke="#244763" strokeWidth="3"/><text x="37" y="24" textAnchor="middle" fontSize="14" fontWeight="900" fill="#244763">SERVERS</text></g>
            <circle cx="89" cy="229" r="5" fill="#46ad7a"/><circle cx="104" cy="221" r="5" fill="#ffd966"/>
          </g>
          <g transform="translate(457 237)">
            <path d="M0 30 L52 5 L103 30 L52 56Z" fill="#fff1bc" stroke="#244763" strokeWidth="4"/>
            <path d="M0 30 V103 L52 129 V56Z" fill="#eedf9e" stroke="#244763" strokeWidth="4"/>
            <path d="M52 56 L103 30 V103 L52 129Z" fill="#fff1bc" stroke="#244763" strokeWidth="4"/>
            <path d="M16 54 L37 64 V87 L16 76Z" fill="#a0d8ed" stroke="#244763" strokeWidth="2"/>
            <path d="M68 69 L89 58 V82 L68 93Z" fill="#a0d8ed" stroke="#244763" strokeWidth="2"/>
            <g transform="translate(25 -36)"><rect width="58" height="28" rx="10" fill="#fff" stroke="#244763" strokeWidth="3"/><text x="29" y="19" textAnchor="middle" fontSize="13" fontWeight="800" fill="#244763">DATA</text></g>
          </g>
          <g stroke="#3e8b77" strokeWidth="3"><path d="M78 305 L78 282 M73 288 L78 281 L83 288"/><path d="M550 329 L550 312 M544 319 L550 308 L556 319"/></g>
          <g fill="#4caf84"><circle cx="78" cy="273" r="15"/><circle cx="550" cy="302" r="18"/><circle cx="570" cy="320" r="9"/></g>
          <g fill="#fff" stroke="#244763" strokeWidth="3"><ellipse cx="285" cy="355" rx="17" ry="8"/><ellipse cx="400" cy="336" rx="14" ry="7"/></g>
          <path d="M278 347 Q284 339 293 347 M393 330 Q399 321 406 329" fill="none" stroke="#244763" strokeWidth="2"/>
          <circle cx="283" cy="344" r="3" fill="#ff6b5b"/><circle cx="399" cy="325" r="3" fill="#ff6b5b"/>
        </g>
        <g fill="#fff" stroke="#244763" strokeWidth="3" className="cv-float-label"><rect x="28" y="398" width="175" height="48" rx="18"/><circle cx="55" cy="422" r="11" fill="#75d29a" stroke="none"/><text x="74" y="428" fontSize="16" fontWeight="800" fill="#244763">All systems happy</text></g>
        <g fill="#fff" stroke="#244763" strokeWidth="3" className="cv-floating-star"><path d="M588 200 l8 17 17 8 -17 8 -8 17 -8 -17 -17 -8 17 -8Z" fill="#ffd966"/></g>
      </svg>
      <div className="cv-world-note"><span className="cv-status-dot"/> A little world, a lot to learn</div>
    </div>
  );
}


export default function CloudvilleWelcome({ onStart, onResume, completed = 0 }) {
  return <section className="cv2-hero" aria-labelledby="home-title">
    <div className="cv2-hero-content">
      <span className="cv2-kicker"><span className="cv2-kicker-dot"/> CLOUD COMPUTING, MADE FRIENDLY</span>
      <h1 id="home-title">Big cloud ideas.<br/><span>Little town energy.</span></h1>
      <p>Meet the cafés, servers and streets that make the internet work. Learn by playing with real concepts — no technical background needed.</p>
      <div className="cv2-hero-actions"><button type="button" onClick={onStart} className="cv2-primary">Explore the lessons <span>→</span></button>{completed>0&&<button type="button" onClick={onResume} className="cv2-secondary">Continue learning ↗</button>}</div>
      <div className="cv2-proof"><div className="cv2-proof-badges"><span>✦</span><span>☕</span><span>☁</span></div><span><strong>5 bite-sized lessons</strong><small>Play, experiment, understand.</small></span></div>
    </div>
    <div className="cv2-hero-art"><div className="cv2-hero-art-head"><span>WELCOME TO CLOUDVILLE</span><span className="cv2-live-dot"/> </div><CityArt/><span className="cv2-hero-art-foot">A SMALL TOWN FOR BIG IDEAS <span>↗</span></span></div>
  </section>;
}
