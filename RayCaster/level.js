class Line {
    st = [0, 0];  // x, y positon
    dir = [0, 1];  // direction vector
}

/**
 * work out where a pair of lines intecpt if at all
 * @param {Line} p
 * @param {Line} q
 * @returns {number[]} [dir mul p, dir mul q] or [NaN, NaN] if there is no intercept
 */
function intercepts(p, q)
{
    if (p.dir[0] == q.dir[0] && p.dir[1] == q.dir[1]) {
        if (p.st[0] == q.st[0] && p.st[1] == q.st[1]) return [0, 0];
        else return [NaN, NaN];
    }

    // lambda is the multiple of the direction vector or p
    let lambda = ( q.dir[1]*(p.st[0]-q.st[0]) + q.dir[0]*(q.st[1]-p.st[1]) ) / 
        ( q.dir[0]*p.dir[1] - q.dir[1]*p.dir[0] ); 

    // mu is the multiple of the direction vector of q
    let mu = ( p.dir[1]*(q.st[0]-p.st[0]) + p.dir[0]*(p.st[1]-q.st[1]) ) / 
        ( q.dir[1]*p.dir[0] - q.dir[0]*p.dir[1] );

    return [lambda, mu];
}


class Wall extends Line {
    st = [0, 0];
    fn = [0, 0];
    dir = [0, 0];
    cf = (x) => {return "rgba(100,30,30,255)";}

    // the maximum multiple of the dir vector that can be added to st  
    // such that the described point id part of the wall
    maxmu = 1;  


    /**
     * produce a wall
     * @param {number[]} st the start pos of the wall
     * @param {number[]} fn the finsh pos of the wall
     */
    constructor(st, fn)
    {
        super();
        if (st.length == 2 && fn.length == 2) {
            this.st = st;
            this.fn = fn;
            this.dir[0] = fn[0] - st[0];
            this.dir[1] = fn[1] - st[1];
        }
    }

}


/**
 * Scan the a level for walls
 * @param {Line[]} rays 
 * @param {Wall[]} level 
 * @returns {any[]} an array detailing intercepts [Location in terms of ray, Location in terms of wall, ref to wall]
 */
function scanlvlwalls(rays, level)
{
    result = [];

    // iterate through the rays
    rays.forEach((ray) => {
        let closest = [Infinity, Infinity, null];

        // check if the intercept with each wall is closer than infinity and the other walls
        level.forEach((wl) => {
            let a = intercepts(ray, wl);
            if (a[0] > 0 && a[1] > 0 && a[1] < wl.maxmu && !isNaN(a[0])) // validate
                if (a[0] < closest[0]) closest = [a[0], a[1], wl];  // if it closer
        });

        // add the closest for the ray to the result
        result.push(closest); 
    });

    return result;
}


let lvl = [
    new Wall([-10, 10], [10, -10]),
    new Wall([10, 10], [-10, -10]),
    new Wall([-20, 20], [20, 20])
];

lvl[2].cf = (x, DIST) => { return ("rgb(" + String(255/DIST) + "," + String(x*255) + "," + String(255/DIST) + ")"); }