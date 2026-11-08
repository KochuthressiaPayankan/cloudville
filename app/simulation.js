export const W = 800, H = 400;
const GROUND = 332, INK = "#1b2a49";
const MAX_LINE = 8, SLOT0 = 555, SLOT_GAP = 48;
const HOME_X = 640, MACHINE_X = (i) => 735 + i * 14, LANE_Y = (i) => GROUND - i * 9;
const BARISTA_SPEED = 220, CUSTOMER_SPEED = 140, BREW = 0.8, PATIENCE = 14;
export const PRICE = 0.1;
const SKIN = ["#f1c27d", "#e0ac69", "#c68642", "#8d5524", "#ffdbac"];
const SHIRT = ["#6c8ef5", "#7bc67b", "#b784e0", "#f5a35c", "#5cc8d6"];
const SHOUTS = ["Hurry up!", "Too slow!", "Hello?!", "!!"];
const BCOL = ["#ff6b5b", "#4c8bf5", "#3fb66b", "#a56be0"];
export const LB_PRICE = 0.05;

const pick = (a) => a[Math.floor(Math.random() * a.length)];
export const fresh = () => ({
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
  return {
    x: -30, y: GROUND, face: 1, ph: Math.random() * 6, patience: PATIENCE,
    skin: pick(SKIN), shirt: pick(SHIRT),
    claimed: false, arrived: false, assigned: 0, cup: false, mood: "ok", said: "", bubbleT: 0
  };
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

export function update(sim, dt, rate, servers, lb, lesson, wave) {
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
    if (wave) rate = 0.25 + ((1 - Math.cos((sim.t * 2 * Math.PI) / 40)) / 2) * 1.5;
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
  sim.fixed += (4 * PRICE + LB_PRICE) * dt;
  [...sim.queue, ...sim.leaving, ...sim.baristas, ...sim.exiting].forEach((p) => { p.moving = false; });

  while (sim.baristas.length < servers) {
    const i = sim.baristas.length;
    sim.baristas.push({
      x: i === 0 ? HOME_X : W + 30, y: LANE_Y(i), face: -1, ph: 0,
      st: i === 0 ? "idle" : "arriving", c: null, t: 0,
      skin: pick(SKIN), cup: false, shirt: BCOL[i], label: "#" + (i + 1)
    });
    if (sim.pendingTrain) { sim.baristas[i].train = true; sim.pendingTrain = false; }
  }
  while (sim.baristas.length > servers) {
    const b = sim.baristas.pop();
    if (b.c) b.c.claimed = false;
    b.c = null; b.cup = false; b.st = "exiting"; sim.exiting.push(b);
  }
  sim.exiting = sim.exiting.filter((b) => {
    b.bubbleT -= dt; moveTo(b, W + 60, b.y, dt, BARISTA_SPEED); return b.x < W + 40;
  });

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
      if (c.patience < 5 && c.bubbleT <= 0 && Math.random() < dt * 0.5) {
        c.said = pick(SHOUTS); c.bubbleT = 1.4;
      }
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

export function draw(ctx, sim, lesson) {
  ctx._dots = lesson >= 2;
  ctx.fillStyle = "#dff0ff"; ctx.fillRect(0, 0, W, H);
  cloud(ctx, 60, 50, 1); cloud(ctx, 330, 30, 0.8); cloud(ctx, 470, 70, 0.7);
  ctx.fillStyle = "#9aa5b5"; ctx.fillRect(0, GROUND, W, H - GROUND);
  ctx.fillStyle = INK; ctx.fillRect(0, GROUND, W, 3);
  ctx.fillStyle = "#ffe9b0"; ctx.fillRect(590, 150, 210, GROUND - 150);
  ctx.fillStyle = "#c98c5a"; ctx.fillRect(590, 300, 210, GROUND - 300);
  ctx.fillStyle = "#ff6b5b"; ctx.fillRect(580, 118, 220, 36);
  ctx.fillStyle = "#fff"; for (let x = 590; x < 800; x += 40) ctx.fillRect(x, 118, 20, 36);
  ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.strokeRect(580, 118, 220, 36);
  ctx.fillStyle = "#8a6a4a"; ctx.fillRect(700, 296, 100, 6);
  if (lesson === 4) {
    const room = sim.store === "room";
    ctx.fillStyle = room ? "#d7f3e0" : "#e5e5e5";
    ctx.strokeStyle = room ? "#3fb66b" : "#999"; ctx.lineWidth = 3;
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
  ctx.fillStyle = "#b5651d"; ctx.strokeStyle = INK; ctx.lineWidth = 3;
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

