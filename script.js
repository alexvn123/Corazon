const canvas = document.getElementById("space");
const ctx = canvas.getContext("2d", { alpha: false });

/* =====================================================
   CONFIGURACIÓN GENERAL
===================================================== */
let width, height, centerX, centerY, dpr;

const HEART_PARTICLES = 3200;
const STAR_COUNT = 2800;
const GALAXY_PARTICLES = 3000;
const COMET_COUNT = 6;
const SHOOTING_COUNT = 8;

let lastTime = performance.now();
let time = 0;

/* CÁMARA */
let cameraY = 0, cameraX = 0;
let targetCameraY = 0, targetCameraX = 0;
let zoom = 1, targetZoom = 1;
let automaticRotation = 0;

/* =====================================================
   AJUSTE DE TAMAÑO
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
   FÓRMULA DEL CORAZÓN
===================================================== */
function heart(t) {
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t);
    return { x: x * 14, y: -y * 14 };
}

/* =====================================================
   PARTÍCULAS DEL CORAZÓN (ESTILO BRILLANTE)
===================================================== */
const heartParticles = [];
for (let i = 0; i < HEART_PARTICLES; i++) {
    const t = Math.random() * Math.PI * 2;
    const p = heart(t);
    const thickness = Math.pow(Math.random(), 5);
    const angle = Math.random() * Math.PI * 2;
    const spread = thickness * 4;
    heartParticles.push({
        x: p.x + Math.cos(angle) * spread,
        y: p.y + Math.sin(angle) * spread,
        z: (Math.random() - .5) * 12,
        t,
        size: .3 + Math.random() * 1.2,
        alpha: .5 + Math.random() * .5,
        phase: Math.random() * Math.PI * 2
    });
}
heartParticles.sort((a, b) => a.t - b.t);

/* =====================================================
   ESTRELLAS DE FONDO
===================================================== */
const stars = [];
for (let i = 0; i < STAR_COUNT; i++) {
    stars.push({
        x: (Math.random() - .5) * 2000,
        y: (Math.random() - .5) * 1500,
        z: Math.random() * 1600 + 100,
        size: .2 + Math.random() * 1.8,
        alpha: .3 + Math.random() * .7,
        phase: Math.random() * Math.PI * 2
    });
}

/* =====================================================
   GALAXIA ESPIRAL BLANCA
===================================================== */
const galaxy = [];
for (let i = 0; i < GALAXY_PARTICLES; i++) {
    const radius = Math.pow(Math.random(), .5) * 380;
    const arm = Math.floor(Math.random() * 5);
    const baseAngle = arm * (Math.PI * 2 / 5);
    const spiralAngle = baseAngle + radius * .012 + (Math.random() - .5) * .6;
    const x = Math.cos(spiralAngle) * radius;
    const z = Math.sin(spiralAngle) * radius;
    const y = (Math.random() - .5) * (8 + radius * .06);
    galaxy.push({ x, y, z, radius, size: .4 + Math.random() * 2, alpha: .2 + Math.random() * .8 });
}

/* =====================================================
   COMETAS MORADO/AZUL
===================================================== */
const comets = [];
function createComet(initial = false) {
    const side = Math.floor(Math.random() * 4);
    let x, y;
    if (side === 0) { x = -250; y = Math.random() * height; }
    else if (side === 1) { x = width + 250; y = Math.random() * height; }
    else if (side === 2) { x = Math.random() * width; y = -250; }
    else { x = Math.random() * width; y = height + 250; }
    
    const targetX = centerX + (Math.random() - .5) * width;
    const targetY = centerY + (Math.random() - .5) * height;
    const dx = targetX - x, dy = targetY - y;
    const distance = Math.sqrt(dx*dx + dy*dy);
    const speed = 4 + Math.random() * 3;
    
    comets.push({
        x, y, vx: dx/distance * speed, vy: dy/distance * speed,
        life: initial ? Math.random() * 150 : 0, maxLife: 200 + Math.random() * 150,
        length: 50 + Math.random() * 90, size: 1.2 + Math.random() * 1.8
    });
}
for (let i = 0; i < COMET_COUNT; i++) createComet(true);

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
    const perspective = 750;
    const scale = perspective / (perspective + finalZ);
    return { x: centerX + rx*scale*zoom, y: centerY + ry*scale*zoom, scale };
}

/* =====================================================
   FONDO ESPACIO PROFUNDO
===================================================== */
function drawBackground() {
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(width,height));
    gradient.addColorStop(0, "#0a0012");
    gradient.addColorStop(.4, "#030008");
    gradient.addColorStop(1, "#000000");
    ctx.fillStyle = gradient;
    ctx.fillRect(0,0,width,height);
}

/* =====================================================
   DIBUJAR ESTRELLAS
===================================================== */
function drawStars() {
    for (const s of stars) {
        const p = project(s.x, s.y, s.z);
        const twinkle = .5 + Math.sin(time*1.8 + s.phase) * .5;
        ctx.beginPath();
        ctx.fillStyle = `rgba(255,255,255,${s.alpha * twinkle})`;
        ctx.arc(p.x, p.y, s.size * p.scale, 0, Math.PI*2);
        ctx.fill();
    }
}

