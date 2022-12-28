let stage, canvas;
let w, h;
let loader;
let move_multiplier = 10;
let carSpeed = 50;
let ork
let pointFramerate = 10;
let orkContainer
let orksOnScreen = 10


function init() {
    stage = new createjs.Stage("gameCanvas");
    w = stage.canvas.width;
    h = stage.canvas.height;

    canvas = stage.canvas

    orkContainer = new createjs.Container

    stage.addChild(orkContainer)

    let manifest = [
        {src: "point.png", id: "point"},
    ];

    createjs.Touch.enable(stage);
    stage.enableMouseOver(10);
    loader = new createjs.LoadQueue(true);
    loader.loadManifest(manifest, true, "./assets/");
    loader.addEventListener("complete", handleComplete);
}

function handleComplete(event) {
    let background = new createjs.Shape();

    background.graphics.beginLinearGradientFill(["#000","#FFF"], [0, 1], 0, h, 0, 120).drawRect(0, 0, w, h)
    background.x = 0
    background.y = 0
    stage.addChild(background)

    let spriteSheet = new createjs.SpriteSheet({
        framerate: pointFramerate,
        'images': [loader.getResult('point')],
        'frames': {'regX': 72, 'height': 145, 'count': 20, 'regY': 72, 'width': 145 },
        'animations': {
            'idle': [0, 9, 'idle'],
            'click': [10, 19, 'click']
        }
    });

    ork = new Ork(spriteSheet, 'idle', { x: 100, y: 100, route: ['20*80', '10*50', '20*140']})


    generateOrk()

    createjs.Ticker.timingMode = createjs.Ticker.RAF
    createjs.Ticker.framerate = 10
    createjs.Ticker.addEventListener("tick", tick);
}

function generateOrk(x, y, route) {
    let newOrk = ork.clone()
    newOrk.x = 200
    newOrk.y = 300
    stage.addChild(newOrk)
    newOrk.move()
}

function handleClick (event) {
    let point = event.target
    point.gotoAndPlay('click')
    setTimeout(() => {
        stage.removeChild(point)
    }, 1000)

    createjs.Tween.get(point, { override: true })
        .to( { x: point.x, y: point.y })
}

function moveSprite(array, point) {
    let [distance, angle] = array.shift().split('*')
    let rad = +angle * Math.PI / 180


    let x = point.x + distance * move_multiplier * Math.cos(rad)
    let y = point.y + distance * move_multiplier * Math.sin(rad)

    let beep = createjs.Tween.get(point, {override: true})
    beep.to({ rotation: +angle + 180 }, 500)
    .to( { x: x, y: y }, 10000 )
    .addEventListener('complete', () => {
        if (array.length > 0) moveSprite(array, point)
    })

    setTimeout(() => {
        beep.timeScale = 4
    }, 2000)

}

function tick(event) {
    let newFramerate = document.getElementById('framerate').value || pointFramerate
    ork.framerate = +newFramerate
    stage.update(event)
}
