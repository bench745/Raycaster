
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// canvas dimensions
let width = canvas.offsetWidth;
let height = canvas.offsetHeight;

// to be left alone by the user
let PPU = 10;
let MID_VERT = height/2;
let MID_HORIZ = width/2;

// view changed
let changed = true;


// Window handling

/**
 * Resize the canvas element based on the css calculated values
 */
function resize() {
    // redefine width and height
    width = window.innerWidth; //canvas.offsetWidth;
    height = window.innerHeight; //canvas.offsetHeight;
    
    if (height > width * (3/4)) height = width * (3/4);  // scale to meet the ratio of the fov

    // reset the canvas element's size
    canvas.width = width;
    canvas.height = height;
    
    MID_VERT = height/2;
    MID_HORIZ = width/2;

    changed = true;
}
// add the window event listener
window.addEventListener('resize', resize);
resize();  // resize the can vas to match the window


// Key handling, held keys are in keys array

let keys = [];
function keydownHndl(e) {
    let keynum;

    if(window.event) { // IE                    
      keynum = e.keyCode;
    } else if(e.which){ // Netscape/Firefox/Opera s                  
      keynum = e.which;
    }

    if (!keys.includes(keynum)) keys.push(keynum);
    console.log('down', String.fromCharCode(keynum), keynum);

}
function keyupHndl(e) {
    let keynum;

    if(window.event) { // IE                    
      keynum = e.keyCode;
    } else if(e.which){ // Netscape/Firefox/Opera s                  
      keynum = e.which;
    }

    let i = keys.indexOf(keynum);
    if (i > -1) keys.splice(i, 1);

    console.log('up', String.fromCharCode(keynum), keynum);
}
document.onkeydown = keydownHndl;
document.onkeyup = keyupHndl;



// Mouse handling

let mouseX = 0;  // mouses x within the canvas 
let mouseY = 0;  // mouses y within the canvas
document.addEventListener("mousemove", (ev) => {
    mouseX = ev.clientX;
    mouseY = ev.clientY
});


// Utitlity functs

/**
 * Rotate vector counter clockwise
 * @param {number[]} v a two vector
 * @param {number} r an angle in radians
 */
function rotate(v, r) 
{
    let cos = Math.cos(r);
    let sin = Math.sin(r);

    return [
        v[0]*cos - v[1]*sin,
        v[0]*sin + v[1]*cos
    ];
}

/**
 * Produce an array of rays
 * @param {number} cnt the number of arrays 
 * @param {Camera} cam the camera that uses the rays
 * @returns {Line[]}
 */
function makeRays(cnt, cam)
{
    let theta = cam.fov/(cnt-1);

    let rays = [];
    let leftfov = new Line();
    leftfov.dir = rotate(cam.dir, cam.fov/2);
    leftfov.st = [cam.pos[0], cam.pos[1]];
    rays.push(leftfov);

    for (let i = 1; i < cnt; i++) {
        let r = new Line();
        r.dir = rotate(leftfov.dir, -i*theta);
        r.st = [cam.pos[0], cam.pos[1]];
        rays.push(r);
    }

    return rays;
}



// Ticker - provides an area for regular updates, should stay very light

ticker = setInterval(() => {

    // keyboard input
    keys.forEach((knum) => {
        switch (knum) {
            case 65:  // a
                //console.log('a');
                player.dir = rotate(player.dir, 0.1);
                changed = true;
                break;

            case 68:  // d
                //console.log('d');
                player.dir = rotate(player.dir, -0.1);
                changed = true;
                break;
        
            default:
                //console.log(knum);
                break;
        }
    });

    // mouse input, and attempt at branchless
    let deltax = (mouseX-MID_HORIZ)/PPU - player.pos[0];
    let deltay = (-mouseY+MID_VERT)/PPU - player.pos[1];
    player.pos[0]  = (mouseX-MID_HORIZ)/PPU;
    player.pos[1]  = (MID_VERT-mouseY)/PPU;
    changed |= (Boolean(deltax) || Boolean(deltay));

}, 50);



// render each frame

function rendermap() 
{
    // only rneder if nessisary
    if (!changed) {
        window.requestAnimationFrame(rendermap);
        return;
    }

    // clear canvas
    //console.log('clear');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
 

    // draw walls
    lvl.forEach((w) => {
        ctx.beginPath();
        ctx.moveTo(
            MID_HORIZ + PPU*w.st[0],
            MID_VERT - PPU*w.st[1]
        );
        ctx.lineTo(
            MID_HORIZ + PPU*w.fn[0],
            MID_VERT - PPU*w.fn[1]
        );

        ctx.stroke();
    });


    // draw player 
    ctx.beginPath();
    ctx.arc(
        MID_HORIZ + PPU*player.pos[0], 
        MID_VERT - PPU*player.pos[1],
        3,
        0,
        Math.PI*2
    );
    ctx.stroke();


    // show ray intercepts with walls
    plos = makeRays(10, player);  // player line of sight
    pvision = scanlvlwalls(plos, lvl);

    let style = ctx.fillStyle;  // setup the style

    pvision.forEach((item, i) => {
        
        let lambda = item[0];  // dir v along ray
        let mu = item[1];  // dir v along wall
        let wl = item[2];  // wall

        if (wl != null) {
            let x = wl.dir[0] * mu + wl.st[0];
            let y = wl.dir[1] * mu + wl.st[1];
            ctx.fillStyle = wl.cf(mu, lambda);  // wall.colourfunction defined in level.js based on pos on wall and distance
            ctx.beginPath();
            ctx.arc(
                MID_HORIZ + PPU*x,
                MID_VERT - PPU*y,
                5,
                0,
                Math.PI * 2
            );
            //console.log(x, y);
            ctx.fill();
        }
    });

    ctx.fillStyle = style;  // rest the style

    
    changed = false;

    // setup next frame
    window.requestAnimationFrame(rendermap);
}

rendermap();

