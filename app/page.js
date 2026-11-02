"use client";
import { useEffect, useRef, useState } from "react";
import CloudvilleWelcome from "./CloudvilleWelcome";

const W = 800, H = 400;
const GROUND = 332, INK = "#1b2a49";
const MAX_LINE = 8, SLOT0 = 555, SLOT_GAP = 48;
const HOME_X = 640, MACHINE_X = (i) => 735 + i * 14, LANE_Y = (i) => GROUND - i * 9;
const BARISTA_SPEED = 220, CUSTOMER_SPEED = 140, BREW = 0.8, PATIENCE = 14;
const PRICE = 0.1; // $ per barista per simulated hour (1 real second = 1 hour)
const SKIN = ["#f1c27d", "#e0ac69", "#c68642", "#8d5524", "#ffdbac"];
const SHIRT = ["#6c8ef5", "#7bc67b", "#b784e0", "#f5a35c", "#5cc8d6"];
const SHOUTS = ["Hurry up!", "Too slow!", "Hello?!", "!!"];
const BCOL = ["#ff6b5b", "#4c8bf5", "#3fb66b", "#a56be0"];
const LB_PRICE = 0.05; // greeter (load balancer) cost per hour

const pick = (a) => a[Math.floor(Math.random() * a.length)];
const fresh = () => ({
  queue: [], leaving: [], baristas: [], acc: 0, served: 0, lost: 0, bill: 0,
  exiting: [], target: 1, t: 0, fixed: 0, cool: 0, busyT: 0, quietT: 0, event: "", eventT: 0, rateNow: 0,
  down: false, downT: 0, downFor: 0, store: "head", pendingTrain: false, crash: false, label: "",
  greeter: { x: 70, y: GROUND, face: 1, ph: 0, moving: false, skin: "#e0ac69", shirt: "#7b5cd6", mood: "ok", said: "", bubbleT: 0 },
});

function moveTo(o, tx, ty, dt, speed) {
  const dx = tx - o.x, dy = ty - o.y, d = Math.hypot(dx, dy), step = speed * dt;
  if (Math.abs(dx) > 1) o.face = dx > 0 ? 1 : -1;
  if (d <= step) { o.x = tx; o.y = ty; return true; }
  o.x += (dx / d) * step; o.y += (dy / d) * step;
  o.moving = true; o.ph = (o.ph || 0) + step * 0.12;
  return false;
}

function newCustomer() {
  return { x: -30, y: GROUND, face: 1, ph: Math.random() * 6, patience: PATIENCE, skin: pick(SKIN), shirt: pick(SHIRT),
    claimed: false, arrived: false, assigned: 0, cup: false, mood: "ok", said: "", bubbleT: 0 };
}

function leaveAngry(sim, c, line) {
  c.mood = "angry"; c.said = line; c.bubbleT = 2.2; c.claimed = false; sim.lost += 1; sim.leaving.push(c);
}

// The greeter (load balancer) sends each visitor to the barista with the fewest people waiting.
function assign(sim, servers, lb) {
  if (!lb || servers === 1) return 0;
  const counts = Array(servers).fill(0);
  sim.queue.forEach((q) => { if (q.assigned < servers) counts[q.assigned] += 1; });
  return counts.indexOf(Math.min(...counts));
}

