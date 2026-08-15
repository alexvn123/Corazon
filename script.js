const canvas =
    document.getElementById("space");

const ctx =
    canvas.getContext("2d");


// ======================================================
// CONFIGURACIÓN
// ======================================================

let width;
let height;

let centerX;
let centerY;

let dpr;


// Corazón fino
const HEART_SCALE = 14;


// Cantidad de partículas
const PARTICLE_COUNT = 2300;


// Estrellas
const STAR_COUNT = 600;


// Estrellas fugaces
const SHOOTING_STARS = 12;


// ======================================================
// RESIZE
// ======================================================

function resize() {

    dpr =
        Math.min(
            window.devicePixelRatio || 1,
            2
        );

    width =
        window.innerWidth;

    height =
        window.innerHeight;

    canvas.width =
        width * dpr;

    canvas.height =
        height * dpr;

    canvas.style.width =
        width + "px";

    canvas.style.height =
        height + "px";

    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );

    centerX =
        width / 2;

    centerY =
        height / 2;
}

window.addEventListener(
    "resize",
    resize
);

resize();


// ======================================================
// CÁMARA 360°
// ======================================================

let rotationX = 0;

let rotationY = 0;

let zoom = 1;


// Rotación automática
let autoRotation = 0;


// ======================================================
// CORAZÓN MATEMÁTICO
// ======================================================

function heartPoint(t) {

    const x =
        16 *
        Math.pow(
            Math.sin(t),
            3
        );

    const y =
        13 *
        Math.cos(t)

        - 5 *
        Math.cos(2 * t)

        - 2 *
        Math.cos(3 * t)

        - Math.cos(4 * t);


    return {

        x: x * HEART_SCALE,

        y: -y * HEART_SCALE
    };
}


// ======================================================
// PARTÍCULAS DEL CORAZÓN
// ======================================================

const particles = [];


// IMPORTANTE:
// Esta variable controla cuánto se ha dibujado.

let drawProgress = 0;


// Crear partículas

for (
    let i = 0;
    i < PARTICLE_COUNT;
    i++
) {

    const t =
        Math.random() *
        Math.PI * 2;


    const point =
        heartPoint(t);


    /*
        Hacemos el corazón fino:

        La mayoría de partículas quedan
        muy cerca de la línea exterior.
    */

    const thickness =
        Math.pow(
            Math.random(),
            4
        );


    const angle =
        Math.random() *
        Math.PI * 2;


    const spread =
        thickness * 5;


    const x =
        point.x +
        Math.cos(angle) *
        spread;


    const y =
        point.y +
        Math.sin(angle) *
        spread;


    const z =
        (Math.random() - .5) *
        20;


    particles.push({

        x,
        y,
        z,

        t,

        size:
            Math.random() *
            1.3 + .35,

        alpha:
            Math.random() *
            .8 + .2,

        phase:
            Math.random() *
            Math.PI * 2,

        speed:
            Math.random() *
            .8 + .2
    });
}


// Ordenar por posición del corazón

particles.sort(
    (a, b) =>
        a.t - b.t
);


// ======================================================
// ESTRELLAS
// ======================================================

const stars = [];


for (
    let i = 0;
    i < STAR_COUNT;
    i++
) {

    stars.push({

        x:
            (Math.random() - .5) *
            1500,

        y:
            (Math.random() - .5) *
            900,

        z:
            Math.random() *
            1000,

        size:
            Math.random() *
            1.5 + .2,

        brightness:
            Math.random() *
            .8 + .2,

        phase:
            Math.random() *
            Math.PI * 2
    });
}


// ======================================================
// GALAXIA
// ======================================================

const galaxyParticles = [];

const GALAXY_PARTICLES = 1500;


for (
    let i = 0;
    i < GALAXY_PARTICLES;
    i++
) {

    const angle =
        Math.random() *
        Math.PI * 2;


    const radius =
        Math.pow(
            Math.random(),
            .65
        ) *
        300;


    // Forma espiral

    const spiral =
        angle +
        radius *
        .018;


    const x =
        Math.cos(spiral) *
        radius;


    const z =
        Math.sin(spiral) *
        radius;


    const y =
        (Math.random() - .5) *
        (20 + radius * .06);


    galaxyParticles.push({

        x,
        y,
        z,

        radius,

        angle,

        size:
            Math.random() *
            1.8 + .3,

        alpha:
            Math.random() *
            .7 + .2
    });
}