/* =====================================================
   DIBUJAR GALAXIA
===================================================== */
function drawGalaxy() {
    const galaxyY = centerY + Math.min(height * .3, 260);
    const rot = time * .08;
    for (const g of galaxy) {
        const ang = Math.atan2(g.z, g.x) + rot;
        const r = g.radius;
        const p = project(Math.cos(ang)*r, g.y, Math.sin(ang)*r);
        const py = galaxyY + (p.y - centerY) * .4;
        const core = Math.max(0, 1 - r/380);
        ctx.beginPath();
        ctx.fillStyle = `rgba(255,255,255,${g.alpha})`;
        ctx.shadowBlur = 5 + core * 15;
        ctx.shadowColor = "#ffffff";
        ctx.arc(p.x, py, g.size * p.scale, 0, Math.PI*2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
    // Brillo del centro
    const glow = ctx.createRadialGradient(centerX, galaxyY, 0, centerX, galaxyY, 180);
    glow.addColorStop(0,"rgba(255,255,255,1)");
    glow.addColorStop(.1,"rgba(255,255,255,.85)");
    glow.addColorStop(.3,"rgba(255,255,255,.3)");
    glow.addColorStop(1,"rgba(255,255,255,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(centerX, galaxyY, 180, 0, Math.PI*2);
    ctx.fill();
}

/* =====================================================
   CORAZÓN EN BUCLE INFINITO
===================================================== */
let drawProgress = 0;
function drawHeart() {
    for (const p of heartParticles) {
        if (p.t > drawProgress) continue;
        const floatY = Math.sin(time*1.3 + p.phase) * .4;
        const floatX = Math.cos(time + p.phase) * .25;
        const proj = project(p.x + floatX, p.y + floatY, p.z + Math.sin(time*.9 + p.phase)*2);
        
        ctx.beginPath();
        // COLOR MAGENTA / ROSA NEÓN IGUAL A LA IMAGEN
        ctx.fillStyle = `rgba(255, 80, 220, ${p.alpha})`;
        ctx.shadowBlur = 12 * proj.scale;
        ctx.shadowColor = "#ff00ff";
        ctx.arc(proj.x, proj.y, Math.max(p.size * proj.scale, .4), 0, Math.PI*2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    // PUNTO BRILLANTE QUE DIBUJA EL TRAZO
    const tip = heart(drawProgress);
    const tipProj = project(tip.x, tip.y, 0);
    const tipGlow = ctx.createRadialGradient(tipProj.x, tipProj.y, 0, tipProj.x, tipProj.y, 60);
    tipGlow.addColorStop(0,"rgba(255,255,255,1)");
    tipGlow.addColorStop(.15,"rgba(255,130,255,.9)");
    tipGlow.addColorStop(.4,"rgba(220,0,255,.5)");
    tipGlow.addColorStop(1,"rgba(180,0,255,0)");
    ctx.fillStyle = tipGlow;
    ctx.beginPath();
    ctx.arc(tipProj.x, tipProj.y, 60, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.shadowBlur = 25;
    ctx.shadowColor = "#ff00ff";
    ctx.beginPath();
    ctx.arc(tipProj.x, tipProj.y, 4, 0, Math.PI*2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // ✨ BUCLE INFINITO: al terminar, vuelve a empezar
    drawProgress += dt * .75;
    if (drawProgress > Math.PI * 2) drawProgress = 0;
}

/* =====================================================
   DIBUJAR COMETAS
===================================================== */
function drawComets(dt) {
    for (let i = comets.length-1; i >=0; i--) {
        const c = comets[i];
        c.x += c.vx * dt * 60;
        c.y += c.vy * dt * 60;
        c.life += dt * 60;
        const spd = Math.hypot(c.vx,c.vy);
        const tx = c.x - c.vx/spd * c.length;
        const ty = c.y - c.vy/spd * c.length;
        const alfa = Math.sin(Math.min(1, c.life/35) * Math.PI);
        
        const grad = ctx.createLinearGradient(tx,ty,c.x,c.y);
        grad.addColorStop(0,"rgba(150,50,255,0)");
        grad.addColorStop(.5,`rgba(200,100,255,${alfa*.4})`);
        grad.addColorStop(1,`rgba(255,255,255,${alfa})`);
        ctx.beginPath();
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.8;
        ctx.moveTo(tx,ty);
        ctx.lineTo(c.x,c.y);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.fillStyle = `rgba(255,255,255,${alfa})`;
        ctx.shadowBlur = 30;
        ctx.shadowColor = "#cc66ff";
        ctx.arc(c.x,c.y,c.size*2.2,0,Math.PI*2);
        ctx.fill();
        ctx.shadowBlur = 0;

        if (c.life > c.maxLife) { comets.splice(i,1); createComet(); }
    }
}

/* =====================================================
   CONTROL 360° RÁPIDO Y SIN TRAbas
===================================================== */
let dragging = false, lastX=0, lastY=0;
canvas.addEventListener("pointerdown", e=>{ dragging=true; lastX=e.clientX; lastY=e.clientY; canvas.setPointerCapture(e.pointerId); });
canvas.addEventListener("pointermove", e=>{
    if(!dragging) return;
    targetCameraY += (e.clientX - lastX) * 0.02; // Más sensible
    targetCameraX += (e.clientY - lastY) * 0.015;
    targetCameraX = Math.max(-1.3, Math.min(1.3, targetCameraX));
    lastX=e.clientX; lastY=e.clientY;
});
canvas.addEventListener("pointerup", ()=>{ dragging=false; try{canvas.releasePointerCapture(e.pointerId);}catch{} });

/* =====================================================
   ANIMACIÓN PRINCIPAL
===================================================== */
let dt = 0;
function animate(now) {
    requestAnimationFrame(animate);
    dt = Math.min((now-lastTime)/1000, .033);
    lastTime = now;
    time += dt;

    automaticRotation += dt * 0.2; // Giro automático suave
    // Respuesta inmediata sin retardo
    cameraY += (targetCameraY - cameraY) * 0.3;
    cameraX += (targetCameraX - cameraX) * 0.3;
    zoom += (targetZoom - zoom) * 0.15;

    drawBackground();
    drawStars();
    drawGalaxy();
    drawHeart(); // ✨ BUCLE ACTIVADO
    drawComets(dt);
}

requestAnimationFrame(animate);
