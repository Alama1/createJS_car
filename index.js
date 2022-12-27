let stage, canvas;
let w, h;
let loader;
let move_multiplier = 10;
let carSpeed = 50;


function init() {
    stage = new createjs.Stage("gameCanvas");
    w = stage.canvas.width;
    h = stage.canvas.height;

    canvas = stage.canvas

    let manifest = [
        {src: "background.png", id: "background"},
        {src: "car.png", id: "car1"},
        {src: "car1.png", id: "car2"},
        {src: "car2.png", id: "car3"},
        {src: "car3.png", id: "car4"},
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

    let cars = new Map()

    for (let i = 1; i <= 4; i++) {
        let car = new createjs.Bitmap(loader.getResult(`car${i}`))
        console.log(car)
        car.x = 360
        car.y = 640
        car.regX = car.image.width / 2
        car.regY = car.image.height / 2
        car.scale = 0.2
        cars.set(`car${i}`, car)

        stage.addChild(car)
    }

    moveCar(['20*41', '10*162', '15*89', '20*20', '10*90'], cars.get('car1'))
    moveCar(['20*26', '10*41', '15*210', '20*20', '10*90'], cars.get('car2'))
    moveCar(['20*310', '10*61', '15*86', '20*20', '10*90'], cars.get('car3'))
    moveCar(['20*90', '10*267', '15*185', '20*20', '10*90'], cars.get('car4'))

    createjs.Ticker.timingMode = createjs.Ticker.RAF
    createjs.Ticker.addEventListener("tick", tick);
}

function moveCar(array, car) {

    console.log(car)
    let [distance, angle] = array.shift().split('*')
    let rad = +angle * Math.PI / 180

    console.log()

    let x = car.x + distance * move_multiplier * Math.cos(rad)
    let y = car.y + distance * move_multiplier * Math.sin(rad)

    let beep = createjs.Tween.get(car, {override: true})
    beep.to({ rotation: +angle + 180 }, 500)
    .to( { x: x, y: y }, 10000 )
    .addEventListener('complete', () => {
        if (array.length > 0) moveCar(array, car)
    })

    setTimeout(() => {
        beep.timeScale = 4
    }, 2000)

}

function tick(event) {
    stage.update(event)
}