// ======================================================
// ESTRELLAS FUGACES
// ======================================================

const shootingStars = [];


function createShootingStar() {

    const side =
        Math.floor(
            Math.random() * 4
        );


    let x;
    let y;


    if (side === 0) {

        x = -150;

        y =
            Math.random() *
            height;

    }

    else if (side === 1) {

        x =
            width + 150;

        y =
            Math.random() *
            height;

    }

    else if (side === 2) {

        x =
            Math.random() *
            width;

        y = -150;

    }

    else {

        x =
            Math.random() *
            width;

        y =
            height + 150;
    }


    const targetX =
        centerX +
        (Math.random() - .5) *
        width;


    const targetY =
        centerY +
        (Math.random() - .5) *
        height;


    const dx =
        targetX - x;


    const dy =
        targetY - y;


    const distance =
        Math.sqrt(
            dx * dx +
            dy * dy
        );


    /*
        MÁS RÁPIDAS
        que la versión anterior.
    */

    const speed =
        10 +
        Math.random() * 9;


    shootingStars.push({

        x,
        y,

        vx:
            dx / distance *
            speed,

        vy:
            dy / distance *
            speed,

        life: 0,

        maxLife:
            60 +
            Math.random() * 60,

        length:
            70 +
            Math.random() * 100,

        size:
            Math.random() * 1.5 + 1
    });
}


// Crear inicialmente

for (
    let i = 0;
    i < SHOOTING_STARS;
    i++
) {

    createShootingStar();
}


// ======================================================
// PROYECCIÓN 3D
// ======================================================

function project3D(
    x,
    y,
    z
) {

    // Giro automático

    const angle =
        autoRotation +
        rotationY;


    const cos =
        Math.cos(angle);

    const sin =
        Math.sin(angle);


    const rx =
        x * cos -
        z * sin;


    const rz =
        x * sin +
        z * cos;


    // Giro vertical

    const vertical =
        rotationX;


    const cosV =
        Math.cos(vertical);

    const sinV =
        Math.sin(vertical);


    const ry =
        y * cosV -
        rz * sinV;


    const finalZ =
        y * sinV +
        rz * cosV;


    // Perspectiva

    const camera =
        650;


    const scale =
        camera /
        (camera + finalZ);


    return {

        x:
            centerX +
            rx *
            scale *
            zoom,

        y:
            centerY +
            ry *
            scale *
            zoom,

        scale
    };
}


// ======================================================
// FONDO
// ======================================================

function background() {

    const gradient =
        ctx.createRadialGradient(
            centerX,
            centerY,
            0,
            centerX,
            centerY,
            Math.max(
                width,
                height
            )
        );


    gradient.addColorStop(
        0,
        "rgba(45,0,70,.35)"
    );


    gradient.addColorStop(
        .35,
        "rgba(13,0,30,.5)"
    );


    gradient.addColorStop(
        1,
        "rgba(0,0,0,.95)"
    );


    ctx.fillStyle =
        gradient;


    ctx.fillRect(
        0,
        0,
        width,
        height
    );
}


// ======================================================
// ESTRELLAS
// ======================================================

function drawStars() {

    for (
        const star of stars
    ) {

        const p =
            project3D(
                star.x,
                star.y,
                star.z
            );


        const twinkle =
            .5 +
            Math.sin(
                performance.now() *
                .002 +
                star.phase
            ) *
            .5;


        ctx.beginPath();


        ctx.fillStyle =
            `rgba(
                255,
                255,
                255,
                ${star.brightness * twinkle}
            )`;


        ctx.arc(

            p.x,

            p.y,

            star.size *
            p.scale,

            0,

            Math.PI * 2
        );


        ctx.fill();
    }
}


// ======================================================
// GALAXIA
// ======================================================

