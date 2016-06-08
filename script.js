var d1;
var x;
var clk;
var p1, p2, p3;

function init(){
    clk = new clock();
    clk.speed = 64;
    
    d1 = new dancer(100, -400, 0, clk);
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
        new movept(beat(0, 0, 4), 0, 0, 250, 400),
        new movept(beat(2, 0, 4), 500, 0, null, null)
    );
    clk.run(0, beat(2, 0, 4));
    
    
    /*x = 0.0;
    p1 = new movept(0, 0, 0, 250, 300);
    p2 = new movept(100, 500, 0, 250, -300);
    p3 = new movept(200, 0, 0, null, null);
    setInterval(loop, 100);*/
}

function loop()
{
    var mov;
    if(x < 100)
        mov = bezier(x, p1, p2);
    else
        mov = bezier(x, p2, p3);
    var arr = document.getElementById("pointer");
    arr.style.left = mov[0];
    arr.style.top = 500 - mov[1];
    arr.style.transform = "rotate(" + mov[2] + "deg)";
    
    x += 1;
    while(x > 200)
        x -= 200;
}
