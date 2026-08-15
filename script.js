const canvas =
    document.getElementById("space");

const ctx =
    canvas.getContext("2d");


// ==========================================
// CONFIGURACIÓN
// ==========================================

let width;
let height;

let centerX;
let centerY;

const PARTICLE_COUNT = 3500;

const STAR_COUNT = 450;

const SHOOTING_STAR_COUNT = 8;


// ==========================================
// RESIZE
// ==========================================

function resize() {

    const dpr =
        Math.min(window.devicePixelRatio || 1, 2);

    width = canvas.clientWidth;
    height = canvas.clientHeight;

    canvas.width =
        width * dpr;

    canvas.height =
        height * dpr;

    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );

    centerX = width / 2;
    centerY = height / 2;
}

window.addEventListener(
    "resize",
    resize
);

resize();


// ==========================================
// VARIABLES 360°
// ==========================================

let cameraAngle = 0;

let cameraX = 0;
let cameraZ = 0;

let time = 0;


// ==========================================
// CORAZÓN
// ==========================================

function heartFunction(t) {

    const x =
        16 *
        Math.pow(Math.sin(t), 3);

    const y =
        13 * Math.cos(t)
        - 5 * Math.cos(2 * t)
        - 2 * Math.cos(3 * t)
        - Math.cos(4 * t);

    return {
        x,
        y
    };
}


// ==========================================
// PARTÍCULAS DEL CORAZÓN
// ==========================================

const heartParticles = [];


// Crear partículas

for (
    let i = 0;
    i < PARTICLE_COUNT;
    i++
) {

    const t =
        Math.random() *
        Math.PI * 2;


    const heart =
        heartFunction(t);


    // Variación para hacer el corazón
    // más grueso y lleno

    const thickness =
        Math.pow(
            Math.random(),
            0.55
        );


    const spread =
        thickness * 1.9;


    const x =
        heart.x +
        (Math.random() - 0.5) *
        spread;


    const y =
        heart.y +
        (Math.random() - 0.5) *
        spread;


    const z =
        (Math.random() - 0.5) *
        15;


    heartParticles.push({

        x,
        y,
        z,

        originalX: x,
        originalY: y,
        originalZ: z,

        size:
            Math.random() * 1.5 + .3,

        alpha:
            Math.random() * .8 + .2,

        phase:
            Math.random() *
            Math.PI * 2,

        speed:
            Math.random() *
            .03 + .01
    });
}


// ==========================================
// ESTRELLAS DEL ESPACIO
// ==========================================

const stars = [];


for (
    let i = 0;
    i < STAR_COUNT;
    i++
) {

    stars.push({

        x:
            (Math.random() - .5) *
            1200,

        y:
            (Math.random() - .5) *
            800,

        z:
            Math.random() *
            900 + 100,

        size:
            Math.random() *
            1.5 + .3,

        alpha:
            Math.random() *
            .8 + .2,

        twinkle:
            Math.random() *
            Math.PI * 2
    });
}


// ==========================================
// ESTRELLAS FUGACES
// ==========================================

const shootingStars = [];


function createShootingStar() {

    const side =
        Math.floor(
            Math.random() * 4
        );


    let x;
    let y;


    if (side === 0) {

        x = -100;

        y =
            Math.random() *
            height;

    }

    else if (side === 1) {

        x =
            width + 100;

        y =
            Math.random() *
            height;

    }

    else if (side === 2) {

        x =
            Math.random() *
            width;

        y = -100;

    }

    else {

        x =
            Math.random() *
            width;

        y =
            height + 100;
    }


    const targetX =
        width / 2 +
        (Math.random() - .5) *
        width;


    const targetY =
        height / 2 +
        (Math.random() - .5) *
        height;


    const dx =
        targetX - x;


    const dy =
        targetY - y;


    const length =
        Math.sqrt(
            dx * dx +
            dy * dy
        );


    shootingStars.push({

        x,
        y,

        vx:
            dx / length *
            (5 + Math.random() * 5),

        vy:
            dy / length *
            (5 + Math.random() * 5),

        life: 0,

        maxLife:
            80 + Math.random() * 70,

        size:
            1 + Math.random() * 2,

        length:
            40 + Math.random() * 90
    });
}


// Crear varias al inicio

for (
    let i = 0;
    i < SHOOTING_STAR_COUNT;
    i++
) {

    createShootingStar();
}


// ==========================================
// PROYECCIÓN 3D
// ==========================================

function project3D(x, y, z) {

    // Rotación horizontal 360°

    const cos =
        Math.cos(cameraAngle);

    const sin =
        Math.sin(cameraAngle);


    const rotatedX =
        x * cos -
        z * sin;


    const rotatedZ =
        x * sin +
        z * cos;


    // Rotación vertical

    const verticalAngle =
        Math.sin(time * .25) *
        .18;


    const cosV =
        Math.cos(verticalAngle);

    const sinV =
        Math.sin(verticalAngle);


    const rotatedY =
        y * cosV -
        rotatedZ * sinV;


    const finalZ =
        y * sinV +
        rotatedZ * cosV;


    const cameraDistance =
        420;


    const scale =
        cameraDistance /
        (cameraDistance + finalZ);


    return {

        x:
            centerX +
            rotatedX *
            scale *
            8,

        y:
            centerY +
            rotatedY *
            scale *
            8,

        scale
    };
}


