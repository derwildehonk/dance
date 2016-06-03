var d1;
var x = 0;

function init(){
    clk = new clock();
    
    d1 = new dancer(100, -300, clk);
    d1.steps.push(
        new step(beat(0, 0, 4), 'l', 0, 0, 0, 'step'),
        new step(beat(0, 1, 4), 'r', 0, 0, 45, 'step'),
        new step(beat(0, 2, 4), 'l', 0, 0, 90, 'step'),
        new step(beat(0, 3, 4), 'r', 0, 0, 135, 'step'),
        new step(beat(1, 0, 4), 'l', 0, 0, 180, 'step'),
        new step(beat(1, 1, 4), 'r', 0, 0, 215, 'step'),
        new step(beat(1, 2, 4), 'l', 0, 0, 270, 'step'),
        new step(beat(1, 3, 4), 'r', 0, 0, 315, 'step')
    );
    setTimeout(loop, 5000);
}

function loop() {
    d1.dostep(x % 8);
    x += 1;
    setTimeout(loop, 1000);
}