function drawGalaxy() {

    /*
        La galaxia está debajo
        del corazón.
    */

    const galaxyY =
        height * .72;


    for (
        const p of galaxyParticles
    ) {

        // Rotación propia

        const a =
            p.angle +
            time * .12;


        const x =
            Math.cos(a) *
            p.radius;


        const z =
            Math.sin(a) *
            p.radius;


        const projected =
            project3D(
                x,
                p.y,
                z
            );


        const finalY =
            galaxyY +
            (projected.y -
             centerY) *
            .35;


        ctx.beginPath();


        /*
            Núcleo más brillante.
        */

        const brightness =
            Math.max(
                0,
                1 -
                p.radius / 300
            );


        ctx.fillStyle =
            `rgba(
                220,
                ${70 + brightness * 100},
                255,
                ${p.alpha}
            )`;


        ctx.shadowBlur =
            8 *
            brightness;


        ctx.shadowColor =
            "#c000ff";


        ctx.arc(

            projected.x,

            finalY,

            p.size *
            projected.scale,

            0,

            Math.PI * 2
        );


        ctx.fill();


        ctx.shadowBlur = 0;
    }


    // Núcleo de la galaxia

    const glow =
        ctx.createRadialGradient(
            centerX,
            galaxyY,
            0,
            centerX,
            galaxyY,
            150
        );


    glow.addColorStop(
        0,
        "rgba(255,255,255,.95)"
    );


    glow.addColorStop(
        .08,
        "rgba(255,170,255,.8)"
    );


    glow.addColorStop(
        .3,
        "rgba(210,50,255,.35)"
    );


    glow.addColorStop(
        1,
        "rgba(100,0,255,0)"
    );


    ctx.fillStyle =
        glow;


    ctx.beginPath();


    ctx.arc(
        centerX,
        galaxyY,
        150,
        0,
        Math.PI * 2
    );


    ctx.fill();
}


// ======================================================
// CORAZÓN PROGRESIVO
// ======================================================

function drawHeart() {

    /*
        Solamente mostramos las partículas
        cuyo t ya ha sido recorrido.
    */

    const maxT =
        drawProgress;


    for (
        const p of particles
    ) {

        if (
            p.t > maxT
        ) {

            continue;
        }


        const wave =
            Math.sin(
                time *
                p.speed +
                p.phase
            );


        const x =
            p.x +
            wave *
            .45;


        const y =
            p.y +
            Math.cos(
                time *
                .7 +
                p.phase
            ) *
            .35;


        const z =
            p.z +
            Math.sin(
                time +
                p.phase
            ) *
            2;


        const projected =
            project3D(
                x,
                y,
                z
            );


        const size =
            p.size *
            projected.scale;


        ctx.beginPath();


        ctx.fillStyle =
            `rgba(
                245,
                ${90 + Math.random() * 100},
                255,
                ${p.alpha}
            )`;


        ctx.shadowBlur =
            10 *
            projected.scale;


        ctx.shadowColor =
            "#e000ff";


        ctx.arc(

            projected.x,

            projected.y,

            Math.max(
                size,
                .3
            ),

            0,

            Math.PI * 2
        );


        ctx.fill();


        ctx.shadowBlur = 0;
    }
}


// ======================================================
// PUNTA QUE DIBUJA EL CORAZÓN
// ======================================================

function drawDrawingPoint() {

    const point =
        heartPoint(
            drawProgress
        );


    const p =
        project3D(
            point.x,
            point.y,
            0
        );


    // Aura

    const glow =
        ctx.createRadialGradient(
            p.x,
            p.y,
            0,
            p.x,
            p.y,
            55
        );


    glow.addColorStop(
        0,
        "rgba(255,255,255,1)"
    );


    glow.addColorStop(
        .12,
        "rgba(255,180,255,.9)"
    );


    glow.addColorStop(
        .4,
        "rgba(220,0,255,.35)"
    );


    glow.addColorStop(
        1,
        "rgba(200,0,255,0)"
    );


    ctx.fillStyle =
        glow;


    ctx.beginPath();


    ctx.arc(
        p.x,
        p.y,
        55,
        0,
        Math.PI * 2
    );


    ctx.fill();


    // Punto central

    ctx.beginPath();


    ctx.fillStyle =
        "white";


    ctx.shadowBlur =
        25;


    ctx.shadowColor =
        "#ff00ff";


    ctx.arc(
        p.x,
        p.y,
        4,
        0,
        Math.PI * 2
    );


    ctx.fill();


    ctx.shadowBlur = 0;
}


// ======================================================
// COLA DE PARTÍCULAS
// ======================================================

const trail = [];


function updateTrail() {

    const point =
        heartPoint(
            drawProgress
        );


    trail.push({

        x: point.x,

        y: point.y,

        life: 1
    });


    if (
        trail.length > 100
    ) {

        trail.shift();
    }


    for (
        const p of trail
    ) {

        p.life *= .95;
    }
}


