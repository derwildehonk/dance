// dictionary
// dig - heel edge; no weight
// spank - swing back; ball tap

FOOTPRINT_REUSE = 1100;
DANCER_LEFT_XOFF = -50;
DANCER_RIGTH_XOFF = 50;
POINTER_WIDTH = 50;
FOOTPRINT_WIDTH = 50;
FOOTPRINT_HEIGHT = 100;

//////////////////////////////////

// FOOTPRINT

function footprint () {
    this.img = new Image();
    this.img.classList = "footprint hidden";
    this.high = new Image();
    this.high.classList = "highlight hidden";
    this.lastuse = 0;
    document.body.appendChild(this.img);
    document.body.appendChild(this.high);
}

stepimgs = {}
stepimgs['step'] = "img/step.png";
stepimgs['ball'] = "img/ball.png";
stepimgs['edge'] = "img/edge.png"; 
stepimgs['heel'] = "img/step.png"; 
stepimgs['shuf'] = "img/shuf.png"; 
stepimgs['tip'] = "img/tip.png"; 
stepimgs['stomp'] = "img/stomp.png";
stepimgs['dig'] = "img/edge.png";
stepimgs['touch'] = "img/shuf.png";
stepimgs['fly'] = "img/fly.png";
stepimgs['spank'] = "img/shuf.png";

highimgs = {}
highimgs['step']  = "img/stomp_s.png";
highimgs['ball']  = "img/ball_h.png";
highimgs['edge']  = "img/stomp_s.png"; 
highimgs['heel']  = "img/heel_s.png"; 
highimgs['shuf']  = "img/shuf_h.png"; 
highimgs['tip']   = "img/stomp_s.png"; 
highimgs['stomp'] = "img/stomp_s.png";
highimgs['dig']   = "img/dig_h.png";
highimgs['touch'] = "img/shuf_h.png";
highimgs['fly']   = "img/stomp_s.png";
highimgs['spank'] = "img/stomp_s.png";

footprint.prototype.step = function(x, y, rot, type) {
    this.img.classList.remove("hidden", "fade");
    this.img.style.left = x - FOOTPRINT_WIDTH / 2;
    this.img.style.top = -y - FOOTPRINT_HEIGHT / 2;
    this.img.style.transform = "rotate(" + rot + "deg)";
    this.img.src = stepimgs[type];
    //
    this.high.classList.remove("hidden", "highfade");
    this.high.style.left = x - FOOTPRINT_WIDTH / 2;
    this.high.style.top = -y - FOOTPRINT_HEIGHT / 2;
    this.high.style.transform = "rotate(" + rot + "deg)";
    this.high.src = highimgs[type];
    setTimeout(highfade, 100, this.high);
}

