let stage, canvas;
let w, h;
let loader;
let move_multiplier = 10;
let pointFramerate = 10;
let orkContainer
let orksOnScreen = 1
let spriteSheet
let harvesters = new Map()
let killedCounter = 0
let killedText
window.orks = {
    orksToSpawn: []
}
window.orkStats = {
    harm: 10,
    speed: 25
}


function init() {
    stage = new createjs.Stage("gameCanvas");
    w = stage.canvas.width;
    h = stage.canvas.height;

    canvas = stage.canvas


    let manifest = [
        {src: "point.png", id: "point"},
        {src: "ork.png", id: "ork"},
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
    // setInterval(() => {
    //     raid()
    // }, 10000)

    stage.addChild(background)

    orkContainer = new createjs.Container();


    stage.addChild(killedText)
    stage.addChild(orkContainer);

    spriteSheet = new createjs.SpriteSheet({
        framerate: pointFramerate,
        'images': [loader.getResult('ork')],
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


    //TODO FIX THIS
    let orksAlive = Object.keys(window.orks).map((orkKey) => {
        if (window.orks[orkKey].state === 'alive') {
            return window.orks[orkKey]
        }
    }).length
    let orksToSpawn = window.orks.orksToSpawn.length
    if (orksToSpawn + orksAlive > orksOnScreen) {
        window.orks.orksToSpawn.length = orksAlive + orksToSpawn - orksOnScreen
    }

    let count = window.orks.orksToSpawn.length

    for (let i = 0; i < count; i++) {
        let ork = window.orks.orksToSpawn.shift()
        window.orks[ork.id] = ork
        orkContainer.addChild(ork)
    }
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

    let orksAlive = Object.keys(window.orks).map((orkKey) => {
        if (window.orks[orkKey].state === 'alive') {
            return window.orks[orkKey]
        }
    })

    orksAlive.forEach(ork => {
        if (!ork) return

        let angle = Math.atan2(ork.y - toilet.y, ork.x - toilet.x) / Math.PI * 180

        let distance = Math.sqrt(Math.pow((toilet.x - ork.x), 2) + Math.pow((toilet.y - ork.y), 2))
        let rad = (+angle + 180) * Math.PI / 180

        let x = ork.x + (distance - 150) * Math.cos(rad)
        let y = ork.y + (distance - 150) * Math.sin(rad)

        createjs.Tween.get(ork, {override: true})
            .to({ rotation: angle })
            .to({ x: x, y: y }, distance / move_multiplier * (window.orkStats.speed - 30))

        setTimeout(() => {
            ork.kill()
        }, 4000)
    })
    setTimeout(() => {
        stage.removeChild(toilet)
    }, 4000)
}

function startHarvesters() {
    let blockHeight = 80

    for (let i = 0; i < 5; i++) {
        let harvester = new createjs.Bitmap(loader.getResult('harvester'))
        let blockNumber = i * 3 + 2
        harvester.regY = harvester.image.height / 2
        harvester.regX = harvester.image.width / 2
        harvester.name = 'harvester'

        harvester.y = blockHeight * blockNumber
        if (i % 2 === 0) {
            harvester.x = -160
            harvester.rotation = 180
        } else {
            harvester.x = w + 160
        }

        harvesters.set(`harvester${i + 1}`, harvester)
        stage.addChild(harvester)

    }
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
                    stage.children.filter((child) => child.name === 'harvester').forEach(harvester => {
                        stage.removeChild(harvester)
                    })
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

    let newOrk = new Ork(spriteSheet, 'idle' , {        route: {"start":[209,-73],"init":[[209,117,90],[124.148,201.852,135],[279.71,357.414,45],[279.71,487.414,90],[194.858,572.266,135]],"cycle":[[124.148,501.556,225],[300.923,324.781,315],[166.574,190.432,225],[237.284,119.722,315],[343.349,225.787,45],[583.349,225.787,0],[583.349,95.787,270],[383.349,95.787,180],[143.349,95.787,180],[143.349,295.787,90],[214.059,366.497,45],[214.059,606.497,90],[129.207,691.349,135],[256.485,818.627,45],[256.485,918.627,90],[386.485,918.627,0],[492.55,1024.692,45],[591.544,1123.686,45],[451.544,1123.686,180],[331.337,1003.479,225],[253.556,1081.26,135],[331.337,1159.041,45],[521.337,1159.041,0],[521.337,929.041,270],[365.775,773.479,225],[210.213,929.041,135],[365.775,1084.603,45],[485.775,1084.603,0],[485.775,834.603,270],[337.284,686.112,225],[337.284,496.112,270],[217.077,375.905,225],[111.012,481.97,135],[111.012,621.97,90],[194.858,572.266,359.407]]},
    })
    newOrk.move()
    orkContainer.addChild(newOrk)

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

