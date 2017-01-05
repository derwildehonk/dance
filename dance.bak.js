// dictionary
// dig - heel edge; no weight
// spank - swing back; ball tap

FOOTPRINT_REUSE = 1100;
DANCER_LEFT_XOFF = -40;
DANCER_RIGTH_XOFF = 40;
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

footimgs = {}
footimgs['step'] = "img/step.png";
footimgs['ball'] = "img/ball.png";
footimgs['edge'] = "img/edge.png"; 
footimgs['heel'] = "img/step.png"; 
footimgs['shuf'] = "img/shuf.png"; 
footimgs['tip'] = "img/tip.png"; 
footimgs['stomp'] = "img/stomp.png";
footimgs['dig'] = "img/edge.png";
footimgs['touch'] = "img/shuf.png"; 

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

// SHADOW

function shadow () {
    this.img = new Image();
    this.img.classList = "shadow";
    this.img.src = "img/shadow.png";
    document.body.appendChild(this.img);
}

shadow.prototype.move = function(x, y, rot) {
    this.img.style.left = x - FOOTPRINT_WIDTH / 2;
    this.img.style.top = -y - FOOTPRINT_HEIGHT / 2;
    this.img.style.transform = "rotate(" + rot + "deg)";
}

//////////////////////////////////

// POINTER

function pointer () {
    this.img = new Image();
    this.img.classList = "pointer";
    this.img.src = "img/pointer.png";
    document.body.appendChild(this.img);
}

pointer.prototype.move = function(x, y, rot) {
    this.img.style.left = x - POINTER_WIDTH / 2;
    this.img.style.top = -y - POINTER_WIDTH / 2;
    this.img.style.transform = "rotate(" + rot + "deg)";
} 

//////////////////////////////////

// FOOT

function foot() {
    this.prints = [];
    this.last = null;
    this.shadow = shadow();
}