function highfade(img){
    img.classList.add("hidden", "highfade");
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
    this.img.src = "img/pointer.png";
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

// CURVE

function curve() {
    this.points = []
}

curve.prototype.interval = function() {
    var len = this.points.length;
    if(len == 0)
        return [0, 0];
    if(len == 1)
        return [this.points[0].beat, this.points[0].beat];
    return [this.points[0].beat, this.points[len-1].beat]
}

curve.prototype.addpoint = function(beat, x, y, rot, sx, sy) {
    item =  {
        beat : beat,
        x : x,
        y : y,
        r : rot,
        sx: sx,
        sy : sy
    };
    this.points.push(item);
}

curve.prototype.get = function(now) {
    if(this.points.length < 2)
        return [0, 0, 0];
    var i;
    for(i = 1; i < this.points.length - 1; i += 1){
        if(this.points[i].beat > now)
            break;
    }
    return bezier(now, this.points[i-1], this.points[i]);
}

function bezier(time, pt1, pt2) {
    if(pt1.beat >= pt2.beat){
        tmp = pt1;
        pt1 = pt2;
        pt2 = tmp;
    }
    if(time < pt1.beat)
        time = pt1.beat;
    if(time > pt2.beat)
        time = pt2.beat;
    var rat = (time - pt1.beat) / (pt2.beat - pt1.beat);
    var x, y, tx, ty, rot;
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
    if(pt1.r != null){
        if(pt2.r != null)
            rot = pt1.r + (pt2.r - pt1.r) * rat;
        else
            rot = pt1.r;
    }else{ 
        if(ty == 0 && tx == 0)
            rot = 0;
        else if(ty == 0)
            rot = tx < 0 ? 270 : 90;
        else
            rot = Math.atan(tx / ty) * 180 / Math.PI + (ty < 0 ? 180 : 0);
    }
    while(rot > 360)
        rot -= 360;
    while(rot < 0)
        rot += 360;
    return [x, y, rot];
}

function addpt(base, pt, mirror = false) {
    var p = pt.slice();
    if(mirror){
        p[0] = -p[0];
        p[2] = -p[2];
    }
    var ang = base[2] * Math.PI / 180.;
    var nx = base[0] + p[0] * Math.cos(ang) + p[1] * Math.sin(ang);
    var ny = base[1] - p[0] * Math.sin(ang) + p[1] * Math.cos(ang);
    var rot = base[2] + p[2];
    while(rot > 360)
        rot -= 360;
    while(rot < 0)
        rot += 360;
    return [nx, ny, rot];
}

//////////////////////////////////

// SEQUENCE

function sequence() {
    this.steps = [];
    this.curve = [];
    this.subs = [];
}

sequence.prototype.addstep = function(beat, pos, foot, typ){
    var o = {beat : beat, pos : pos, foot : foot, typ : typ};
    for(var i = 0; i < this.steps.length; i++){
        if(this.steps[i].beat > o.beat){
            this.steps.splice(i, 0, o);
            return;
        }
    }
    this.steps.push(o);
}

sequence.prototype.addseq = function(beat, pos, seq, mir = false){
    var o = {seq : seq, pos : pos, beat : beat, mirror : mir};
    this.subs.push(o);
}

sequence.prototype.addpoint = function(beat, x, y, rot, sx, sy){
    o = {beat : beat, x : x, y : y, r : rot, sx : sx, sy : sy};
    for(var i = 0; i < this.curve.length; i++){
        if(this.curve[i].beat > o.beat){
            this.curve.splice(i, 0, o);
            return;
        }
    }
    this.curve.push(o);
}

sequence.prototype.getpos = function(now, mir){
    var pos;
    //curve
    var npoints = this.curve.length;
    if(npoints == 1) //only one point - take this one
        pos = this.curve[0].pos;
    else if(npoints >= 2){
        var n;
        for(n = 0; n < npoints; n++){
            if(now < this.curve[n].beat)
                break;
        }
        var tme = now;
        if(n == 0){ //smaller than first point - take this one
            tme = this.curve[0].beat;
            n = 1; 
        }else if(n >= npoints){ //bigger than last point - take this one
            tme = this.curve[npoints-1].beat;
            n = npoints - 1;
        }
        pos = bezier(now, this.curve[n-1], this.curve[n]);
    }else
        pos = [0, 0, 0];
    if(mir)
        pos[0] = -pos[0]; 
    //recurse on subs
    var nsubs = this.subs.length;
    for(n = 0; n < nsubs; n++){
        var run = this.subs[n];
        var spos = run.seq.getpos(now - run.beat, mir ^ run.mirror);
        spos = addpt(run.pos, spos);
        pos = addpt(pos, spos);
    }
    return pos;
}

//TODO neither sequences nor steps are sorted
sequence.prototype.getsteps = function(t1, t2, troot = 0, mirror = false, last = null){
    if(last == null)
        last = {l : null, r : null};
    var ret = new Array();
    for(var i = 0; i < this.steps.length; i++){
        var st = this.steps[i];
        var isleft = st.foot == 'l';
        var o = {step : st, beat : troot, mirror : mirror, last : isleft ? last.l : last.r};
        if(st.pos != null){  
            if(isleft)
                last.l = o;
            if(!isleft)
                last.r = o;
        }
        if(t1 <= st.beat && t2 > st.beat)
            ret.push(o);
    }
    for(var i = 0; i < this.subs.length; i++){
        var off = this.subs[i].beat;
        var mir = this.subs[i].mirror ^ mirror;
        var pts = this.subs[i].seq.getsteps(t1 - off, t2 - off, troot + off, mir, last);
        ret.push.apply(ret, pts); 
    }
    return ret;
}

//////////////////////////////////

// DANCER

function dancer(x, y, r, clk) {
    this.clk = clk;
    this.pos = [x, y, r];
    this.left = new foot();
    this.right = new foot();
    this.pointer = new pointer();
    this.seq = new sequence();
    //init
    this.clk.register(this, null);
}

dancer.prototype.clk_call = function (now, delta) {
    var pos = addpt(this.pos, this.seq.getpos(now, false));
    this.pointer.move(pos[0], pos[1], pos[2]);
    var pts = this.seq.getsteps(now - delta, now);
    for(var pt = 0; pt < pts.length; pt++)
        this.dostep(pts[pt]);
    return null;
}

dancer.prototype.dostep = function(inst) {
    var ft, ftx, ftt;
    ftt = inst.step.foot;
    if(inst.mirror)
        ftt = ftt == 'l' ? 'r' : 'l';
    if(ftt == 'l'){
        ft = this.left;
        ftx = DANCER_LEFT_XOFF;
    }else{
        ft = this.right;
        ftx = DANCER_RIGTH_XOFF;
    }
    var tme;
    if(inst.step.pos == null && inst.last == null){
        console.log("step positionless");
        return;
    }
    if(inst.step.pos == null)
        tme = inst.last.beat + inst.last.step.beat;
    else
        tme = inst.beat + inst.step.beat;
    var pos = addpt(this.pos, this.seq.getpos(tme));
    if(inst.step.pos == null)
        pos = addpt(pos, inst.last.step.pos, inst.last.mirror); //add step pos    
    else
        pos = addpt(pos, inst.step.pos, inst.mirror); //add step pos
    pos = addpt(pos, [ftx, 0, 0]);
    ft.step(pos[0], pos[1], pos[2], inst.step.typ);
    if(inst.loaded != null)
        console.log("step loaded: " + inst.step.typ + " " + inst.loaded.step.typ); 
}

/*dancer.prototype.getpos = function(now)
{
    var s, p;
    var cmov = null;
    var t2, p2;
    var p1 = null, t1 = null;
    for(s = 0; s < this.seq.length; s++){
        var sitm = this.seq[s];
        var intvl = sitm.seq.curve.interval();
        if(now - sitm.beat > intvl[1] && s + 1 < this.seq.length)
            continue;
        t2 = intvl[0] + sitm.beat;
        p2 = sitm.seq.curve.get(now - sitm.beat);
        if(sitm.mirror)
            p2[0] = -p2[0];
        if(now < t2 && s != 0){
            t1 = this.seq[s-1].seq.curve.interval()[1] + this.seq[s-1].beat;
            p1 = this.seq[s-1].seq.curve.get(now - this.seq[s-1].beat);
            if(t1 == t2){
                cmov = p2;
                break;
            }
            var rat = (now - t1) / (t2 - t1);
            var p1 = this.seq[s-1].seq.curve.points[this.seq[s-1].seq.curve.points.length-1];
            var x = (p2.x - p1.x) * rat;
            var y = (p2.y - p1.y) * rat;
            var r = (p2.r - p1.r) * rat;
            cmov = [x, y, r];
            break;
        }
        cmov = p2;
        break;
    }
    var pos = addpt(this.pos, this.curve.get(now));
    pos = addpt(pos, cmov);
    return pos;
}
    

dancer.prototype.addseq = function(x, y, r, begin, seq, mirror) {
    seqitem = {
        seq : seq,
        pos : [x, y, r],
        beat : begin,
        mirror : mirror
    };
    this.seq.push(seqitem);
}

dancer.prototype.dostep = function(sq, stp) {
    var st = this.seq[sq].seq.steps[stp];
    var mr = this.seq[sq].mirror;
    var ft, ftx, ftt;
    ftt = st.foot;
    if(mr)
        ftt = ftt == 'l' ? 'r' : 'l';
    if(ftt == 'l'){
        ft = this.left;
        ftx = DANCER_LEFT_XOFF;
    }else{
        ft = this.right;
        ftx = DANCER_RIGTH_XOFF;
    }
    var pos = addpt(this.pos, this.curve.get(st.beat + this.seq.beat)) //add dancer curve
    pos = addpt(pos, this.seq[sq].pos) //add sequence anchor
    pos = addpt(pos, this.seq[sq].seq.curve.get(st.beat), mr); //add seuence curve
    pos = addpt(pos, st.pos, mr); //add step pos
    pos = addpt(pos, [ftx, 0, 0]);
    ft.step(pos[0], pos[1], pos[2], st.typ);
}
*/

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
    this.lasttick = null;
}

