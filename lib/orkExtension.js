(function () {
    function Ork(sheet, state, options) {

        this.Sprite_constructor(sheet, state);
        let defaults = {
            x: 0,
            y: 0,
            w: 145,
            h: 145,
            a: 0,
            reg: {x: 78, y: 78},
            image: false,
            speed: window.orkStats.speed,
            harm: window.orkStats.harm,
            route: [],
            skin: 'default'
        };
        options = Object.assign(defaults, options);
        this.speed = options.speed;
        this.harm = options.harm;
        this.route = options.route;
        this.skin = options.skin;
        this.currentStep = 0;
        this.state = 'alive';
        this.id = 'ork' + (new Date().getTime() * Math.random()).toFixed(0);
        this.name = 'ork'

        this.move = function () {
            let orkSprite = createjs.Tween.get(this, {override: true})

            //Back to first step point
            if (this.currentStep === this.route.length) {
                this.currentStep = 0
                let angle = Math.atan2(this.y - options.y, this.x - options.x) / Math.PI * 180
                orkSprite.to({rotation: angle})
                    .to({
                        x: options.x,
                        y: options.y
                    }, (100 - this.speed) * (Math.sqrt(Math.pow((options.x - this.x), 2) + Math.pow((options.y - this.y), 2))) / 10)
                    .addEventListener('complete', () => {
                        this.move()
                    })
                return
            }

            let [distance, angle] = this.route[this.currentStep].split('*');
            let rad = +angle * Math.PI / 180
            let x = this.x + distance * move_multiplier * Math.cos(rad)
            let y = this.y + distance * move_multiplier * Math.sin(rad)

            orkSprite.to({rotation: +angle + 180})
                .to({x: x, y: y}, (100 - this.speed) * distance)
                .addEventListener('complete', () => {
                    this.currentStep++;
                    this.move();
                })
        }

        this.getX = function () {
            return this.x
        }

        this.getY = function () {
            return this.y
        }

        this.setX = function (x) {
            this.x = x
        }

        this.setY = function (y) {
            this.y = y
        }

        this.isAlive = function () {
            return this.state === 'alive'
        }

        this.kill = function () {
            this.state = 'dying'
            window.generateOrk()
            this.gotoAndPlay('click')
            createjs.Tween.get(this, {override: true})
                .to({x: this.x, y: this.y})
            setTimeout(() => {
                this.state = 'dead'
                orkContainer.removeChild(this)
            }, 1000)
        }

        this.changeSpeed = function (modifier = 1) {
            createjs.Tween.get(this, {override: true})
                .timeScale = modifier
        }

        this.addEventListener("click", function (event) {
            let it = event.target;
            if (!it.isAlive()) return
            it.kill()
        });

        this.cursor = 'pointer';
        this.x = options.x;
        this.y = options.y;

        return this
    }

    createjs.extend(Ork, createjs.Sprite);

    window.Ork = createjs.promote(Ork, "Sprite")
}());
