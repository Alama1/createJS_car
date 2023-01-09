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
        this.currentInitStep = 0;
        this.state = 'alive';
        this.id = 'ork' + (new Date().getTime() * Math.random()).toFixed(0);
        this.name = 'ork'
        this.x = options.route.start[0]
        this.y = options.route.start[1]

        this.move = function () {
            let orkSprite = createjs.Tween.get(this, {override: true})
            //move for init route first
            if (this.route.init.length !== this.currentInitStep + 1) {
                const [x, y, angle] = this.route.init[this.currentInitStep]
                ++this.currentInitStep
                orkSprite.to({rotation: angle + 180})
                    .to({
                        x: x,
                        y: y
                    }, (100 - this.speed) * (Math.sqrt(Math.pow((x - this.x), 2) + Math.pow((y - this.y), 2))) / 10)
                    .addEventListener('complete', () => {
                        this.move()
                    })
                return
            }

            //reload path when there is no points left
            if (this.currentStep === this.route.cycle.length) {
                this.currentStep = 0
                this.move()
                return
            }

            // if (this.currentStep === this.route.cycle.length - 1 || this.currentStep === 0) {
            //     const [x, y, angle] = this.route.cycle[this.currentStep]
            //     orkSprite.to({rotation: Math.atan2(this.y - y, this.x - x) / Math.PI * 180})
            //         .to({
            //             x: x,
            //             y: y
            //         },  (100 - this.speed) * (Math.sqrt(Math.pow((x - this.x), 2) + Math.pow((y - this.y), 2))) / 10)
            //         .addEventListener('complete', () => {
            //             this.move()
            //         })
            //     ++this.currentStep
            //     return
            // }


            const [x, y, angle] = this.route.cycle[this.currentStep]

            console.log('Current pos:')
            console.log(`X: ${this.x}`)
            console.log(`Y: ${this.y}`)
            console.log('Going to:')
            console.log(`X: ${x}`)
            console.log(`Y: ${y}`)
            console.log(`Angle: ${angle}`)
            console.log(`Calculated angle: ${(Math.atan2(this.y - y, this.x - x) / Math.PI * 180) + 180}`)
            console.log(`Current step: ${this.currentStep}`)
            console.log('--------------------------')
            orkSprite.to({rotation: angle + 180})
                .to({
                    x: x,
                    y: y
                }, (100 - this.speed) * (Math.sqrt(Math.pow((x - this.x), 2) + Math.pow((y - this.y), 2))) / 10)
                .addEventListener('complete', () => {
                    this.move()
                })
            ++this.currentStep
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

        return this
    }

    createjs.extend(Ork, createjs.Sprite);

    window.Ork = createjs.promote(Ork, "Sprite")
}());
