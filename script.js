var d1;
var x = 0;
var clk;

function init(){
    clk = new clock();
    clk.speed = 64;
    
    d1 = new dancer(100, -400, clk);
    d1.steps.push(
        new step(beat(0, 0, 4), 'l', 0, 0, 0, 'step'),
        new step(beat(0, 1, 4), 'r', 0, 0, 0, 'step'),
        new step(beat(0, 2, 4), 'l', 0, 0, 0, 'step'),
        new step(beat(0, 3, 4), 'r', 0, 0, 0, 'step'),
        new step(beat(1, 0, 4), 'l', 0, 0, 0, 'step'),
        new step(beat(1, 1, 4), 'r', 0, 0, 0, 'step'),
        new step(beat(1, 2, 4), 'l', 0, 0, 0, 'step'),
        new step(beat(1, 3, 4), 'r', 0, 0, 0, 'step')
    );
    d1.move.push(
        new movept(beat(0, 0, 4), 0, 0, null, null),
        new movept(beat(2, 0, 4), 300, 300, null, null)
    );
    clk.run(0, beat(2, 0, 4));
    
    
    /*var p1 = new movept(0, 0, 0, null, null);
    var p2 = new movept(100, 300, 300, null, null);
    for(var t = 0; t < 100; t += 1){
        var mov = bezier(t, p1, p2);
        console.log("bz" + mov);
    }*/
}

