let stage, canvas;
let w, h;
let loader;
let move_multiplier = 10;
let pointFramerate = 10;
let orkContainer
let orksOnScreen = 10
let spriteSheet
let harvesters = new Map()
let killedCounter = 0
let killedText
window.orks = {
    orksToSpawn: []
}
window.orkStats = {
    harm: 10,
    speed: 50
}


function init() {
    stage = new createjs.Stage("gameCanvas");
    w = stage.canvas.width;
    h = stage.canvas.height;

    canvas = stage.canvas


    let manifest = [
        {src: "point.png", id: "point"},
        {src: "toilet.png", id: "toilet"},
        {src: "harvester.png", id: "harvester"},
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

    background.addEventListener('click', startHarvesters)

    killedText = new createjs.Text(`Killed: ${killedCounter}`, "32px Arial", "#343434")
    let killedTextBounds = killedText.getBounds()
    killedText.x = w - killedTextBounds.width - 50
    killedText.y = killedTextBounds.height / 2
    setInterval(() => {
        raid()
    }, 10000)

    stage.addChild(background)

    orkContainer = new createjs.Container();


    stage.addChild(killedText)
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

    for (let i = 0; i < orksOnScreen; i++) {
        window.generateOrk()
    }

    createjs.Ticker.timingMode = createjs.Ticker.TIMEOUT
    createjs.Ticker.framerate = 27
    createjs.Ticker.addEventListener('tick', stage);
    createjs.Ticker.addEventListener('tick', tick);
}

function raid() {
    let text = new createjs.Text("RAID INCOMING", "86px Arial", "#343434")
    text.x = w / 2;
    text.y = h / 8;
    let b = text.getBounds();
    text.regX = b.width / 2
    text.regY = b.height / 2
    text.textBaseline = "alphabetic";
    createjs.Tween.get(text)
        .to( { scale: 0.7 }, 600 )
        .to( { scale: 1 }, 600 )
    stage.addChild(text)
    setTimeout(() => { stage.removeChild(text) }, 5000)

    let count = window.orks.orksToSpawn.length
    for (let i = 0; i < count; i++) {
        let ork = window.orks.orksToSpawn.shift()
        window.orks[ork.id] = ork
        orkContainer.addChild(ork)
    }
}

function spawnToilet(event) {

    console.log(window.orks)
    let x = event.stageX
    let y = event.stageY

    let toilet = new createjs.Bitmap(loader.getResult('toilet'))
    toilet.x = x
    toilet.y = y

    toilet.scale = 0.5
    toilet.regX = toilet.image.width / 2
    toilet.regY = toilet.image.height / 2
    stage.addChild(toilet)

    //TODO rework for window.orks
    return

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

function startHarvesters() {
    let blockHeight = 80
    let harvester = new createjs.Bitmap(loader.getResult('harvester'))
    harvester.regY = harvester.image.height / 2
    harvester.regX = harvester.image.width / 2
    harvester.y = blockHeight * 2
    harvester.x = -160
    harvester.rotation = 180
    harvesters.set('harvester1', harvester)
    let harvester2 = new createjs.Bitmap(loader.getResult('harvester'))
    harvester2.regY = harvester.image.height / 2
    harvester2.regX = harvester.image.width / 2
    harvester2.y = blockHeight * 5
    harvester2.x = w + 160
    harvesters.set('harvester2', harvester2)
    let harvester3 = new createjs.Bitmap(loader.getResult('harvester'))
    harvester3.regY = harvester.image.height / 2
    harvester3.regX = harvester.image.width / 2
    harvester3.y = blockHeight * 8
    harvester3.x = -160
    harvester3.rotation = 180
    harvesters.set('harvester3', harvester3)
    let harvester4 = new createjs.Bitmap(loader.getResult('harvester'))
    harvester4.regY = harvester.image.height / 2
    harvester4.regX = harvester.image.width / 2
    harvester4.y = blockHeight * 11
    harvester4.x = w + 160
    harvesters.set('harvester4', harvester4)
    let harvester5 = new createjs.Bitmap(loader.getResult('harvester'))
    harvester5.regY = harvester.image.height / 2
    harvester5.regX = harvester.image.width / 2
    harvester5.y = blockHeight * 14
    harvester5.x = -160
    harvester5.rotation = 180
    harvesters.set('harvester5', harvester5)

    stage.addChild(harvester)
    stage.addChild(harvester2)
    stage.addChild(harvester3)
    stage.addChild(harvester4)
    stage.addChild(harvester5)

    let collisionListener = setInterval(handleHarvesterCollision, 100)
    for (let i = 0; i < 5; i++) {
        let harvesterInMap = createjs.Tween.get(harvesters.get(`harvester${i + 1}`))

        harvesterInMap
            .to( { x: i % 2 === 0 ? w + 160 : -160 }, 2000 )
        if (i === 4) {
            harvesterInMap
                .to( { x: i % 2 === 0 ? w + 160 : -160 }, 2000 )
                .addEventListener('complete', () => {
                    clearInterval(collisionListener)
                    stage.removeChild(harvesterInMap)
                    harvesters = new Map()
                    console.log('clearing')

                    stage.removeChild(harvester)
                    stage.removeChild(harvester2)
                    stage.removeChild(harvester3)
                    stage.removeChild(harvester4)
                    stage.removeChild(harvester5)
                })
        }
    }

}

function handleHarvesterCollision() {

    harvesters.forEach(harvester => {
        let leftX = harvester.x - harvester.regX + 5
        let leftY = harvester.y - harvester.regY + 5
        let points = [
            new createjs.Point(leftX, leftY),
            new createjs.Point(leftX + harvester.image.width - 10, leftY),
            new createjs.Point(leftX, leftY + harvester.image.height - 10),
            new createjs.Point(leftX + harvester.image.height - 10, leftY + harvester.image.height - 10),
        ]

        for (let i = 0; i < points.length; i++) {
            let objects = stage.getObjectsUnderPoint(points[i].x, points[i].y)
            if (objects.filter((object) => object.name === 'ork' && object.state === 'alive').length > 0) {
                let ork = objects.filter((object) => object.name === 'ork')[0]
                ork.kill()
                window.generateOrk()
            }
        }
    })
}

window.generateOrk = function generateOrk() {
    let orks = Object.keys(window.orks).filter((orkKey) =>
        window.orks[orkKey].state !== 'alive'
    )
    killedText.text = `Killed: ${orks.length - 1}`

    let newOrk = new Ork(spriteSheet, 'idle' , {
        x: (w * Math.random()) + 100 > w ? w - 200 : (w * Math.random()) + 100,
        y: (h * Math.random()) + 100 > h ? h - 200 : (h * Math.random()) + 100,
        route: generateRandomRote(5) })
    newOrk.move()
    window.orks.orksToSpawn.push(newOrk)

}

function generateRandomRote(numberOfSteps) {
    let rote = []
    for (let i = 0; i < numberOfSteps; i++){
        rote.push(`${50 * Math.random()}*${360 * Math.random()}`)
    }
    return rote
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