function update(sim, dt, rate, servers, lb, lesson, wave) {
  sim.t += dt; sim.eventT -= dt;
  if (lesson >= 4) lb = true;
  if (sim.down) {
    sim.downT -= dt; sim.downFor += dt;
    if (sim.downT <= 0) sim.down = false;
    while (sim.queue.length) leaveAngry(sim, sim.queue.pop(), "No power!");
    sim.baristas.forEach((b) => { if (b.st !== "arriving") { b.c = null; b.cup = false; b.st = "idle"; } });
  } else sim.downFor = 0;
  if (sim.crash) {
    sim.crash = false;
    const k = sim.baristas[1];
    if (k) {
      sim.baristas.splice(1, 1);
      if (k.c) k.c.claimed = false;
      k.c = null; k.cup = false; k.st = "exiting"; k.said = "Crashed!"; k.bubbleT = 2;
      sim.exiting.push(k);
      sim.pendingTrain = sim.store === "head";
    }
  }
  if (lesson === 3) {
    // Auto Scaling: hire when lines get long, send people home when it is quiet.
    lb = true;
    if (wave) rate = 0.25 + ((1 - Math.cos((sim.t * 2 * Math.PI) / 40)) / 2) * 1.5; // rush hour every 40 s
    const waiting = sim.queue.length;
    sim.cool -= dt;
    sim.busyT = waiting > 2 * sim.target ? sim.busyT + dt : 0;
    sim.quietT = waiting === 0 && rate < (sim.target - 1) * 0.45 ? sim.quietT + dt : 0;
    if (sim.cool <= 0 && sim.busyT > 1.5 && sim.target < 4) {
      sim.target += 1; sim.cool = 3; sim.busyT = 0;
      sim.event = `Auto Scaling: line too long, hiring barista #${sim.target}`; sim.eventT = 3;
    } else if (sim.cool <= 0 && sim.quietT > 4 && sim.target > 1) {
      sim.event = `Auto Scaling: quiet, sending barista #${sim.target} home`; sim.eventT = 3;
      sim.target -= 1; sim.cool = 3; sim.quietT = 0;
    }
    servers = sim.target;
  }
  sim.rateNow = rate;
  sim.bill += (servers * PRICE + (lb ? LB_PRICE : 0)) * dt;
  sim.fixed += (4 * PRICE + LB_PRICE) * dt; // what it would cost to keep 4 baristas all day
  [...sim.queue, ...sim.leaving, ...sim.baristas, ...sim.exiting].forEach((p) => { p.moving = false; });

  while (sim.baristas.length < servers) {
    const i = sim.baristas.length;
    sim.baristas.push({ x: i === 0 ? HOME_X : W + 30, y: LANE_Y(i), face: -1, ph: 0, st: i === 0 ? "idle" : "arriving", c: null, t: 0, skin: pick(SKIN), cup: false, shirt: BCOL[i], label: "#" + (i + 1) });
    if (sim.pendingTrain) { sim.baristas[i].train = true; sim.pendingTrain = false; }
  }
  while (sim.baristas.length > servers) {
    const b = sim.baristas.pop();
    if (b.c) b.c.claimed = false;
    b.c = null; b.cup = false; b.st = "exiting"; sim.exiting.push(b);
  }
  sim.exiting = sim.exiting.filter((b) => { b.bubbleT -= dt; moveTo(b, W + 60, b.y, dt, BARISTA_SPEED); return b.x < W + 40; });

  sim.acc += rate * dt;
  while (sim.acc >= 1) {
    sim.acc -= 1;
    const c = newCustomer();
    if (sim.down) leaveAngry(sim, c, "They're closed!");
    else if (sim.queue.length >= MAX_LINE) leaveAngry(sim, c, "Line's too long!");
    else {
      c.assigned = assign(sim, servers, lb);
      sim.queue.push(c);
      sim.greeter.said = lb ? `Go to #${c.assigned + 1}` : "zzz…";
      sim.greeter.bubbleT = 0.9;
    }
  }
  if (!lb) { sim.greeter.said = "zzz…"; sim.greeter.bubbleT = 1; } else sim.greeter.bubbleT -= dt;
  sim.queue.forEach((q) => { if (q.assigned >= servers) q.assigned = assign(sim, servers, lb); });

  sim.baristas.forEach((b, i) => {
    if (sim.down && b.st !== "arriving") return;
    if (b.st === "arriving") {
      if (moveTo(b, HOME_X, LANE_Y(i), dt, BARISTA_SPEED)) { b.st = b.train ? "training" : "idle"; b.t = 8; }
    } else if (b.st === "training") {
      b.face = -1; b.t -= dt; b.said = "I don't know the recipes!"; b.bubbleT = 0.5;
      if (b.t <= 0) { b.st = "idle"; b.train = false; b.said = ""; b.bubbleT = 0; }
    } else if (b.st === "idle") {
      b.face = -1;
      const c = sim.queue.find((q) => !q.claimed && q.arrived && q.assigned === i);
      if (c) { c.claimed = true; b.c = c; b.st = "toMachine"; }
    } else if (b.st === "toMachine") {
      if (moveTo(b, MACHINE_X(i), LANE_Y(i), dt, BARISTA_SPEED)) { b.st = "brew"; b.t = 0; b.face = 1; }
    } else if (b.st === "brew") {
      b.t += dt; if (b.t >= BREW) b.st = "toCounter";
    } else if (b.st === "toCounter") {
      if (moveTo(b, HOME_X, LANE_Y(i), dt, BARISTA_SPEED)) {
        const idx = sim.queue.indexOf(b.c);
        if (idx >= 0) {
          sim.queue.splice(idx, 1);
          b.c.mood = "happy"; b.c.cup = true; b.c.said = "Thanks!"; b.c.bubbleT = 1.4;
          sim.leaving.push(b.c); sim.served += 1;
        }
        b.c = null; b.st = "idle";
      }
    }
  });

  for (let i = sim.queue.length - 1; i >= 0; i--) {
    const c = sim.queue[i];
    const slotX = SLOT0 - i * SLOT_GAP;
    moveTo(c, slotX, GROUND, dt, CUSTOMER_SPEED);
    if (Math.abs(c.x - slotX) < 10) c.arrived = true;
    c.bubbleT -= dt;
    if (c.arrived && !c.claimed) {
      c.patience -= dt;
      if (c.patience < 5 && c.bubbleT <= 0 && Math.random() < dt * 0.5) { c.said = pick(SHOUTS); c.bubbleT = 1.4; }
      if (c.patience <= 0) { sim.queue.splice(i, 1); leaveAngry(sim, c, "I'm leaving!"); }
    }
  }

  sim.leaving = sim.leaving.filter((c) => {
    c.bubbleT -= dt;
    moveTo(c, -60, GROUND, dt, CUSTOMER_SPEED * 1.2);
    return c.x > -50;
  });
}
function person(ctx, p, kind) {
  const x = p.x, y = p.y, f = p.face || 1;
  const sw = p.moving ? Math.sin(p.ph) * 9 : 0;
  const mad = kind === "customer" && (p.mood === "angry" || (p.arrived && !p.claimed && p.patience < 5));
  ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.strokeStyle = INK;
  ctx.fillStyle = "rgba(27,42,73,.18)"; ctx.beginPath(); ctx.ellipse(x, y + 2, 16, 5, 0, 0, 7); ctx.fill();
  ctx.lineWidth = 7; ctx.beginPath();
  ctx.moveTo(x - 3, y - 28); ctx.lineTo(x - 3 + sw, y - 2);
  ctx.moveTo(x + 3, y - 28); ctx.lineTo(x + 3 - sw, y - 2); ctx.stroke();
  ctx.lineWidth = 2.5; ctx.fillStyle = p.shirt;
  ctx.beginPath(); ctx.roundRect(x - 10, y - 58, 20, 32, 6); ctx.fill(); ctx.stroke();
  if (kind === "barista") { ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.roundRect(x - 7, y - 46, 14, 20, 4); ctx.fill(); }
  ctx.strokeStyle = p.skin; ctx.lineWidth = 5; ctx.beginPath();
  ctx.moveTo(x, y - 52); ctx.lineTo(x + f * 11, y - 40 + sw * 0.3); ctx.stroke();
  ctx.strokeStyle = INK; ctx.lineWidth = 2;
  if (p.cup || (kind === "barista" && p.st === "toCounter")) {
    ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.roundRect(x + f * 11 - 5, y - 52, 10, 13, 2); ctx.fill(); ctx.stroke();
  }
  ctx.lineWidth = 2.5; ctx.fillStyle = mad ? "#ff8a7a" : p.skin;
  ctx.beginPath(); ctx.arc(x, y - 68, 12, 0, 7); ctx.fill(); ctx.stroke();
  ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(x + f * 5, y - 70, 2, 0, 7); ctx.fill();
  ctx.lineWidth = 2; ctx.beginPath();
  if (mad) {
    ctx.moveTo(x + f * 1, y - 77); ctx.lineTo(x + f * 9, y - 73);
    ctx.moveTo(x + f * 2, y - 61); ctx.quadraticCurveTo(x + f * 5, y - 65, x + f * 8, y - 61);
  } else if (p.mood === "happy") {
    ctx.moveTo(x + f * 2, y - 63); ctx.quadraticCurveTo(x + f * 5, y - 59, x + f * 8, y - 63);
  } else {
    ctx.moveTo(x + f * 2, y - 62); ctx.lineTo(x + f * 8, y - 62);
  }
  ctx.stroke();
  if (kind === "barista") {
    ctx.fillStyle = "#fff"; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.roundRect(x - 10, y - 88, 20, 11, 4); ctx.fill(); ctx.stroke();
  }
  if (kind === "customer" && p.arrived && !p.claimed) {
    const r = Math.max(0, p.patience / PATIENCE);
    ctx.fillStyle = "rgba(27,42,73,.25)"; ctx.fillRect(x - 15, y - 94, 30, 5);
    ctx.fillStyle = r > 0.5 ? "#4caf50" : r > 0.25 ? "#ffb300" : "#e53935";
    ctx.fillRect(x - 15, y - 94, 30 * r, 5);
  }
  if (ctx._dots && kind === "customer" && p.mood === "ok" && p.assigned !== undefined) {
    ctx.fillStyle = BCOL[p.assigned]; ctx.strokeStyle = INK; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(x - 22, y - 91, 5, 0, 7); ctx.fill(); ctx.stroke();
  }
  if (ctx._dots && kind === "barista" && p.label) {
    ctx.fillStyle = INK; ctx.font = "bold 12px sans-serif"; ctx.textAlign = "center"; ctx.fillText(p.label, x, y - 94);
  }
  if (p.bubbleT > 0 && p.said) {
    ctx.font = "bold 13px sans-serif"; ctx.textAlign = "center";
    const w = ctx.measureText(p.said).width + 14;
    ctx.fillStyle = "#fff"; ctx.strokeStyle = INK; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(x - w / 2, y - 124, w, 22, 8); ctx.fill(); ctx.stroke();
    ctx.fillStyle = mad ? "#c2271a" : INK; ctx.fillText(p.said, x, y - 108);
  }
}

