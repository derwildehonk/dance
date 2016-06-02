var d1;
var x = 0;

function init(){
    clk = new clock();
    
    d1 = new dancer(100, -300, clk);
    d1.steps.push(
        new step(beat(0, 0, 4), 'l', 0, 10, 0, 'step'),
        new step(beat(0, 1, 4), 'r', 0, 20, 0, 'step'),
        new step(beat(0, 2, 4), 'l', 0, 30, 0, 'step'),
        new step(beat(0, 3, 4), 'r', 0, 40, 0, 'step'),
        new step(beat(1, 0, 4), 'l', 0, 50, 0, 'step'),
        new step(beat(1, 1, 4), 'r', 0, 60, 0, 'step'),
        new step(beat(1, 2, 4), 'l', 0, 70, 0, 'step'),
        new step(beat(1, 3, 4), 'r', 0, 80, 0, 'step')
    );
    setTimeout(loop, 5000);
}

function loop() {
    d1.dostep(x % 8);
    x += 1;
    setTimeout(loop, 1000);
}
