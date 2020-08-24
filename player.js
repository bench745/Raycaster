class Camera {
    pos = [0, 0]; // the position of the cam
    dir = [0, 1]; // a unit vector
    fov = 4/6 * Math.PI;  // the cams fov

    constructor() {}
}


let player = new Camera();