function cloud(ctx, x, y, s) {
  ctx.fillStyle = "#fff";
  [[0, 0, 22], [24, -10, 28], [52, 0, 22], [26, 6, 24]].forEach(([dx, dy, r]) => {
    ctx.beginPath(); ctx.arc(x + dx * s, y + dy * s, r * s, 0, 7); ctx.fill();
  });
}

function draw(ctx, sim, lesson) {
  ctx._dots = lesson >= 2;
  ctx.fillStyle = "#dff0ff"; ctx.fillRect(0, 0, W, H);
  cloud(ctx, 60, 50, 1); cloud(ctx, 330, 30, 0.8); cloud(ctx, 470, 70, 0.7);
  ctx.fillStyle = "#9aa5b5"; ctx.fillRect(0, GROUND, W, H - GROUND);           // street
  ctx.fillStyle = INK; ctx.fillRect(0, GROUND, W, 3);
  ctx.fillStyle = "#ffe9b0"; ctx.fillRect(590, 150, 210, GROUND - 150);          // shop wall
  ctx.fillStyle = "#c98c5a"; ctx.fillRect(590, 300, 210, GROUND - 300);          // shop floor
  ctx.fillStyle = "#ff6b5b"; ctx.fillRect(580, 118, 220, 36);                    // awning
  ctx.fillStyle = "#fff"; for (let x = 590; x < 800; x += 40) ctx.fillRect(x, 118, 20, 36);
  ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.strokeRect(580, 118, 220, 36);
  ctx.fillStyle = "#8a6a4a"; ctx.fillRect(700, 296, 100, 6);                     // machine shelf
  if (lesson === 4) {
    const room = sim.store === "room";
    ctx.fillStyle = room ? "#d7f3e0" : "#e5e5e5"; ctx.strokeStyle = room ? "#3fb66b" : "#999"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.roundRect(600, 172, 92, 62, 8); ctx.fill(); ctx.stroke();
    ctx.fillStyle = INK; ctx.font = "bold 12px sans-serif"; ctx.textAlign = "center";
    ctx.fillText("Storeroom", 646, 192); ctx.fillText(room ? "Recipe book" : "(empty)", 646, 212);
    if (room) ctx.fillText("📖", 646, 228);
  }
  sim.baristas.forEach((b, i) => {
    ctx.fillStyle = "#555"; ctx.fillRect(MACHINE_X(i) - 6, 252, 12, 44);
    ctx.fillStyle = "#ff6b5b"; ctx.fillRect(MACHINE_X(i) - 4, 256, 8, 6);
  });
  sim.exiting.forEach((b) => person(ctx, b, "barista"));
  [...sim.baristas].reverse().forEach((b) => person(ctx, b, "barista"));
  ctx.fillStyle = "#b5651d"; ctx.strokeStyle = INK; ctx.lineWidth = 3;           // counter
  ctx.fillRect(580, 272, 40, GROUND - 272); ctx.strokeRect(580, 272, 40, GROUND - 272);
  ctx.fillStyle = "#d9a066"; ctx.fillRect(576, 266, 48, 10); ctx.strokeRect(576, 266, 48, 10);
  if (lesson >= 2) person(ctx, { ...sim.greeter, y: GROUND - 14 }, "greeter");
  [...sim.queue].reverse().forEach((c) => person(ctx, c, "customer"));
  sim.leaving.forEach((c) => person(ctx, c, "customer"));
  ctx.fillStyle = INK; ctx.font = "bold 15px sans-serif"; ctx.textAlign = "center";
  ctx.fillText("Visitors walk in →", 130, 370);
  ctx.fillText("Counter", 600, 392);
  ctx.fillText("Baristas = your servers", 695, 372);
  ctx.fillText("CAFÉ", 690, 143);
  if (lesson >= 2) ctx.fillText("Greeter = load balancer", 110, 392);
  if (sim.eventT > 0 && sim.event) {
    ctx.font = "bold 14px sans-serif"; const w = ctx.measureText(sim.event).width + 28;
    ctx.fillStyle = "#fff"; ctx.strokeStyle = INK; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.roundRect(W / 2 - w / 2, 12, w, 30, 10); ctx.fill(); ctx.stroke();
    ctx.fillStyle = INK; ctx.fillText(sim.event, W / 2, 32);
  }
  if (sim.label) {
    ctx.fillStyle = INK; ctx.font = "bold 16px sans-serif"; ctx.textAlign = "left";
    ctx.fillText(sim.label, 12, 170); ctx.textAlign = "center";
  }
  if (sim.down) {
    ctx.fillStyle = "rgba(27,42,73,.6)"; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#fff"; ctx.font = "bold 32px sans-serif"; ctx.textAlign = "center";
    ctx.fillText("POWER CUT: this café is closed", W / 2, 260);
  }
}

