const canvas = document.getElementById("space");
const ctx = canvas.getContext("2d", { alpha: false });

/* =====================================================
   CONFIGURACIÓN
===================================================== */
let width, height, centerX, centerY, dpr;

/* Corazón */
const HEART_PARTICLES = 3000;
/* Estrellas */
const STAR_COUNT = 2200;
/* Galaxia */
const GALAXY_PARTICLES = 2500;
/* Cometas */
const COMET_COUNT = 7;
/* Estrellas fugaces */
const SHOOTING_COUNT = 10;

/* =====================================================
   TIEMPO
===================================================== */
let lastTime = performance.now();
let time = 0;

/* =====================================================
   CÁMARA 360° - AJUSTES DE VELOCIDAD
===================================================== */
let cameraY = 0, cameraX = 0;
let targetCameraY = 0, targetCameraX = 0;
let zoom = 1, targetZoom = 1;

/* ROTACIÓN AUTOMÁTICA - MÁS RÁPIDA */
let automaticRotation = 0;

/* =====================================================
   RESIZE
===================================================== */
function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    centerX = width / 2;
    centerY = height / 2;
}
window.addEventListener("resize", resize);
resize();

/* =====================================================
   CORAZÓN MATEMÁTICO
===================================================== */
function heart(t) {
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    return { x: x * 13, y: -y * 13 };
}

/* =====================================================
   PARTÍCULAS DEL CORAZÓN
===================================================== */
const heartParticles = [];
for (let i = 0; i < HEART_PARTICLES; i++) {
    const t = Math.random() * Math.PI * 2;
    const p = heart(t);
    const thickness = Math.pow(Math.random(), 5);
    const angle = Math.random() * Math.PI * 2;
    const spread = thickness * 5;
    heartParticles.push({
        x: p.x + Math.cos(angle) * spread,
        y: p.y + Math.sin(angle) * spread,
        z: (Math.random() - .5) * 14,
        t,
        size: .35 + Math.random() * 1.1,
        alpha: .45 + Math.random() * .55,
        phase: Math.random() * Math.PI * 2
    });
}
heartParticles.sort((a, b) => a.t - b.t);

/* =====================================================
   ESTRELLAS DEL FONDO
===================================================== */
const stars = [];
for (let i = 0; i < STAR_COUNT; i++) {
    stars.push({
        x: (Math.random() - .5) * 1800,
        y: (Math.random() - .5) * 1200,
        z: Math.random() * 1400 + 100,
        size: .25 + Math.random() * 1.5,
        alpha: .25 + Math.random() * .75,
        phase: Math.random() * Math.PI * 2
    });
}

/* =====================================================
   GALAXIA ESPIRAL BLANCA
===================================================== */
const galaxy = [];
for (let i = 0; i < GALAXY_PARTICLES; i++) {
    const radius = Math.pow(Math.random(), .55) * 330;
    const arm = Math.floor(Math.random() * 5);
    const baseAngle = arm * (Math.PI * 2 / 5);
    const spiralAngle = baseAngle + radius * .014 + (Math.random() - .5) * .7;
    const x = Math.cos(spiralAngle) * radius;
    const z = Math.sin(spiralAngle) * radius;
    const y = (Math.random() - .5) * (7 + radius * .055);
    galaxy.push({ x, y, z, radius, size: .3 + Math.random() * 1.8, alpha: .15 + Math.random() * .8, phase: Math.random() * Math.PI * 2 });
}

/* =====================================================
   COMETAS
===================================================== */
const comets = [];
function createComet(initial = false) {
    const side = Math.floor(Math.random() * 4);
    let x, y;
    if (side === 0) { x = -200; y = Math.random() * height; }
    else if (side === 1) { x = width + 200; y = Math.random() * height; }
    else if (side === 2) { x = Math.random() * width; y = -200; }
    else { x = Math.random() * width; y = height + 200; }
    const targetX = centerX + (Math.random() - .5) * width;
    const targetY = centerY + (Math.random() - .5) * height;
    const dx = targetX - x, dy = targetY - y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const speed = 3.5 + Math.random() * 3;
    comets.push({
        x, y, vx: dx / distance * speed, vy: dy / distance * speed,
        life: initial ? Math.random() * 180 : 0, maxLife: 180 + Math.random() * 150,
        length: 45 + Math.random() * 80, size: 1 + Math.random() * 1.5
    });
}
for (let i = 0; i < COMET_COUNT; i++) createComet(true);

