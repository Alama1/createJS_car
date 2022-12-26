let stage, canvas;
let w, h;
let loader;
let move_multiplier = 10;
let character, car;


function init() {
    stage = new createjs.Stage("gameCanvas");
    w = stage.canvas.width;
    h = stage.canvas.height;

    canvas = stage.canvas

    let manifest = [
        {src: "background.png", id: "background"},
        {src: "character_sprite.png", id: "character"},
        {src: "car.png", id: "car"},
    ];

    createjs.Touch.enable(stage);
    stage.enableMouseOver(10);
    loader = new createjs.LoadQueue(true);
    loader.loadManifest(manifest, true, "./assets/");
    loader.addEventListener("complete", handleComplete);
}

function handleComplete(event) {
    let background = new createjs.Shape();

    background.graphics.beginBitmapFill(loader.getResult('background')).drawRect(0, 0, w, h)
    background.x = 0
    background.y = 0
    stage.addChild(background)

    let spriteSheet = new createjs.SpriteSheet({
        framerate: 4,
        "images": [loader.getResult("character")],
        "frames": {"regX": 0, "height": 600, "count": 16, "regY": 0, "width": 400, "margin": 30},
        "animations": {
            "idle_down": [0],
            "idle_up": [5],
            "idle_left": [9],
            "idle_right": [13],
            "move_down": [1, 3, 'idle_down'],
            "move_up": [6, 8, 'idle_up'],
            "move_left": [10, 12, 'idle_left'],
            "move_right": [14, 16, 'idle_right'],
        }
    });

    car = new createjs.Bitmap(loader.getResult('car'))
    car.x = 360
    car.y = 640
    car.regX = car.image.width / 2
    car.regY = car.image.height / 2
    car.scale = 0.2

    character = new createjs.Sprite(spriteSheet, 'idle_down')
    character.scale = 0.2

    stage.addChild(car)

    moveCar(['20*100', '10*10', '15*140', '20*20', '10*90'])

    createjs.Ticker.timingMode = createjs.Ticker.RAF
    createjs.Ticker.addEventListener("tick", tick);
}

function moveCar(array) {
    let [distance, angle] = array.shift().split('*')
    let rad = +angle * Math.PI / 180

    let x = car.x + distance * move_multiplier * Math.cos(rad)
    let y = car.y + distance * move_multiplier * Math.sin(rad)

    createjs.Tween.get(car)
        .to({ rotation: +angle + 180 }, 500)
        .to( { x: x, y: y }, 1000 )
        .addEventListener('complete', () => {
            if (array.length > 0) moveCar(array)
        })
}

function tick(event) {
    stage.update(event)
}
