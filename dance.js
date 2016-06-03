FOOTPRINT_REUSE = 1100;
DANCER_LEFT_XOFF = -30;
DANCER_RIGTH_XOFF = 30;

//////////////////////////////////

// FOOTPRINT

function footprint () {
    this.img = new Image();
    this.img.classList = "footprint hidden";
    this.lastuse = 0;
    document.body.appendChild(this.img);
}

footprint.prototype.step = function(x, y, rot, type) {
    this.img.classList.remove("hidden", "fading");
    this.img.style.left = x;
    this.img.style.top = -y;
    this.img.style.transform = "rotate(" + rot + "deg)";
    //type
    this.img.src = "step.png";
}

footprint.prototype.fade = function() {
    this.img.classList.add("hidden", "fading");
    this.lastuse = new Date().getTime();
}

footprint.prototype.isavail = function() {
    now = new Date().getTime();
    if(this.lastuse + FOOTPRINT_REUSE > now)
        return false;
    else
        return true;
}

//////////////////////////////////

// FOOT

function foot() {
    this.prints = [];
    this.last = null;
}

foot.prototype.step = function(x, y, rot, typ) {
    if(this.last != null)
        this.last.fade();
    //find a free print
    var choose = null;
    for(var i = 0; i < this.prints.length; i++){
        if(this.prints[i].isavail()){
            choose = this.prints[i];
            break;
        }
    }
    if(choose == null){
        choose = new footprint();
        this.prints.push(choose);
    }
    choose.step(x, y, rot, typ);
    this.last = choose;
}

//////////////////////////////////

// STEP

function step(beat, ft, x, y, rot, typ) {
    this.time = beat;
    this.foot = ft;
    this.x = x;
    this.y = y;
    this.rot = rot;
    this.typ = typ;
}

//////////////////////////////////

// MOVEPT

function movept(beat, x, y, sx, sy) {
    this.time = beat;
    this.x = x;
    this.y = y;
    this.sx = sx;
    this.sy = sy;
}

function bezier(time, pt1, pt2) {
    if(pt1.time >= pt2.time){
        tmp = pt1;
        pt1 = pt2;
        pt2 = tmp;
    }
    if(time < pt1.time)
        time = pt1.time;
    if(time > pt2.time)
        time = pt2.time;
    var rat = (time - pt1.time) / (pt2.time - pt1.time);
    if(pt1.sx == null){//linear?
        x = pt1.x + (pt2.x - pt1.x) * rat;
        y = pt1.y + (pt2.y - pt1.y) * rat;
        return [x, y]
    }
    //bezier
    var rat1 = 1 - rat;
    x = rat1 * rat1 * pt1.x + 2 * rat1 * rat * pt1.sx + rat * rat * pt2.x;
    y = rat1 * rat1 * pt1.y + 2 * rat1 * rat * pt1.sy + rat * rat * pt2.y;
    return [x, y];
}
        
//////////////////////////////////

// DANCER

function dancer(x, y, clk) {
    this.clk = clk;
    this.x = x;
    this.y = y;
    this.rot = 0;
    this.left = new foot();
    this.right = new foot();
    this.steps = [];
    this.move = [];
    this.lasttick = -1;
    //init
    this.clk.register(this);
    this.left.step(x + DANCER_LEFT_XOFF, y, 0, "step");
    this.right.step(x + DANCER_RIGTH_XOFF, y, 0, "step");
}

dancer.prototype.clk_call = function (now) {
    var i;
    for(i = 0; i < this.steps.length; i++){
        if(now >= this.steps[i].time && this.lasttick < this.steps[i].time)
            this.dostep(i);
    }
    this.lasttick = now;
}

dancer.prototype.dostep = function(num) {
    var st = this.steps[num];
    var ft, ftx;
    if(st.foot == 'l'){
        ft = this.left;
        ftx = DANCER_LEFT_XOFF;
    }else{
        ft = this.right;
        ftx = DANCER_RIGTH_XOFF;
    }
    var x = this.x + st.x + ftx;
    var y = this.y + st.y;
    var r = this.rot + st.rot;
    ft.step(x, y, r, st.typ);
}

dancer.prototype.getpos = function(now) {
    if(this.move.length == 0)
        return [this.x, this.y]
    var i;
    for(i = 0; i < this.move.length; i++){
        if(now > this.move[i].time)
            break;
    }
    if(i >= this.move.length - 1)
        return [this.x + this.move[i].x, this.y + this.move[i].y]
    bz = bezier(this.move[i], this.move[i+1], now);
    return [this.x + bz.x, this.y + bz.y];
}

//////////////////////////////////

// CLOCK

function clock() {
    this.now = 0;
    this.speed = 128; //1 beat per sec
    this.start = null;
    this.hands = [];
    this.sched_tout = null;
    this.tickdelta = 1000 / 64;
}

function clock_hand(handler, delta) {
    this.handler = handler;
    this.delta = delta;
    this.next = 0;
}

clock.prototype.register = function(handler, tickdelta) {
    this.hands.push(new clock_hand(handler, tickdelta));
}

clock.prototype.run = function(start, end) {
    this.now = start;
    this.end = end;
    this.start = new Date().getTime() - start * 1000 / this.speed;
    setTimeout(clock_tick, self.tickdelta, this); 
}

clock.prototype.getnow = function() {
    var now = new Date().getTime();
    this.now = (now - this.start) * this.speed / 1000;
    return this.now;
}

function clock_call(clock) {
    now = clock.getnow();
    for(i = 0; i < this.hands.length; i++){
        hand = this.hand[i];
        if(now >= hand.next){
            next = hand.handler.clk_call(now);
            if(next != null)
                hand.next = next;
            else
                hand.next = now + hand.delta;
        }
    }
}

//////////////////////////////////

// FUNCTIONS

function beat(full, count, parts) {
    if(parts > 128)
        throw "time precision is only 128 parts";
    return full + 128 + count * (128 / parts);
}