// ==========================================
// FONDO
// ==========================================

function drawBackground() {

    const gradient =
        ctx.createRadialGradient(
            centerX,
            centerY,
            0,
            centerX,
            centerY,
            Math.max(width, height)
        );


    gradient.addColorStop(
        0,
        "rgba(55,0,90,.18)"
    );


    gradient.addColorStop(
        .45,
        "rgba(18,0,35,.4)"
    );


    gradient.addColorStop(
        1,
        "rgba(0,0,0,.9)"
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


// ==========================================
// ESTRELLAS
// ==========================================

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
                time * 2 +
                star.twinkle
            ) * .5;


        ctx.beginPath();


        ctx.fillStyle =
            `rgba(255,255,255,${
                star.alpha *
                twinkle
            })`;


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


// ==========================================
// CORAZÓN
// ==========================================

function drawHeart() {

    for (
        const particle
        of heartParticles
    ) {

        // Movimiento orgánico

        const wave =
            Math.sin(
                time *
                particle.speed *
                10 +
                particle.phase
            ) * .8;


        const x =
            particle.originalX +
            wave;


        const y =
            particle.originalY +
            Math.cos(
                time *
                .5 +
                particle.phase
            ) * .4;


        const z =
            particle.originalZ +
            Math.sin(
                time *
                .7 +
                particle.phase
            ) * 2;


        const p =
            project3D(
                x,
                y,
                z
            );


        if (
            p.x < -20 ||
            p.x > width + 20 ||
            p.y < -20 ||
            p.y > height + 20
        ) {
            continue;
        }


        const size =
            particle.size *
            p.scale;


        ctx.beginPath();


        ctx.fillStyle =
            `rgba(
                ${220 + Math.random() * 35},
                ${60 + Math.random() * 130},
                255,
                ${particle.alpha}
            )`;


        ctx.shadowBlur =
            12 * p.scale;


        ctx.shadowColor =
            "#d000ff";


        ctx.arc(
            p.x,
            p.y,
            Math.max(size, .3),
            0,
            Math.PI * 2
        );


        ctx.fill();


        ctx.shadowBlur = 0;
    }
}


// ==========================================
// ESTRELLAS FUGACES
// ==========================================

function drawShootingStars() {

    for (
        let i =
            shootingStars.length - 1;
        i >= 0;
        i--
    ) {

        const star =
            shootingStars[i];


        star.x += star.vx;

        star.y += star.vy;

        star.life++;


        const progress =
            star.life /
            star.maxLife;


        const alpha =
            Math.sin(
                progress * Math.PI
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


        // Cola luminosa

        const gradient =
            ctx.createLinearGradient(
                tailX,
                tailY,
                star.x,
                star.y
            );


        gradient.addColorStop(
            0,
            "rgba(255,255,255,0)"
        );


        gradient.addColorStop(
            .5,
            `rgba(180,100,255,${alpha * .4})`
        );


        gradient.addColorStop(
            1,
            `rgba(255,255,255,${alpha})`
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
            `rgba(255,255,255,${alpha})`;


        ctx.shadowBlur = 20;

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


// ==========================================
// POLVO CÓSMICO
// ==========================================

function drawCosmicDust() {

    for (
        let i = 0;
        i < 90;
        i++
    ) {

        const angle =
            Math.random() *
            Math.PI * 2;


        const distance =
            130 +
            Math.random() *
            260;


        const x =
            centerX +
            Math.cos(angle) *
            distance;


        const y =
            centerY +
            Math.sin(angle) *
            distance;


        ctx.beginPath();


        ctx.fillStyle =
            `rgba(
                190,
                70,
                255,
                ${Math.random() * .25}
            )`;


        ctx.arc(
            x,
            y,
            Math.random() * 1.5,
            0,
            Math.PI * 2
        );


        ctx.fill();
    }
}


// ==========================================
// LUZ CENTRAL
// ==========================================

function drawCenterGlow() {

    const radius =
        Math.min(width, height) *
        .3;


    const gradient =
        ctx.createRadialGradient(
            centerX,
            centerY,
            0,
            centerX,
            centerY,
            radius
        );


    gradient.addColorStop(
        0,
        "rgba(220,0,255,.13)"
    );


    gradient.addColorStop(
        .35,
        "rgba(120,0,255,.08)"
    );


    gradient.addColorStop(
        1,
        "rgba(0,0,0,0)"
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


// ==========================================
// ANIMACIÓN PRINCIPAL
// ==========================================

function animate() {

    requestAnimationFrame(
        animate
    );


    time += .016;


    // Giro 360°

    cameraAngle += .004;


    // Limpiar

    ctx.fillStyle =
        "rgba(0,0,0,.25)";


    ctx.fillRect(
        0,
        0,
        width,
        height
    );


    drawBackground();

    drawCenterGlow();

    drawStars();

    drawCosmicDust();

    drawHeart();

    drawShootingStars();
}


animate();