function drawTrail() {

    for (
        let i = 0;
        i < trail.length;
        i++
    ) {

        const p =
            trail[i];


        const projected =
            project3D(
                p.x,
                p.y,
                0
            );


        ctx.beginPath();


        ctx.fillStyle =
            `rgba(
                255,
                100,
                255,
                ${p.life * .25}
            )`;


        ctx.arc(

            projected.x,

            projected.y,

            Math.random() * 2,

            0,

            Math.PI * 2
        );


        ctx.fill();
    }
}


// ======================================================
// ESTRELLAS FUGACES
// ======================================================

function drawShootingStars() {

    for (
        let i =
            shootingStars.length - 1;

        i >= 0;

        i--
    ) {

        const star =
            shootingStars[i];


        star.x +=
            star.vx;


        star.y +=
            star.vy;


        star.life++;


        const progress =
            star.life /
            star.maxLife;


        const alpha =
            Math.sin(
                progress *
                Math.PI
            );


        const speed =
            Math.sqrt(
                star.vx *
                star.vx +
                star.vy *
                star.vy
            );


        const tailX =
            star.x -
            star.vx /
            speed *
            star.length;


        const tailY =
            star.y -
            star.vy /
            speed *
            star.length;


        // Cola

        const gradient =
            ctx.createLinearGradient(

                tailX,
                tailY,

                star.x,
                star.y
            );


        gradient.addColorStop(
            0,
            "rgba(255,0,255,0)"
        );


        gradient.addColorStop(
            .6,
            `rgba(
                180,
                80,
                255,
                ${alpha * .5}
            )`
        );


        gradient.addColorStop(
            1,
            `rgba(
                255,
                255,
                255,
                ${alpha}
            )`
        );


        ctx.beginPath();


        ctx.strokeStyle =
            gradient;


        ctx.lineWidth =
            star.size;


        ctx.moveTo(
            tailX,
            tailY
        );


        ctx.lineTo(
            star.x,
            star.y
        );


        ctx.stroke();


        // Cabeza

        ctx.beginPath();


        ctx.fillStyle =
            `rgba(
                255,
                255,
                255,
                ${alpha}
            )`;


        ctx.shadowBlur =
            20;


        ctx.shadowColor =
            "#d000ff";


        ctx.arc(

            star.x,

            star.y,

            star.size * 2,

            0,

            Math.PI * 2
        );


        ctx.fill();


        ctx.shadowBlur = 0;


        // Reiniciar

        if (
            star.life >
            star.maxLife
        ) {

            shootingStars.splice(
                i,
                1
            );

            createShootingStar();
        }
    }
}


// ======================================================
// PARTÍCULAS AL TOCAR
// ======================================================

const explosions = [];


canvas.addEventListener(
    "pointerdown",
    function(e) {

        // No crear explosión
        // si se está usando botón

        if (
            e.target !== canvas
        ) {

            return;
        }


        const x =
            e.clientX;


        const y =
            e.clientY;


        for (
            let i = 0;
            i < 80;
            i++
        ) {

            const angle =
                Math.random() *
                Math.PI * 2;


            const speed =
                Math.random() *
                5 + 1;


            explosions.push({

                x,

                y,

                vx:
                    Math.cos(angle) *
                    speed,

                vy:
                    Math.sin(angle) *
                    speed,

                life: 1
            });
        }
    }
);


function drawExplosions() {

    for (
        let i =
            explosions.length - 1;

        i >= 0;

        i--
    ) {

        const p =
            explosions[i];


        p.x += p.vx;

        p.y += p.vy;


        p.vx *= .97;

        p.vy *= .97;


        p.life *= .95;


        ctx.beginPath();


        ctx.fillStyle =
            `rgba(
                255,
                120,
                255,
                ${p.life}
            )`;


        ctx.shadowBlur =
            10;


        ctx.shadowColor =
            "#ff00ff";


        ctx.arc(
            p.x,
            p.y,
            1.5,
            0,
            Math.PI * 2
        );


        ctx.fill();


        ctx.shadowBlur = 0;


        if (
            p.life < .03
        ) {

            explosions.splice(
                i,
                1
            );
        }
    }
}


// ======================================================
// CONTROL CON EL DEDO
// ======================================================

let dragging = false;

let lastX = 0;

let lastY = 0;


