var d1;
var x;
var clk;
var p1, p2, p3;

function init(){
    clk = new clock();
    clk.speed = 32;
    
    /*d1 = new dancer(400, -400, 0, clk);
    d1.steps.push(
        new step(beat(0,  1,  8), 'r',  0, 30,  0, 'shuf'),
        new step(beat(0,  2,  8), 'r',  0, 40,  0, 'ball'),
        new step(beat(0,  3,  8), 'l',  0, 20,  0, 'step'),
        new step(beat(0,  4,  8), 'r',  0, 40,  0, 'stomp'), //stomp
        new step(beat(0,  5,  8), 'l',  0,  0,  0, 'step'),
        new step(beat(0,  6,  8), 'r', 60, 15, 70, 'shuf'),
        new step(beat(0,  7,  8), 'r', 60,  0, 70, 'shuf'),
        new step(beat(0,  8,  8), 'r',  0,  0,  0, 'step'),
        new step(beat(1,  1,  8), 'l',  0, 30,  0, 'shuf'),
        new step(beat(1,  2,  8), 'l',  0, 40,  0, 'ball'),
        new step(beat(1,  3,  8), 'r',  0, 20,  0, 'step'),
        new step(beat(1,  4,  8), 'l',  0, 40,  0, 'stomp'), //stomp
        new step(beat(1,  5,  8), 'r',  0,  0,  0, 'step'),
        new step(beat(1,  6,  8), 'l',-60, 15,-70, 'shuf'),
        new step(beat(1,  7,  8), 'l',-60,  0,-70, 'shuf'),
        new step(beat(1,  8,  8), 'l',  0,  0,  0, 'step')
    );*/
    /*d1.move.push(
        new movept(beat(0, 0, 4), 0, 0, 250, 400),
        new movept(beat(2, 0, 4), 500, 0, null, null)
    );*/

    var data;
    document.getElementById("loader").onchange = function(){
        data = loadfile(this.files[0], loader);
    }

    //clk.run(0, beat(2, 1, 4));
    

    /*x = 0.0;
    p1 = new movept(0, 0, 0, 250, 300);
    p2 = new movept(100, 500, 0, 250, -300);
    p3 = new movept(200, 0, 0, null, null);*/
    setInterval(loop, 8000);
}

function loop()
{
    clk.run(0, beat(2, 1, 4));
}

function loader(data)
{
    console.log("data loaded");
    parsejson(data);
}
