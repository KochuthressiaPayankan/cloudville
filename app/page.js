
"use client";
import { useEffect, useRef, useState } from "react";
import CloudvilleWelcome, { CityArt, lessons } from "./CloudvilleWelcome";
import { trackEvent } from "./tracking";
import LessonQuiz from "./LessonQuiz";

import { W, PRICE, LB_PRICE, fresh, update, draw } from "./simulation";

export default function Home() {
  const [screen, setScreen] = useState("cover");
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [showGlossary, setShowGlossary] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const lessonTopRef = useRef(null);
  const canvasRef = useRef(null);
  const canvasBRef = useRef(null);
  const simRef = useRef(fresh());
  const simBRef = useRef(fresh());
  const rateRef = useRef(0.5);
  const serversRef = useRef(1);
  const slowRef = useRef(false);
  const lbRef = useRef(false);
  const lessonRef = useRef(1);
  const waveRef = useRef(true);
  const storeRef = useRef("head");
  const twoRef = useRef(false);
  const [lesson, setLesson] = useState(1);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [progressLoaded, setProgressLoaded] = useState(false);
  // Load saved learning progress when Cloudville opens
  useEffect(() => {
    try {
      const saved = localStorage.getItem("cloudville-completed-lessons");

      if (saved) {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          setCompletedLessons(
            [...new Set(parsed.filter((n) => Number.isInteger(n) && n >= 1 && n <= 5))]
          );
        }
      }
    } catch (error) {
      console.error("Could not load learning progress:", error);
    }

    try {
      const last = sessionStorage.getItem("cloudville-last-page");
      if (last) { const parsed = JSON.parse(last); if (["cover", "map", "intro", "lab", "notes", "quiz", "finish"].includes(parsed.screen)) { setScreen(parsed.screen); if (Number.isInteger(parsed.lesson) && parsed.lesson >= 1 && parsed.lesson <= 5) setLesson(parsed.lesson); } }
    } catch {}
    setProgressLoaded(true);
  }, []);

  // Save progress whenever completed lessons change
  useEffect(() => {
    if (!progressLoaded) return;

    try {
      localStorage.setItem(
        "cloudville-completed-lessons",
        JSON.stringify(completedLessons)
      );
    } catch (error) {
      console.error("Could not save learning progress:", error);
    }
  }, [completedLessons, progressLoaded]);
  const goToNextLesson = () => {
    if (lesson >= 5) { setScreen("finish"); trackEvent("course_completed"); return; }
    switchLesson(lesson + 1);
    setScreen("intro");
    trackEvent("lesson_started", { lesson_number: lesson + 1 });
  };
  const navigate = (target, nextLesson) => {
    if (nextLesson != null) switchLesson(nextLesson);
    setScreen(target);
    if (target === "intro" && nextLesson != null) trackEvent("lesson_started", { lesson_number: nextLesson });
    if (target === "lab") trackEvent("simulation_opened", { lesson_number: nextLesson ?? lesson });
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  const openLesson = (n) => navigate("intro", n);
  const stages = ["intro", "lab", "notes", "quiz"];
  const nextPage = () => {
    if (screen === "cover") return navigate("map");
    if (screen === "map") return openLesson(lesson);
    if (screen === "finish") return navigate("map");
    if (screen === "quiz" && !completedLessons.includes(lesson)) return;
    const idx = stages.indexOf(screen);
    if (idx < 3) return navigate(stages[idx + 1]);
    if (lesson === 5) return navigate("finish");
    openLesson(lesson + 1);
  };
  const prevPage = () => {
    if (screen === "cover") return;
    if (screen === "map") return navigate("cover");
    if (screen === "finish") return navigate("quiz", 5);
    const idx = stages.indexOf(screen);
    if (idx > 0) return navigate(stages[idx - 1]);
    if (lesson === 1) return navigate("map");
    navigate("quiz", lesson - 1);
  };
  useEffect(() => {
    if (!progressLoaded) return;
    try { sessionStorage.setItem("cloudville-last-page", JSON.stringify({screen, lesson})); } catch {}
  }, [screen, lesson, progressLoaded]);
  useEffect(() => {
    const handler = (event) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.target.closest("input,textarea,select,button,a")) return;
      if (event.key === "ArrowRight" || event.key === "PageDown") { event.preventDefault(); nextPage(); }
      if (event.key === "ArrowLeft" || event.key === "PageUp") { event.preventDefault(); prevPage(); }
      if (event.key === "Escape") { setShowGlossary(false); setFeedbackOpen(false); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });
  const [rate, setRate] = useState(0.5);
  const [hired, setHired] = useState(1);
  const [lb, setLb] = useState(false);
  const [wave, setWave] = useState(true);
  const [slow, setSlow] = useState(false);
  const [store, setStore] = useState("head");
  const [two, setTwo] = useState(false);
  const [stats, setStats] = useState({
    served: 0, lost: 0, bill: 0, waiting: 0, servers: 1, rate: 0.5,
    saved: 0, training: false, down: "", lag: false, route: ""
  });

  const servers = lesson === 1 ? 1 : lesson === 2 ? hired : lesson === 3 ? stats.servers : lesson === 5 && two ? 4 : 2;
  const autoTraffic = lesson === 3 && wave;
  const shownRate = autoTraffic ? stats.rate : rate;
  rateRef.current = rate;
  serversRef.current = lesson === 1 ? 1 : lesson === 2 ? hired : 2;
  slowRef.current = slow;
  lbRef.current = (lesson === 2 && lb) || lesson >= 4;
  lessonRef.current = lesson;
  waveRef.current = wave;
  storeRef.current = store;
  twoRef.current = two;

  const resetAll = () => { simRef.current = fresh(); simBRef.current = fresh(); };
  const resetProgress = () => {
    const confirmed = window.confirm(
      "Are you sure you want to reset all your Cloudville learning progress?"
    );

    if (!confirmed) return;

    setCompletedLessons([]);
    localStorage.removeItem("cloudville-completed-lessons");
    switchLesson(1);
  };
  const switchLesson = (n) => {
    setLesson(n); setHired(1); setLb(false); setStore("head"); setTwo(false); resetAll();
  };

  useEffect(() => {
    if (screen !== "lab" || !canvasRef.current || !canvasBRef.current) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const ctxA = canvasRef.current.getContext("2d");
    const ctxB = canvasBRef.current.getContext("2d");
    const prep = (canvas, ctx, h, off) => {
      if (canvas.width !== W * dpr || canvas.height !== Math.round(h * dpr)) {
        canvas.width = W * dpr; canvas.height = Math.round(h * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, -off * dpr);
    };
    let raf = null;
    let last = performance.now(), sinceStats = 0;
    let isVisible = false;
    let tabVisible = !document.hidden;
    const stop = () => {
      if (raf !== null) cancelAnimationFrame(raf);
      raf = null;
    };
    const syncAnimation = () => {
      if (!isVisible || !tabVisible) {
        stop();
        return;
      }
      if (raf === null) {
        last = performance.now(); // No large time jump when returning to the lesson.
        raf = requestAnimationFrame(loop);
      }
    };
    const onVisibilityChange = () => {
      tabVisible = !document.hidden;
      syncAnimation();
    };
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      syncAnimation();
    }, { threshold: 0 });
    observer.observe(canvasRef.current);
    document.addEventListener("visibilitychange", onVisibilityChange);
    const loop = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05) * (slowRef.current ? 0.4 : 1);
      last = now; sinceStats += dt;
      const L = lessonRef.current, five = L === 5, twoNow = five && twoRef.current;
      const A = simRef.current, B = simBRef.current, rate = rateRef.current;
      A.store = storeRef.current;
      let rA = rate, rB = 0;
      A.label = "";
      if (five) {
        A.label = twoNow ? "Café A (Availability Zone A)" : "Your café (one location)";
        B.label = "Café B (Availability Zone B)";
        if (twoNow) {
          const okA = A.downFor < 2, okB = B.downFor < 2;
          if (okA && okB) { rA = rB = rate / 2; }
          else if (okA) { rA = rate; rB = 0; }
          else if (okB) { rA = 0; rB = rate; }
          else { rA = rB = rate / 2; }
        }
      }
      update(A, dt, rA, serversRef.current, lbRef.current, L, waveRef.current);
      if (twoNow) update(B, dt, rB, 2, true, 5, false);
      prep(canvasRef.current, ctxA, five ? 260 : 400, five ? 140 : 0);
      draw(ctxA, A, L);
      if (twoNow) { prep(canvasBRef.current, ctxB, 260, 140); draw(ctxB, B, L); }
      if (sinceStats > 0.35) {
        sinceStats = 0;
        const sims = twoNow ? [A, B] : [A];
        const sum = (k) => sims.reduce((t, x) => t + x[k], 0);
        setStats({
          served: sum("served"), lost: sum("lost"),
          bill: sum("bill"),
          waiting: sims.reduce((t, x) => t + x.queue.length, 0),
          servers: A.target, rate: A.rateNow, saved: A.fixed - A.bill,
          training: A.baristas.some((b) => b.st === "training"),
          down: A.down ? "A" : twoNow && B.down ? "B" : "",
          lag: (A.down && A.downFor < 2) || (twoNow && B.down && B.downFor < 2),
          route: twoNow ? `Router sends ${Math.round((100 * rA) / (rate || 1))}% to Café A and ${Math.round((100 * rB) / (rate || 1))}% to Café B` : "",
        });
      }
      raf = requestAnimationFrame(loop);
    };
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      stop();
    };
  }, [screen]);

  const capacity = servers * 0.5;
  let message;
  if (lesson === 2 && servers > 1 && !lb) {
    message = "You hired more baristas, but every visitor still queues for barista #1. The others stand idle. Turn the greeter on.";
  } else if (lesson === 3) {
    message = stats.lost > 0 && shownRate > capacity
      ? "Some visitors walked out before the new baristas arrived. Auto Scaling needs a moment to react."
      : shownRate > capacity
        ? "Traffic is rising and the café is hiring baristas by itself."
        : "Quiet time. The café sends extra baristas home, so you stop paying for them.";
  } else if (lesson === 4) {
    message = stats.training
      ? "The new barista doesn't know the recipes. They were only in the old barista's head, so that line is stuck."
      : store === "room"
        ? "Recipes live in the storeroom, so any new barista can read them and start right away. Crash a barista to test it."
        : "Recipes are only in the baristas' heads. Crash a barista and see what happens.";
  } else if (lesson === 5) {
    message = !stats.down
      ? two ? "Two locations share the visitors. Cut the power at one of them." : "You have one location. Cut the power and see what happens."
      : !two ? "Your only café lost power, so every visitor is turned away."
        : stats.lag ? "The router hasn't noticed yet. Some visitors still go to the dark café."
          : "The router's health check noticed and now sends everyone to the working café.";
  } else if (stats.lost > 0 && rate > capacity) {
    message = lesson === 1
      ? "Visitors are shouting and walking out. One server can't keep up."
      : "Visitors are walking out. Even with a greeter, you need enough baristas for this traffic.";
  } else if (rate > capacity) {
    message = lesson === 1
      ? "More visitors are arriving than your barista can serve. The line keeps growing."
      : "Traffic is higher than your team can handle. Hire another barista.";
  } else {
    message = "Your café is keeping up. Push the traffic up and see when it breaks.";
  }

  const cut = (sim) => { sim.down = true; sim.downT = 10; };
  const tabs = ["The lonely server", "More servers and a greeter", "Auto Scaling", "The storeroom", "Two locations"];
  const lessonDetails = [
    {
      objective: "Understand what a cloud server does and why websites need servers.",
      concept: "Amazon EC2 — virtual servers in the cloud.",
      challenge: "Increase visitor traffic until your single barista struggles. Observe what happens to the queue.",
      takeaway: "A server handles requests. Too much traffic can overwhelm a single server."
    },
    {
      objective: "Understand why websites use multiple servers and distribute incoming traffic.",
      concept: "Elastic Load Balancing — distributing requests across servers.",
      challenge: "Hire three baristas, leave the greeter off, and then turn the greeter on. Compare the queues.",
      takeaway: "A load balancer distributes incoming requests across available servers."
    },
    {
      objective: "Understand how cloud infrastructure adjusts to changing demand.",
      concept: "EC2 Auto Scaling — automatically adding or removing servers.",
      challenge: "Watch a rush-hour cycle. Notice when servers are added and when they are sent home.",
      takeaway: "Auto Scaling helps match server capacity to demand."
    },
    {
      objective: "Understand why application data should be stored separately from servers.",
      concept: "Amazon S3, Amazon RDS and Amazon DynamoDB.",
      challenge: "Crash a barista with recipes in their head. Then move the recipes to the storeroom and try again.",
      takeaway: "External storage helps applications retain data even when servers are replaced."
    },
    {
      objective: "Understand how multiple locations help keep applications available.",
      concept: "AWS Regions, Availability Zones and health checks.",
      challenge: "Turn on two locations and cut the power at Café A. Observe how the router responds.",
      takeaway: "Distributing applications across locations can improve availability."
    }
  ];


  const chapterNames = ["Server Street", "Gateway Square", "Scaling Heights", "Storage Lane", "Availability Avenue"];
  const chapterTypes = ["COMPUTE", "NETWORKING", "AUTO SCALING", "STORAGE", "RELIABILITY"];
  const pageNumber = screen === "cover" ? 0 : screen === "map" ? 1 : screen === "finish" ? 22 : 2 + (lesson - 1) * 4 + stages.indexOf(screen);
  const feedbackUrl = process.env.NEXT_PUBLIC_FEEDBACK_URL || "";
  const sendFeedback = () => {
    trackEvent("feedback_clicked", { page: screen });
    if (feedbackUrl) window.open(feedbackUrl, "_blank", "noopener,noreferrer");
    else setFeedbackOpen(true);
  };
  const activeStep = stages.includes(screen) ? stages.indexOf(screen) : -1;
  const stepLabels = ["Overview", "Experiment", "What you learned", "Quick quiz"];
  const progress = Math.round(completedLessons.length / 5 * 100);
  const currentLesson = lessons[lesson - 1];
  const openNext = () => {
    if (screen === "cover") return navigate("map");
    if (screen === "map") return openLesson([1,2,3,4,5].find(i => !completedLessons.includes(i)) || 1);
    if (screen === "finish") return navigate("map");
    if (screen === "quiz" && !completedLessons.includes(lesson)) return;
    nextPage();
  };
  return (
    <div className="cv2-app">
      <header className="cv2-header">
        <button type="button" className="cv2-brand" onClick={() => navigate("cover")} aria-label="Go to Cloudville home"><span className="cv2-brand-icon" aria-hidden="true">☁</span><span>cloudville<span className="cv2-brand-dot">.</span></span></button>
        <nav className="cv2-nav" aria-label="Main navigation">
          <button type="button" className={screen === "cover" ? "cv2-nav-active" : ""} onClick={() => navigate("cover")}>Home</button>
          <button type="button" className={screen === "map" ? "cv2-nav-active" : ""} onClick={() => navigate("map")}>Lessons</button>
          <button type="button" onClick={() => setShowGlossary(true)}>Glossary</button>
        </nav>
        <div className="cv2-header-right"><button type="button" className="cv2-feedback" onClick={sendFeedback}>Feedback <span aria-hidden="true">↗</span></button><span className="cv2-header-progress" title={`${progress}% completed`}>{completedLessons.length}/5 <span>completed</span></span></div>
      </header>
      <main className={`cv2-stage cv2-screen-${screen}`} id="main-content" key={`${screen}-${lesson}`}>
        {screen === "cover" && <CloudvilleWelcome onStart={() => navigate("map")} onResume={() => openLesson([1,2,3,4,5].find(i=>!completedLessons.includes(i)) || 5)} completed={completedLessons.length} />}
        {screen === "map" && <section className="cv2-explore" aria-labelledby="explore-title">
          <div className="cv2-explore-heading"><div><span className="cv2-kicker">YOUR LEARNING JOURNEY</span><h1 id="explore-title">Pick a place. <span>Learn a little.</span></h1><p>Five short, hands-on lessons. One little café that explains the big ideas behind cloud computing.</p></div><div className="cv2-progress"><span>YOUR PROGRESS <b>{completedLessons.length} / 5</b></span><div className="cv2-progress-track"><i style={{width:`${progress}%`}}/></div><small>{completedLessons.length===5?"You've explored the whole town!":"Every passed quiz completes one lesson."}</small></div></div>
          <div className="cv2-lesson-grid">{lessons.map((item,idx)=><button type="button" className={`cv2-lesson-card cv2-color-${item.color}`} key={item.number} onClick={()=>openLesson(idx+1)}><span className="cv2-card-top"><span>LESSON {item.number}</span><span className="cv2-card-check">{completedLessons.includes(idx+1)?"✓ Completed":"↗"}</span></span><span className="cv2-card-visual" aria-hidden="true">{item.icon}</span><span className="cv2-card-bottom"><small>{item.tag}</small><strong>{item.name}</strong><span>{item.description}</span></span></button>)}</div>
          <div className="cv2-explore-bottom"><span>Start anywhere. Your progress is saved on this device.</span><button type="button" className="cv2-quiet-link" onClick={resetProgress}>Reset progress</button></div>
        </section>}
        {stages.includes(screen) && <section className="cv2-lesson" aria-label={`Lesson ${lesson}: ${currentLesson.name}`}>
          <div className="cv2-lesson-top"><button type="button" className="cv2-back" onClick={()=>navigate("map")}>← All lessons</button><div className="cv2-lesson-breadcrumb">LESSON {String(lesson).padStart(2,"0")} OF 05 <span>·</span> {currentLesson.name}</div><button type="button" className="cv2-skip" onClick={()=>openLesson(lesson===5?1:lesson+1)}>Switch lesson ↗</button></div>
          <div className="cv2-stepper" aria-label="Lesson sections">{stepLabels.map((label,i)=><button key={label} type="button" className={i===activeStep?"cv2-step cv2-step-active":"cv2-step"} onClick={()=>navigate(stages[i])}><span>{i+1}</span><span>{label}</span></button>)}</div>
          {screen === "intro" && <div className="cv2-intro"><div className="cv2-intro-content"><span className="cv2-kicker">{currentLesson.tag} · LESSON {lesson}</span><h1>{currentLesson.title}</h1><p className="cv2-lead">{currentLesson.description}</p><div className="cv2-concept"><span>WHAT YOU'LL LEARN</span><p>{lessonDetails[lesson-1].objective}</p></div><button className="cv2-primary" type="button" onClick={()=>navigate("lab")}>Try the experiment <span>→</span></button></div><div className={`cv2-intro-art cv2-color-${currentLesson.color}`}><span className="cv2-large-icon" aria-hidden="true">{currentLesson.icon}</span><div className="cv2-art-caption"><span>☁ CLOUDVILLE LAB</span><strong>{currentLesson.name}</strong></div></div></div>}
          {screen === "lab" && <div className="cv2-lab"><div className="cv2-lab-heading"><div><span className="cv2-kicker">HANDS-ON EXPERIENCE</span><h1>Your café is live.</h1><p>{lessonDetails[lesson-1].challenge}</p></div><span className="cv2-live"><i/> LIVE SIMULATION</span></div><div className="cv2-lab-content"><div className="cv2-lab-workspace" onClick={(e) => { if (e.target.closest("button")) trackEvent("simulation_interacted", { lesson_number: lesson, action: "button" }); }} onChange={(e) => { if (e.target.matches("input[type=range]")) trackEvent("simulation_interacted", { lesson_number: lesson, action: "slider" }); }}>
        <div className="simulation-heading"><div><span className="lab-eyebrow">LIVE EXPERIMENT</span><h2>Inside your café</h2></div><span className="live-pill"><span aria-hidden="true" /> Live simulation</span></div>
        <canvas ref={canvasRef} className={lesson === 5 ? "cafe short" : "cafe"}
          role="img"
          aria-label="Side view of a café: a line of customers waits at the counter while baristas run between the counter and the coffee machines" />
        <canvas ref={canvasBRef} className="cafe short second"
          style={{ display: lesson === 5 && two ? "block" : "none" }}
          role="img" aria-label="Side view of a second café in another location" />

        <div className="message" role="status" aria-live="polite"><span className="message-icon" aria-hidden="true">💬</span><p>{message}</p></div>

        <div className="panel">
          <div className="control-heading"><div><span className="lab-eyebrow">PLAY WITH THE SETTINGS</span><h2>Experiment controls</h2></div><span className="control-hint">Try changing the traffic first</span></div>
          <label className="slider">
            {autoTraffic ? "Traffic now (rush hour wave)" : "Traffic"}: <b>{shownRate.toFixed(2)}</b> visitors per second
            <input type="range" min="0.25" max="2.5" step="0.25" value={shownRate}
              disabled={autoTraffic} onChange={(e) => setRate(Number(e.target.value))} />
          </label>

          <div className="row">
            {lesson === 2 && (
              <>
                <button onClick={() => setHired((n) => Math.min(4, n + 1))} disabled={hired >= 4}>Hire a barista</button>
                <button onClick={() => setHired((n) => Math.max(1, n - 1))} disabled={hired <= 1}>Send one home</button>
                <button className={lb ? "on" : ""} aria-pressed={lb}
                  onClick={() => setLb((v) => !v)}>Greeter: {lb ? "on" : "off"}</button>
              </>
            )}
            {lesson === 3 && (
              <button className={wave ? "on" : ""} aria-pressed={wave}
                onClick={() => setWave((v) => !v)}>Rush hour wave: {wave ? "on" : "off"}</button>
            )}
            {lesson === 4 && (
              <>
                <button className={store === "room" ? "on" : ""} aria-pressed={store === "room"}
                  onClick={() => setStore((v) => (v === "room" ? "head" : "room"))}>
                  Recipes kept in: {store === "room" ? "the storeroom" : "the baristas' heads"}
                </button>
                <button onClick={() => { simRef.current.crash = true; }}>Crash barista #2</button>
              </>
            )}
            {lesson === 5 && (
              <>
                <button className={two ? "on" : ""} aria-pressed={two}
                  onClick={() => { setTwo((v) => !v); resetAll(); }}>
                  Locations: {two ? "two, with a router" : "one"}
                </button>
                <button onClick={() => cut(simRef.current)}>Cut power at Café A</button>
                {two && <button onClick={() => cut(simBRef.current)}>Cut power at Café B</button>}
              </>
            )}
            <button onClick={() => setSlow((s) => !s)}>{slow ? "Normal speed" : "Slow motion"}</button>
            <button className="reset" onClick={resetAll}>Reset café</button>
          </div>

          {stats.route && lesson === 5 && <p className="route">{stats.route}</p>}

          <div className="stats" aria-label="Live café statistics">
            <p><b>{servers}</b> {servers === 1 ? "server" : "servers"}</p>
            <p><b>{stats.waiting}</b> waiting</p>
            <p><b>{stats.served}</b> served</p>
            <p className={stats.lost ? "bad" : ""}><b>{stats.lost}</b> walked out</p>
            <p><b>${stats.bill.toFixed(2)}</b> bill so far</p>
            {lesson === 3 && <p className="good"><b>${Math.max(0, stats.saved).toFixed(2)}</b> saved vs. always 4 baristas</p>}
          </div>

          <small>
            Each barista serves about 0.5 visitors per second and costs ${PRICE.toFixed(2)} per hour.
            {lesson >= 2 && ` The greeter costs $${LB_PRICE.toFixed(2)} per hour.`}
            {lesson === 3 && " Auto Scaling keeps 1 to 4 baristas: it hires when each barista has more than 2 people waiting, and sends one home after a few quiet seconds."}
            {lesson >= 4 && " Each café has 2 baristas."}
            {" "}1 second here = 1 hour.
          </small>
        </div>


          </div></div></div>}
          {screen === "notes" && <div className="cv2-notes"><div className="cv2-notes-side"><span className="cv2-kicker">THE BIG IDEA</span><h1>Here's what just happened.</h1><p>The café is a simple way to understand something real in the cloud.</p><div className="cv2-takeaway"><span>REMEMBER THIS</span><strong>{lessonDetails[lesson-1].takeaway}</strong></div></div><div className="cv2-notes-main">
        {lesson === 1 && (
          <section className="reveal">
            <h2>In AWS, this is called…</h2>
            <p>
              Baristas are <b>EC2 instances</b>, servers you rent by the hour. Visitors are requests.
              When requests arrive faster than one server can handle, the site slows down and then fails.
            </p>
          </section>
        )}

        {lesson === 2 && (
          <section className="reveal">
            <h2>Try this</h2>
            <p>
              Set traffic to 1.5, hire three baristas, and leave the greeter off. Only barista #1 works while the
              others stand idle. Now turn the greeter on: each visitor gets a coloured dot and goes to the barista
              with the shortest line.
            </p>
            <h2>In AWS, this is called…</h2>
            <p>
              Hiring more baristas is <b>scaling out</b> (adding EC2 instances). The greeter is an
              <b> Elastic Load Balancer (ELB)</b>, which spreads requests across your servers. It also costs money,
              and it only helps when you have more than one server.
            </p>
          </section>
        )}

        {lesson === 3 && (
          <section className="reveal">
            <h2>Try this</h2>
            <p>
              Watch one full rush hour, about 40 seconds. Traffic climbs, the café hires baristas by itself, and when
              traffic drops it sends them home. Compare your bill with the "always 4 baristas" cost. Then turn the wave off
              and push the slider yourself to test it.
            </p>
            <h2>In AWS, this is called…</h2>
            <p>
              This is an <b>EC2 Auto Scaling group</b>. You set a minimum (1) and a maximum (4) and a rule, such as
              "add a server when the line gets long". Because you pay only for servers that are running, auto scaling
              keeps you fast during rushes and cheap when it's quiet.
            </p>
          </section>
        )}

        {lesson === 4 && (
          <section className="reveal">
            <h2>Try this</h2>
            <p>
              With recipes in the baristas' heads, crash barista #2. The replacement arrives but can't make anything for
              8 seconds, and that line is stuck. Now keep the recipes in the storeroom and crash again: the replacement
              starts right away.
            </p>
            <h2>In AWS, this is called…</h2>
            <p>
              The storeroom is your data store: <b>Amazon S3</b> for files, or a database such as <b>RDS</b> or
              <b> DynamoDB</b>. Servers should be disposable, so keep your data outside them. That is why Auto Scaling from
              Lesson 3 can add and remove servers safely.
            </p>
          </section>
        )}

        {lesson === 5 && (
          <section className="reveal">
            <h2>Try this</h2>
            <p>
              With one location, cut the power and watch every visitor get turned away. Then switch to two locations and
              cut the power at Café A. For about 2 seconds the router still sends visitors there, then it notices and
              sends everyone to Café B.
            </p>
            <h2>In AWS, this is called…</h2>
            <p>
              Each café is an <b>Availability Zone</b>, a separate data centre. A group of zones in one area is a
              <b> Region</b>. A load balancer with <b>health checks</b> sends traffic only to healthy zones. Spreading across
              zones is called <b>high availability</b>, and it costs more because you run twice the servers.
            </p>
          </section>
        )}

          </div></div>}
          {screen === "quiz" && <div className="cv2-quiz"><div className="cv2-quiz-side"><span className="cv2-kicker">QUICK CHECK</span><h1>See what stuck.</h1><p>Three questions. Get at least two right to complete the lesson. You can always try again.</p><div className="cv2-quiz-state">{completedLessons.includes(lesson)?"✓ Lesson completed":"◯ Ready when you are"}</div></div><div className="cv2-quiz-main">
        <LessonQuiz
          key={lesson}
          lesson={lesson}
          onNextLesson={goToNextLesson}
          onComplete={(completedLesson) => {
            setCompletedLessons((previous) =>
              previous.includes(completedLesson)
                ? previous
                : [...previous, completedLesson]
            );
          }}
        />

          </div></div>}
        </section>}
        {screen === "finish" && <section className="cv2-finish"><div className="cv2-finish-icon">✦</div><span className="cv2-kicker">NICE WORK</span><h1>You explored the cloud.</h1><p>You made it through all five of Cloudville's little neighborhoods. Keep experimenting — that's how the ideas stick.</p><div className="cv2-finish-card"><span>CLOUDVILLE · LEARNING CERTIFICATE</span><h2>Cloud Explorer</h2><label htmlFor="explorer-name">Your name</label><input id="explorer-name" placeholder="Enter your name" value={displayName} onChange={e=>setDisplayName(e.target.value)} maxLength={70}/><p>{completedLessons.length} of 5 lessons completed</p></div>{completedLessons.length!==5 && <p className="cv2-warning">Complete all five quizzes to unlock printing.</p>}<div className="cv2-finish-actions"><button className="cv2-primary" disabled={completedLessons.length!==5} onClick={()=>window.print()}>Print certificate →</button><button className="cv2-secondary" onClick={()=>navigate("map")}>Explore lessons</button></div></section>}
      </main>
      <footer className="cv2-footer"><span className="cv2-footer-note">Made for curious minds. ☁</span><div className="cv2-page-controls"><button type="button" className="cv2-secondary" disabled={screen==="cover"} onClick={prevPage}>← Back</button><span className="cv2-page-label">{screen==="cover"?"Welcome":screen==="map"?"Explore":screen==="finish"?"Complete":`${currentLesson.name} · ${stepLabels[activeStep]}`}</span><button type="button" className="cv2-primary" disabled={screen === "quiz" && !completedLessons.includes(lesson)} onClick={openNext}>{screen==="cover"?"Explore Cloudville":screen==="map"?"Start learning":screen==="finish"?"Explore again":screen==="quiz"?"Next lesson":"Continue"} <span>→</span></button></div><span className="cv2-footer-note">Interactive cloud learning</span></footer>
      {showGlossary && <div className="cv2-overlay" onClick={()=>setShowGlossary(false)}><section className="cv2-dialog" role="dialog" aria-modal="true" aria-labelledby="glossary-title" onClick={e=>e.stopPropagation()}><button type="button" className="cv2-close" onClick={()=>setShowGlossary(false)} aria-label="Close">✕</button><span className="cv2-kicker">QUICK REFERENCE</span><h2 id="glossary-title">Cloud terms, simply.</h2><dl>{[["Server","A computer that handles requests — like a café barista."],["Request","A visitor asking a website for something."],["Load balancer","A greeter that shares visitors between servers."],["Auto Scaling","Adding or removing servers as demand changes."],["Storage","Where application files and data are kept."],["Availability Zone","An independently operated location inside an AWS Region."],["High availability","Keeping a service running despite failures."]].map(([term,desc])=><div key={term}><dt>{term}</dt><dd>{desc}</dd></div>)}</dl></section></div>}
      {feedbackOpen && <div className="cv2-overlay" onClick={()=>setFeedbackOpen(false)}><section className="cv2-dialog" role="dialog" aria-modal="true" aria-labelledby="feedback-title" onClick={e=>e.stopPropagation()}><button type="button" className="cv2-close" aria-label="Close" onClick={()=>setFeedbackOpen(false)}>✕</button><span className="cv2-kicker">WE'D LOVE YOUR THOUGHTS</span><h2 id="feedback-title">Help make Cloudville better.</h2><p>Add your public Google Form URL in <code>NEXT_PUBLIC_FEEDBACK_URL</code> to activate the feedback link.</p><button type="button" className="cv2-primary" onClick={()=>setFeedbackOpen(false)}>Got it</button></section></div>}
    </div>
  );
}