foot.prototype.move = function(x, y, rot) {
    this.shadow.move(x, y, rot)
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

// helper

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

//add two points with the possibility of mirroring the second
// a point is: x, y, rot

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

// get the position ibezier curve represented by a list of points
function curvepos(pts, tme)
{
    var pos;
    //curve
    var npoints = pts.length;
    if(npoints == 1) //only one point - take this one
        pos = pts[0].pos;
    else if(npoints >= 2){
        var n;
        for(n = 0; n < npoints; n++){
            if(now < pts[n].beat)
                break;
        }
        if(n == 0){ //smaller than first point - take this one
            tme = pts[0].beat;
            n = 1; 
        }else if(n >= npoints){ //bigger than last point - take this one
            tme = pts[npoints-1].beat;
            n = npoints - 1;
        }
        pos = bezier(tme, this.curve[n-1], this.curve[n]);
    }else
        pos = [0, 0, 0];
    return pos;
}

//////////////////////////////////

// SEQUENCE

// sequence of steps
// there are
// * steps - that are composed from: beat, pos, foot (r/l), typ, weight
//   * types: ball, heel, step, fly
//   * weight is one of: set, add, rel(ese), unset, none
// * curve - bezier curve on witch the steps are aliged - composed from:
//           beat, x, y, rot, sx, sy
// * subs  - sub sequences compsed from: seq, pos, beat, mirror
// the returned items from the getter are composed:
// step, toff, poff, mirror(t/f)

function sequence() {
    this.steps = [];
    this.curve = [];
    this.subs = [];
}

sequence.prototype.addstep = function(beat, pos, foot, typ, weight){
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

function sequence_iterator(seq)
{
    this.seq = seq;
    this.pos = seq.steps.length;
    if(this.pos >= this.steps.length)
        this.pos = null;
    this.sub = seq.subs.length;
    if(this.sub >= this.seq.subs.length)
        this.pos = null;
    this.sub_iter = null;
    this.sub_off = null;
}

sequence_iterator.prototype.next()
{
    if(this.sub_iter != null){
        var itm = this.sub_iter.next();
        if(itm != null){
            itm.poff = addpt(itm.poff, this.sub_off.pos);
            itm.toff += this.sub_off.beat;
            itm.mirror ^= this.sub_off.mirror;
            return itm;
        }else
            this.sub_iter = null;
    }
    var pbeat = this.pos != null ? this.seq.steps[this.pos].beat : null;
    var sbeat = this.sub != null ? this.seq.subs[this.sub].beat : null;
    if(pbeat != null && (sbeat == null || pbeat < sbeat)){
        ret =  {step : this.seq.steps[this.pos],
                toff : this.seq.beat,
                poff : this.seq.pos,
                mirror : false};
        this.pos += 1;
        if(this.pos >= this.steps.length)
            this.pos = null;
    }
    if(sbeat != null && (pbeat == null || sbeat < pbeat)){
        var sub = this.seq.subs[this.sub];
        this.sub_iter = sequence_iterator(this.seq.subs[this.sub]);
        this.sub_off = {pos : sub.pos, beat : sub.beat, mirror : sub.mirror}
        this.sub += 1;
        if(this.sub >= this.seq.subs.length)
            this.pos = null;
    }
    return null;
}


//get the steps that lie between t1 and t2 and the points just before
//and after. the first and last element will always exist, they may be
//null however.

sequence.prototype.getsteps = function(t1, t2, side){
    var lo = null;
    var hi = null;
    var ret = new Array();
    for(var i = 0; i < this.steps.length; i++){
        if(this.steps[i].foot != side)
            continue;
        if(t1 <= this.steps[i].beat && t2 > this.steps[i].beat){
            pos = curvepos(self.curve, this.steps[i].beat);
            var o = {step : this.steps[i], troot : 0, proot = pos, mirror : false};  
            ret.push(o);
        }
        if(t1 > this.steps[i].beat)
            lo = {step : this.steps[i], troot : 0, proot = [0,0,0], mirror : false};
        if(hi == 0 && t2 < this.steps[i].beat)
            hi = {step : this.steps[i], troot : 0, proot = [0,0,0], mirror : false};
    }
    for(var i = 0; i < this.subs.length; i++){
        var toff = this.subs[i].beat;
        var poff = addpt(this.subs[i].pos, curvepos(self.curve, this.subs[i].pos));
        var pts = this.subs[i].seq.getsteps(t1 - toff, t2 - toff);
        var p = pts.shift();
        if(p != 0)
            lo = nlo;
        p = pts.pop();
        if(p != null){
            if(hi == 0)
                hi = p;
            else if(hi.beat > p.beat)
                hi = p;
        }
        for(var n = 0; n < pts.length; n++){
            var p = {
                step : pts[step],
                troot : pts[step] + toff,
                proot : addpt(pts[n], poff, mirr),
                mirror : pts[n].mirror ^ mirr
            };
            ret.push(p);
        }
    }
    ret.unshift(lo);
    ret.push(hi);
    return ret;
}

/*sequence.prototype.getpos = function(now, mir){
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

sequence.prototype.getsteps = function(t1, t2, troot = 0, mirror = false){
    var ret = new Array();
    for(var i = 0; i < this.steps.length; i++){
        if(t1 <= this.steps[i].beat && t2 > this.steps[i].beat){
            var o = {step : this.steps[i], beat : troot, mirror : mirror};  
            ret.push(o);
        }
    }
    for(var i = 0; i < this.subs.length; i++){
        var off = this.subs[i].beat;
        var pts = this.subs[i].seq.getsteps(t1 - off, t2 - off, troot + off, false);
        ret.push.apply(ret, pts); 
    }
    return ret;
}

sequence.prototype.getframe = function(now, troot = 0, croot = null, mirror = false){
    var last = null;
    var curvpos = this.curve.get(now - troot);
    for(var i = 0; i < this.steps.length; i++){
        if(now < this.steps[i].beat){
            return {'lo' : last, 'hi' : this.steps[i]}
        }
        last = this.steps[i];
    }
    for(var i = 0; i < this.subs.length; i++){
        var off = this.subs[i].beat;
        var rsub = this.subs[i].seq.getframe(now - off, troot + off, false);
        if(rsub != null){
            if(rsub['lo'] == null)
                rsub['lo'] = last;
            if(rsub['hi'] == null)
                last = rsub['lo'];
            else
                return rsub
        }
    }
    return {'lo' : last, 'hi' : null};
}

sequence.prototype.getshove = function(now){
    fram = this.getframe(now);
    pos = this.getpos(now);
    if(fram['lo'] == null)
        step = fram['hi'];
    else if(fram['hi'] == null)
        step = fram['lo']
    else{

    }
    
}*/

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

dancer.prototype.clk_call = function (now) {
    var pos = addpt(this.pos, this.seq.getpos(now));
    this.pointer.move(pos[0], pos[1], pos[2]);
    //right
    var pts = this.seq.getsteps(this.lasttick, now, 'r');
    var stps = pts.slice(1, pts.length-1);
    for(var pt = 0; pt < stps.length; pt++)
        this.dostep(stps[pt].step, stps[pt].beat, stps[pt].mirror);
    var shdwpos = step_interpolate(pts[pts.length-1], pts[pts.length-2], now);
    this.right.move(shdowpos[0], shdowpos[1], shdowpos[2]);    
    //left
    pts = this.seq.getsteps(this.lasttick, now, 'l');
    stps = pts.slice(1, pts.length-1);
    for(var pt = 0; pt < stps.length; pt++)
        this.dostep(stps[pt].step, stps[pt].beat, stps[pt].mirror);
    shdwpos = step_interpolate(pts[pts.length-1], pts[pts.length-2], now);
    this.left.move(shdowpos[0], shdowpos[1], shdowpos[2]);    
    //
    this.lasttick = now;
    return null;
}

dancer.prototype.dostep = function(step, beat, mirror) {
    var ft, ftx, ftt;
    ftt = step.foot;
    if(mirror)
        ftt = ftt == 'l' ? 'r' : 'l';
    if(ftt == 'l'){
        ft = this.left;
        ftx = DANCER_LEFT_XOFF;
    }else{
        ft = this.right;
        ftx = DANCER_RIGTH_XOFF;
    }
    var pos = addpt(this.pos, this.seq.getpos(beat + step.beat));
    pos = addpt(pos, step.pos, mirror); //add step pos
    pos = addpt(pos, [ftx, 0, 0]);
    ft.step(pos[0], pos[1], pos[2], step.typ);
}

//item: step troot proot mirror
//step: beat, pos, foot, typ
function step_interpolate(st1, st2, now)
{
    if(st1 == null)
        return addpt(st2.step.pos, st2.proot);
    if(st2 == null)
        return addpt(st1.step.pos, st1.proot);
    var r = (now - (st1.step.beat + st1.troot)) / ((st2.step.beat + st2.troot) - (st1.step.beat + st2.troot));
    var p1 = addpt(st1.step.pos, st1.proot);
    var p2 = addpt(st2.step.pos, st2.proot);
    var ret = [
        p1[0] + (p2[0] - p1[0]) * r,
        p1[1] + (p2[1] - p1[1]) * r,
        p1[2] + (p2[2] - p1[2]) * r,
    ];
    return ret;
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
        hand = clock.hands[i].clk_call(now, this.lasttick - now);
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