export default function Home() {
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
  const [rate, setRate] = useState(0.5);
  const [hired, setHired] = useState(1);
  const [lb, setLb] = useState(false);
  const [wave, setWave] = useState(true);
  const [slow, setSlow] = useState(false);
  const [store, setStore] = useState("head");
  const [two, setTwo] = useState(false);
  const [stats, setStats] = useState({ served: 0, lost: 0, bill: 0, waiting: 0, servers: 1, rate: 0.5, saved: 0, training: false, down: "", lag: false, route: "" });

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
  const switchLesson = (n) => { setLesson(n); setHired(1); setLb(false); setStore("head"); setTwo(false); resetAll(); };

  useEffect(() => {
    const dpr = window.devicePixelRatio || 1;
    const ctxA = canvasRef.current.getContext("2d");
    const ctxB = canvasBRef.current.getContext("2d");
    const prep = (canvas, ctx, h, off) => {
      if (canvas.width !== W * dpr || canvas.height !== Math.round(h * dpr)) {
        canvas.width = W * dpr; canvas.height = Math.round(h * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, -off * dpr);
    };
    let raf, last = performance.now(), sinceStats = 0;
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
          const okA = A.downFor < 2, okB = B.downFor < 2; // the router's health check notices after 2 s
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
      if (sinceStats > 0.2) {
        sinceStats = 0;
        const sims = twoNow ? [A, B] : [A];
        const sum = (k) => sims.reduce((t, x) => t + x[k], 0);
        setStats({
          served: sum("served"), lost: sum("lost"), bill: sum("bill"), waiting: sims.reduce((t, x) => t + x.queue.length, 0),
          servers: A.target, rate: A.rateNow, saved: A.fixed - A.bill,
          training: A.baristas.some((b) => b.st === "training"),
          down: A.down ? "A" : twoNow && B.down ? "B" : "",
          lag: (A.down && A.downFor < 2) || (twoNow && B.down && B.downFor < 2),
          route: twoNow ? `Router sends ${Math.round((100 * rA) / rate)}% to Café A and ${Math.round((100 * rB) / rate)}% to Café B` : "",
        });
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

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

  return (
    <>
      <CloudvilleWelcome
        onSelectLesson={(index) => {
          switchLesson(index + 1);

          document.getElementById("learning-lab")?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }}
      />

      <main id="learning-lab" className="wrap learning-lab">
      <header>
        <h1>Cloudville</h1>
        <p className="sub">The café is your website. Baristas are servers. Visitors are customers waiting for a page.</p>
        <div className="tabs" role="tablist">
          {tabs.map((t, i) => (
            <button key={t} role="tab" aria-selected={lesson === i + 1} className={lesson === i + 1 ? "active" : ""}
              onClick={() => switchLesson(i + 1)}>Lesson {i + 1}: {t}</button>
          ))}
        </div>
      </header>

      <canvas ref={canvasRef} className={lesson === 5 ? "cafe short" : "cafe"} role="img"
        aria-label="Side view of a café: a line of customers waits at the counter while baristas run between the counter and the coffee machines" />
      <canvas ref={canvasBRef} className="cafe short second" style={{ display: lesson === 5 && two ? "block" : "none" }}
        role="img" aria-label="Side view of a second café in another location" />

      <p className="message">{message}</p>

      <div className="panel">
        <label className="slider">
          {autoTraffic ? "Traffic now (rush hour wave)" : "Traffic"}: <b>{shownRate.toFixed(2)}</b> visitors per second
          <input type="range" min="0.25" max="2.5" step="0.25" value={shownRate} disabled={autoTraffic}
            onChange={(e) => setRate(Number(e.target.value))} />
        </label>
        <div className="row">
          {lesson === 2 && (
            <>
              <button onClick={() => setHired((n) => Math.min(4, n + 1))} disabled={hired >= 4}>Hire a barista</button>
              <button onClick={() => setHired((n) => Math.max(1, n - 1))} disabled={hired <= 1}>Send one home</button>
              <button className={lb ? "on" : ""} aria-pressed={lb} onClick={() => setLb((v) => !v)}>Greeter: {lb ? "on" : "off"}</button>
            </>
          )}
          {lesson === 3 && (
            <button className={wave ? "on" : ""} aria-pressed={wave} onClick={() => setWave((v) => !v)}>Rush hour wave: {wave ? "on" : "off"}</button>
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
              <button className={two ? "on" : ""} aria-pressed={two} onClick={() => { setTwo((v) => !v); resetAll(); }}>
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
        <div className="stats">
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
      </main>
    </>
  );
}