canvas.addEventListener(
    "pointerdown",
    e => {

        dragging = true;

        lastX =
            e.clientX;

        lastY =
            e.clientY;

        canvas.setPointerCapture(
            e.pointerId
        );
    }
);


canvas.addEventListener(
    "pointermove",
    e => {

        if (!dragging) {
            return;
        }


        const dx =
            e.clientX -
            lastX;


        const dy =
            e.clientY -
            lastY;


        rotationY +=
            dx * .008;


        rotationX +=
            dy * .006;


        // Limitar giro vertical

        rotationX =
            Math.max(
                -.9,
                Math.min(
                    .9,
                    rotationX
                )
            );


        lastX =
            e.clientX;


        lastY =
            e.clientY;
    }
);


canvas.addEventListener(
    "pointerup",
    e => {

        dragging = false;

        try {

            canvas.releasePointerCapture(
                e.pointerId
            );

        } catch {}
    }
);


canvas.addEventListener(
    "pointercancel",
    () => {

        dragging = false;
    }
);


// ======================================================
// ZOOM CON RUEDA
// ======================================================

canvas.addEventListener(
    "wheel",
    e => {

        e.preventDefault();


        zoom -=
            e.deltaY *
            .001;


        zoom =
            Math.max(
                .55,
                Math.min(
                    1.8,
                    zoom
                )
            );
    },
    {
        passive: false
    }
);


// ======================================================
// ZOOM CON DOS DEDOS
// ======================================================

let lastDistance = null;


canvas.addEventListener(
    "touchmove",
    e => {

        if (
            e.touches.length !== 2
        ) {

            return;
        }


        e.preventDefault();


        const a =
            e.touches[0];


        const b =
            e.touches[1];


        const dx =
            a.clientX -
            b.clientX;


        const dy =
            a.clientY -
            b.clientY;


        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        if (
            lastDistance !== null
        ) {

            zoom +=
                (distance -
                 lastDistance) *
                .005;


            zoom =
                Math.max(
                    .55,
                    Math.min(
                        1.8,
                        zoom
                    )
                );
        }


        lastDistance =
            distance;

    },
    {
        passive: false
    }
);


canvas.addEventListener(
    "touchend",
    () => {

        lastDistance = null;
    }
);


// ======================================================
// MÚSICA
// ======================================================

const music =
    document.getElementById(
        "music"
    );


const musicButton =
    document.getElementById(
        "musicButton"
    );


let playing = false;


musicButton.addEventListener(
    "click",
    async () => {

        try {

            if (!playing) {

                music.volume = .55;

                await music.play();

                playing = true;

                musicButton.textContent =
                    "🔊";

            } else {

                music.pause();

                playing = false;

                musicButton.textContent =
                    "🎵";
            }

        } catch (error) {

            console.log(
                "No se pudo reproducir la música."
            );
        }
    }
);


// ======================================================
// PANTALLA COMPLETA
// ======================================================

const fullscreenButton =
    document.getElementById(
        "fullscreenButton"
    );


fullscreenButton.addEventListener(
    "click",
    async () => {

        try {

            if (
                !document.fullscreenElement
            ) {

                await document.documentElement
                    .requestFullscreen();

            } else {

                await document.exitFullscreen();
            }

        } catch (error) {

            console.log(error);
        }
    }
);


// ======================================================
// ANIMACIÓN
// ======================================================

let time = 0;


function animate() {

    requestAnimationFrame(
        animate
    );


    time += .016;


    // Giro automático muy suave

    autoRotation +=
        .0025;


    // ==============================================
    // DIBUJAR EL CORAZÓN
    // ==============================================

    drawProgress +=
        .025;


    if (
        drawProgress >
        Math.PI * 2
    ) {

        drawProgress =
            0;
    }


    // ==============================================
    // ACTUALIZAR
    // ==============================================

    updateTrail();


    // ==============================================
    // FONDO
    // ==============================================

    background();


    // ==============================================
    // ESTRELLAS
    // ==============================================

    drawStars();


    // ==============================================
    // GALAXIA
    // ==============================================

    drawGalaxy();


    // ==============================================
    // CORAZÓN
    // ==============================================

    drawHeart();


    drawTrail();


    drawDrawingPoint();


    // ==============================================
    // ESTRELLAS FUGACES
    // ==============================================

    drawShootingStars();


    // ==============================================
    // EXPLOSIONES
    // ==============================================

    drawExplosions();
}


animate();
