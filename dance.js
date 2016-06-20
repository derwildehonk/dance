FOOTPRINT_REUSE = 1100;
DANCER_LEFT_XOFF = -30;
DANCER_RIGTH_XOFF = 30;
POINTER_WIDTH = 50;
FOOTPRINT_WIDTH = 50;
FOOTPRINT_HEIGHT = 100;

//////////////////////////////////

// FOOTPRINT

function footprint () {
    this.img = new Image();
    this.img.classList = "footprint hidden";
    this.lastuse = 0;
    document.body.appendChild(this.img);
}

stepimgs = {}
stepimgs['step'] = "img/step.png";
stepimgs['ball'] = "img/ball.png";
stepimgs['edge'] = "img/edge.png"; 
stepimgs['heel'] = "img/heel.png"; 
stepimgs['shuf'] = "img/shuf.png"; 
stepimgs['tip'] = "img/tip.png"; 
stepimgs['stomp'] = "img/stomp.png"; 

footprint.prototype.step = function(x, y, rot, type) {
    this.img.classList.remove("hidden", "fading");
    this.img.style.left = x - FOOTPRINT_WIDTH / 2;
    this.img.style.top = -y - FOOTPRINT_HEIGHT / 2;
    this.img.style.transform = "rotate(" + rot + "deg)";
    //type
    this.img.src = stepimgs[type];
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

// POINTER

function pointer () {
    this.img = new Image();
    this.img.classList = "pointer";
}

pointer.prototype.move = function(x, y, rot) {
    this.img.style.left = x - POINTER_WIDTH / 2;
    this.img.style.top = -y - POINTER_WIDTH / 2;
    this.img.style.transform = "rotate(" + rot + "deg)";
    this.img.src = "arrow.png";
    document.body.appendChild(this.img);
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
    var x, y, tx, ty;
    if(pt1.sx == null){//linear?
        x = pt1.x + (pt2.x - pt1.x) * rat;
        y = pt1.y + (pt2.y - pt1.y) * rat;
        tx = pt2.x - pt1.x;
        ty = pt2.y - pt1.y;
    }else {//bezier
        var rat1 = 1 - rat;
        x = rat1 * rat1 * pt1.x + 2 * rat1 * rat * pt1.sx + rat * rat * pt2.x;
        y = rat1 * rat1 * pt1.y + 2 * rat1 * rat * pt1.sy + rat * rat * pt2.y;
        tx = (rat - 1) * pt1.x + (1 - 2 * rat) * pt1.sx + pt2.x * rat;
        ty = (rat - 1) * pt1.y + (1 - 2 * rat) * pt1.sy + pt2.y * rat;
    }
    if(ty == 0)
        rot = tx < 0 ? 270 : 90;
    else
        rot = Math.atan(tx / ty) * 180 / Math.PI + (ty < 0 ? 180 : 0);
    if(rot > 360)
        rot -= 360;
    return [x, y, rot];
}

function addpt(base, pt) {
    var ang = base[2] * Math.PI / 180.;
    var nx = base[0] + pt[0] * Math.cos(ang) + pt[1] * Math.sin(ang);
    var ny = base[1] - pt[0] * Math.sin(ang) + pt[1] * Math.cos(ang);
    var rot = base[2] + pt[2];
    while(rot > 360)
        rot -= 360;
    while(rot < 0)
        rot += 360;
    return [nx, ny, rot];
}

//////////////////////////////////

// DANCER

function dancer(x, y, r, clk) {
    this.clk = clk;
    this.x = x;
    this.y = y;
    this.rot = r;
    this.left = new foot();
    this.right = new foot();
    this.pointer = new pointer();
    this.steps = [];
    this.move = [];
    this.lasttick = -1;
    //init
    this.clk.register(this, null);
    pt = addpt([x, y, r], [DANCER_LEFT_XOFF, 0, 0]);
    this.left.step(pt[0], pt[1], pt[2], "step");
    pt = addpt([x, y, r], [DANCER_RIGTH_XOFF, 0, 0]);
    this.right.step(pt[0], pt[1], pt[2], "step");
}

dancer.prototype.clk_call = function (now) {
    var i;
    var mov = this.getpos(now);
    this.pointer.move(mov[0], mov[1], mov[2]);
    for(i = 0; i < this.steps.length; i++){
        if(now >= this.steps[i].time && this.lasttick < this.steps[i].time)
            this.dostep(i);
    }
    this.lasttick = now;
    return null;
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
    var mov = this.getpos(st.time);
    var mov2 = addpt(mov, [st.x, st.y, st.rot]);
    var mov3 = addpt(mov2, [ftx, 0, 0]);
    ft.step(mov3[0], mov3[1], mov3[2], st.typ);
}

dancer.prototype.getpos = function(now) {
    if(this.move.length < 2)
        return [this.x, this.y, this.rot]
    var i;
    for(i = 0; i < this.move.length; i++){
        if(now > this.move[i].time)
            break;
    }
    if(i >= this.move.length - 1)
        i = this.move.length - 2;
    if(now < this.move[i].time)
        now = this.move[i].time;
    if(now > this.move[i+1].time)
        now = this.move[i+1].time;
    bz = bezier(now, this.move[i], this.move[i+1]);
    return addpt([this.x, this.y, this.rot], bz);
}

//////////////////////////////////

// CLOCK

function clock() {
    this.speed = 128; //1 beat per sec
    this.start = null;
    this.end = null;
    this.loop = false;
    this.hands = [];
    this.sched_tout = null;
    this.tickdelta = 1000 / 64;
}

clock.prototype.register = function(handler) {
    this.hands.push(handler);
}

clock.prototype.run = function(start, end, loop = false) {
    this.start = start;
    this.end = end;
    this.loop = loop;
    this.begin = new Date().getTime() - start * 1000 / this.speed;
    this.sched_tout = setInterval(clock_call, self.tickdelta, this);
    for(i = 0; i < this.hands.length; i++)
        this.hands[i].clk_call(start);
    console.log("clk run " + this.begin);
}

clock.prototype.getnow = function() {
    var now = new Date().getTime();
    now = (now - this.begin) * this.speed / 1000;
    return now;
}

function clock_call(clock) {
    var now = clock.getnow();
    document.getElementById("now").innerHTML = now;
    for(i = 0; i < clock.hands.length; i++)
        hand = clock.hands[i].clk_call(now);
    if(now >= clock.end){
        if(clock.loop){
            clock.begin += (clock.end - clock.start) * 1000 / clock.speed;
            console.log("clk wrap " + clock.begin);
            clock_call(clock);
        }else{
            console.log("clk stop");
            clearTimeout(clock.sched_tout);
        }
    }
}

//////////////////////////////////

// FUNCTIONS

function beat(full, count, parts) {
    if(parts > 128)
        throw "time precision is only 128 parts";
    return full * 128 + count * (128 / parts);
}

//////////////////////////////////

// STORAGE

function fetchfile(uri, handler = null) {
    var req = {
        req : new XMLHttpRequest(),
        data : null
    };
    req.req.onreadystatechange = function() {
        if(req.readyState == 4 && req.status == 200){
            data = req.responseText;
            if(handler)
                handler(data);
        }
    }
    req.req.open("GET", uri, true);
    req.req.send();
    return req;
}

function loadfile(file, handler = nul) {
    var req = {
        file : file,
        reader : new FileReader,
        data : null
    };
    req.reader.onload = function() {
        req.data = req.reader.result;
        if(handler)
            handler(req.data);
    }
    req.reader.readAsText(file);
    return req;
}


function parsejson(jsondata) {
    var data = JSON.parse(jsondata);
    var root = document.body;

    for(var i = 0; i < data.dancer.length; i++){
        var dncr = data.dancer[i];
        var pos = dncr.pos.split(",")
        var ipos = [parseInt(pos[0]), parseInt(pos[1]), parseInt(pos[2])];
        var d = new dancer(ipos[0], ipos[1], ipos[2], clk);
        console.log("create new dancer");
        for(var n = 0; n < dncr.steps.length; n++){
            var stp = dncr.steps[n];
            var sbeat = stp.beat.split("/");
            var ibeat = [parseInt(sbeat[0]), parseInt(sbeat[1]), parseInt(sbeat[2])];
            var tbeat = beat(ibeat[0], ibeat[1], ibeat[2]);
            var pos = stp.pos.split(",");
            var ipos = [parseInt(pos[0]), parseInt(pos[1]), parseInt(pos[2])];
            var typ = stp.type.split(".");
            d.steps.push(new step(tbeat, typ[0], ipos[0], ipos[1], ipos[2], typ[1])); 
        }
    }
}