/* =====================================================
   ESTRELLAS FUGACES
===================================================== */
const shootingStars = [];
function createShootingStar(initial = false) {
    const side = Math.floor(Math.random() * 4);
    let x, y;
    if (side === 0) { x = -150; y = Math.random() * height; }
    else if (side === 1) { x = width + 150; y = Math.random() * height; }
    else if (side === 2) { x = Math.random() * width; y = -150; }
    else { x = Math.random() * width; y = height + 150; }
    const targetX = centerX + (Math.random() - .5) * width;
    const targetY = centerY + (Math.random() - .5) * height;
    const dx = targetX - x, dy = targetY - y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const speed = 8 + Math.random() * 7;
    shootingStars.push({
        x, y, vx: dx / distance * speed, vy: dy / distance * speed,
        life: initial ? Math.random() * 100 : 0, maxLife: 80 + Math.random() * 80,
        length: 80 + Math.random() * 110, size: .8 + Math.random() * 1.5
    });
}
for (let i = 0; i < SHOOTING_COUNT; i++) createShootingStar(true);

/* =====================================================
   PROYECCIÓN 3D
===================================================== */
function project(x, y, z) {
    const angle = automaticRotation + cameraY;
    const cos = Math.cos(angle), sin = Math.sin(angle);
    const rx = x * cos - z * sin;
    const rz = x * sin + z * cos;
    const vertical = cameraX;
    const cosV = Math.cos(vertical), sinV = Math.sin(vertical);
    const ry = y * cosV - rz * sinV;
    const finalZ = y * sinV + rz * cosV;
    const perspective = 700;
    const scale = perspective / (perspective + finalZ);
    return { x: centerX + rx * scale * zoom, y: centerY + ry * scale * zoom, scale };
}

/* =====================================================
   FONDO
===================================================== */
function drawBackground() {
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(width, height));
    gradient.addColorStop(0, "#100018");
    gradient.addColorStop(.35, "#05000c");
    gradient.addColorStop(1, "#000000");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
}

/* =====================================================
   ESTRELLAS
===================================================== */
function drawStars() {
    for (const star of stars) {
        const p = project(star.x, star.y, star.z);
        const twinkle = .55 + Math.sin(time * 1.5 + star.phase) * .45;
        ctx.beginPath();
        ctx.fillStyle = `rgba(255,255,255,${star.alpha * twinkle})`;
        ctx.arc(p.x, p.y, star.size * p.scale, 0, Math.PI * 2);
        ctx.fill();
    }
}