clock.prototype.register = function(handler) {
    this.hands.push(handler);
}

clock.prototype.run = function(start, end, loop = false) {
    this.start = start;
    this.end = end;
    this.loop = loop;
    this.begin = new Date().getTime() - start * 1000 / this.speed;
    this.lasttick = 0;
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
    document.getElementById("now").innerHTML = unbeat(now, 8);
    for(i = 0; i < clock.hands.length; i++)
        hand = clock.hands[i].clk_call(now, now - clock.lasttick);
    if(now >= clock.end){
        if(clock.loop){
            clock.begin += (clock.end - clock.start) * 1000 / clock.speed;
            clock.lasttick -= clock.end - clock.start;
            console.log("clk wrap " + clock.begin);
            clock_call(clock);
        }else{
            console.log("clk stop");
            clearTimeout(clock.sched_tout);
        }
    }
    clock.lasttick = now;
}

//////////////////////////////////

// FUNCTIONS

function beat(full, count, parts, count1 = null, parts1 = null) {
    if(parts > 128 || parts > 128)
        throw "time precision is only 128 parts";
    var ret = full * 128 + (count - 1) * (128 / parts);
    if(count1 != null)
        ret += (count1 - 1) * (128 / parts1);
    return ret;
}

function unbeat(beat, parts) {
    var full = 0, count = 0;
    while(beat > 128){
        beat -= 128;
        full += 1;
    }
    count = Math.floor(beat / (128 / parts)) + 1;
    return full + " " + count + "/" + parts;
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
