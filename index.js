let stage, canvas;
let w, h;
let loader;
let move_multiplier = 10;
let orkSpeed = 50;
let ork
let pointFramerate = 10;
let orkContainer
let orksOnScreen = 10
let spriteSheet


function init() {
    stage = new createjs.Stage("gameCanvas");
    w = stage.canvas.width;
    h = stage.canvas.height;

    canvas = stage.canvas

    let manifest = [
        {src: "point.png", id: "point"},
        {src: "toilet.png", id: "toilet"},
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

    background.addEventListener('click', spawnToilet)

    stage.addChild(background)


    orkContainer = new createjs.Container();
    stage.addChild(orkContainer);

    spriteSheet = new createjs.SpriteSheet({
        framerate: pointFramerate,
        'images': [loader.getResult('point')],
        'frames': {'regX': 72, 'height': 145, 'count': 20, 'regY': 72, 'width': 145 },
        'animations': {
            'idle': [0, 9, 'idle'],
            'click': [10, 19, 'click']
        }
    });

    generateOrk()
    createjs.Ticker.timingMode = createjs.Ticker.TIMEOUT
    createjs.Ticker.framerate = 60
    createjs.Ticker.addEventListener('tick', stage);
    createjs.Ticker.addEventListener("tick", tick);
}

function spawnToilet(event) {
    let x = event.stageX
    let y = event.stageY

    let toilet = new createjs.Bitmap(loader.getResult('toilet'))
    toilet.x = x
    toilet.y = y

    toilet.scale = 0.5
    toilet.regX = toilet.image.width / 2
    toilet.regY = toilet.image.height / 2
    stage.addChild(toilet)

    let orksAlive = orkContainer.children

    orksAlive.forEach(ork => {
        let angle = Math.atan2(ork.y - toilet.y, ork.x - toilet.x) / Math.PI * 180

        let distance = Math.sqrt(Math.pow((toilet.x - ork.x), 2) + Math.pow((toilet.y - ork.y), 2))
        let rad = (+angle + 180) * Math.PI / 180

        let x = ork.x + (distance - 150) * Math.cos(rad)
        let y = ork.y + (distance - 150) * Math.sin(rad)

        createjs.Tween.get(ork, {override: true})
            .to({ rotation: angle }, 200)
            .to({ x: x, y: y }, distance / move_multiplier * orkSpeed )

    })
}

function generateOrk() {
    let currentOrks = orkContainer.children.length

    for (currentOrks; currentOrks < orksOnScreen; currentOrks++) {
        let newOrk = new Ork(spriteSheet, 'idle' , {
            x: (w * Math.random()) + 100 > w ? w - 200 : (w * Math.random()) + 100,
            y: (h * Math.random()) + 100 > h ? h - 200 : (h * Math.random()) + 100,
            route: generateRandomRote(5) })
        newOrk.move()
        orkContainer.addChild(newOrk)
    }
}

function generateRandomRote(numberOfSteps) {
    let rote = []
    for (let i = 0; i < numberOfSteps; i++){
        rote.push(`${50 * Math.random()}*${360 * Math.random()}`)
    }
    return rote
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


function tick(event) {
    stage.update(event)
}


let vis = (function(){
    let stateKey,
        eventKey,
        keys = {
            hidden: "visibilitychange",
            webkitHidden: "webkitvisibilitychange",
            mozHidden: "mozvisibilitychange",
            msHidden: "msvisibilitychange"
        };
    for (stateKey in keys) {
        if (stateKey in document) {
            eventKey = keys[stateKey];
            break;
        }
    }
    return function(c) {
        if (c) document.addEventListener(eventKey, c);
        return !document[stateKey];
    }
})();

vis(function(){
    if(vis()){
        setTimeout(function(){
            console.info('UNPAUSE called')
            createjs.Ticker.paused = false
        },300);
    } else {
        console.info('pause called')
        createjs.Ticker.paused = true
    }
});