/* =====================================================
   GALAXIA
===================================================== */
function drawGalaxy() {
    const galaxyCenterY = centerY + Math.min(height * .28, 240);
    const galaxyRotation = time * .12;
    for (const g of galaxy) {
        const angle = Math.atan2(g.z, g.x) + galaxyRotation;
        const radius = g.radius;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const p = project(x, g.y, z);
        const finalY = galaxyCenterY + (p.y - centerY) * .38;
        const core = Math.max(0, 1 - radius / 330);
        ctx.beginPath();
        ctx.fillStyle = `rgba(255,255,255,${g.alpha})`;
        ctx.shadowBlur = 4 + core * 12;
        ctx.shadowColor = "#ffffff";
        ctx.arc(p.x, finalY, g.size * p.scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
    const coreGlow = ctx.createRadialGradient(centerX, galaxyCenterY, 0, centerX, galaxyCenterY, 150);
    coreGlow.addColorStop(0, "rgba(255,255,255,1)");
    coreGlow.addColorStop(.08, "rgba(255,255,255,.9)");
    coreGlow.addColorStop(.25, "rgba(255,255,255,.35)");
    coreGlow.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = coreGlow;
    ctx.beginPath();
    ctx.arc(centerX, galaxyCenterY, 150, 0, Math.PI * 2);
    ctx.fill();
}

/* =====================================================
   CORAZÓN
===================================================== */
let drawProgress = 0;
function drawHeart() {
    for (const p of heartParticles) {
        if (p.t > drawProgress) continue;
        const floating = Math.sin(time * 1.2 + p.phase) * .35;
        const x = p.x + floating;
        const y = p.y + Math.cos(time + p.phase) * .3;
        const z = p.z + Math.sin(time * .8 + p.phase) * 2;
        const projected = project(x, y, z);
        const size = p.size * projected.scale;
        ctx.beginPath();
        ctx.fillStyle = `rgba(255,${80 + Math.random() * 80},255,${p.alpha})`;
        ctx.shadowBlur = 8 * projected.scale;
        ctx.shadowColor = "#e100ff";
        ctx.arc(projected.x, projected.y, Math.max(size, .3), 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

/* =====================================================
   PUNTO QUE DIBUJA EL CORAZÓN
===================================================== */
function drawHeartTip() {
    const p = heart(drawProgress);
    const projected = project(p.x, p.y, 0);
    const glow = ctx.createRadialGradient(projected.x, projected.y, 0, projected.x, projected.y, 55);
    glow.addColorStop(0, "rgba(255,255,255,1)");
    glow.addColorStop(.15, "rgba(255,150,255,.9)");
    glow.addColorStop(.4, "rgba(220,0,255,.4)");
    glow.addColorStop(1, "rgba(200,0,255,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(projected.x, projected.y, 55, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.fillStyle = "#ffffff";
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#ff00ff";
    ctx.arc(projected.x, projected.y, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
}

/* =====================================================
   COMETAS
===================================================== */
function drawComets(dt) {
    for (let i = comets.length - 1; i >= 0; i--) {
        const c = comets[i];
        c.x += c.vx * dt * 60;
        c.y += c.vy * dt * 60;
        c.life += dt * 60;
        const speed = Math.sqrt(c.vx * c.vx + c.vy * c.vy);
        const tailX = c.x - c.vx / speed * c.length;
        const tailY = c.y - c.vy / speed * c.length;
        const alpha = Math.sin(Math.min(1, c.life / 30) * Math.PI);
        const gradient = ctx.createLinearGradient(tailX, tailY, c.x, c.y);
        gradient.addColorStop(0, "rgba(255,255,255,0)");
        gradient.addColorStop(.5, `rgba(210,180,255,${alpha * .35})`);
        gradient.addColorStop(1, `rgba(255,255,255,${alpha})`);
        ctx.beginPath();
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.5;
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(c.x, c.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.shadowBlur = 25;
        ctx.shadowColor = "#ffffff";
        ctx.arc(c.x, c.y, c.size * 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        if (c.life > c.maxLife) { comets.splice(i, 1); createComet(); }
    }
}

/* =====================================================
   ESTRELLAS FUGACES
===================================================== */
function drawShootingStars(dt) {
    for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i];
        s.x += s.vx * dt * 60;
        s.y += s.vy * dt * 60;
        s.life += dt * 60;
        const speed = Math.sqrt(s.vx * s.vx + s.vy * s.vy);
        const tailX = s.x - s.vx / speed * s.length;
        const tailY = s.y - s.vy / speed * s.length;
        const progress = s.life / s.maxLife;
        const alpha = Math.sin(progress * Math.PI);
        const gradient = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
        gradient.addColorStop(0, "rgba(255,255,255,0)");
        gradient.addColorStop(.6, `rgba(190,100,255,${alpha * .45})`);
        gradient.addColorStop(1, `rgba(255,255,255,${alpha})`);
        ctx.beginPath();
        ctx.strokeStyle = gradient;
        ctx.lineWidth = s.size;
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(s.x, s.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.shadowBlur = 20;
        ctx.shadowColor = "#ffffff";
        ctx.arc(s.x, s.y, s.size * 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        if (s.life > s.maxLife) { shootingStars.splice(i, 1); createShootingStar(); }
    }
}

/* =====================================================
   CONTROL 360° - MÁS SENSIBLE Y RÁPIDO
===================================================== */
let dragging = false, lastX = 0, lastY = 0;
canvas.addEventListener("pointerdown", event => {
    dragging = true;
    lastX = event.clientX;
    lastY = event.clientY;
    canvas.setPointerCapture(event.pointerId);
});
canvas.addEventListener("pointermove", event => {
    if (!dragging) return;
    const dx = event.clientX - lastX;
    const dy = event.clientY - lastY;
    // ⚡ AUMENTÉ LA SENSIBILIDAD: antes era 0.006 / 0.004 → ahora 0.018 / 0.012
    targetCameraY += dx * 0.018;
    targetCameraX += dy * 0.012;
    targetCameraX = Math.max(-1.2, Math.min(1.2, targetCameraX)); // Menos límites
    lastX = event.clientX;
    lastY = event.clientY;
});
canvas.addEventListener("pointerup", () => { dragging = false; try { canvas.releasePointerCapture(event.pointerId); } catch {} });
canvas.addEventListener("pointercancel", () => { dragging = false; });

/* =====================================================
   ZOOM
===================================================== */
let previousDistance = null;
canvas.addEventListener("touchmove", event => {
    if (event.touches.length !== 2) return;
    event.preventDefault();
    const a = event.touches[0], b = event.touches[1];
    const dx = a.clientX - b.clientX, dy = a.clientY - b.clientY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (previousDistance !== null) targetZoom += (distance - previousDistance) * .003;
    targetZoom = Math.max(.65, Math.min(1.6, targetZoom));
    previousDistance = distance;
}, { passive: false });
canvas.addEventListener("touchend", () => { previousDistance = null; });

/* =====================================================
   MÚSICA Y BOTONES
===================================================== */
const music = document.getElementById("music");
const musicButton = document.getElementById("musicButton");
const fullscreenButton = document.getElementById("fullscreenButton");
let playing = false;

musicButton?.addEventListener("click", async () => {
    try {
        if (!playing) { await music.play(); music.volume = .55; playing = true; musicButton.textContent = "🔊"; }
        else { music.pause(); playing = false; musicButton.textContent = "🎵"; }
    } catch { console.log("Toca primero la pantalla para activar el sonido"); }
});

fullscreenButton?.addEventListener("click", async () => {
    try { document.fullscreenElement ? await document.exitFullscreen() : await document.documentElement.requestFullscreen(); }
    catch {}
});

/* =====================================================
   ANIMACIÓN PRINCIPAL - SUAVIZADO MÁS RÁPIDO
===================================================== */
function animate(now) {
    requestAnimationFrame(animate);
    let dt = (now - lastTime) / 1000;
    dt = Math.min(dt, .033);
    lastTime = now;
    time += dt;

    // ⚡ ROTACIÓN AUTOMÁTICA MÁS RÁPIDA: antes 0.10 → ahora 0.22
    automaticRotation += dt * 0.22;

    // ⚡ SUAVIZADO MUCHO MÁS RÁPIDO: antes 0.08 → ahora 0.25 (responde al instante)
    cameraY += (targetCameraY - cameraY) * 0.25;
    cameraX += (targetCameraX - cameraX) * 0.25;
    zoom += (targetZoom - zoom) * 0.15;

    drawProgress += dt * .85;
    if (drawProgress > Math.PI * 2) drawProgress = Math.PI * 2;

    drawBackground();
    drawStars();
    drawGalaxy();
    drawHeart();
    if (drawProgress < Math.PI * 2) drawHeartTip();
    drawComets(dt);
    drawShootingStars(dt);
}

requestAnimationFrame(animate);
