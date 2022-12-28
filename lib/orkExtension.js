(function () {
    function Ork(sheet, state, options) {
        this.Sprite_constructor(sheet, state);
        let defaults = {
            x: 0, /** x position */
            y: 0, /** y position */
            w: 145,
            h: 145,
            a: 0,
            reg: {x: 78, y: 78}, /** @note register point */
            image: false,
            speed: 50,
            harm: 10,
            route: [],
            skin: 'default'
        };
        options = Object.assign(defaults, options);
        this.speed = options.speed;
        this.harm = options.harm;
        this.route = options.route;
        this.skin = options.skin;
        this.currentStep = 0;
        this.state = 'wait';
        this.id = new Date().getTime();

        this.move = function () {
            let beep = createjs.Tween.get(this, {override: true})
            if (this.currentStep === this.route.length) {
                this.currentStep = 0
                let angle = Math.atan2(this.y - options.y, this.x - options.x) / Math.PI * 180
                beep.to( { rotation: angle } )
                    .to ( { x: options.x, y: options.y}, 2000 )
                    .addEventListener('complete', () => {
                        this.move()
                    })
                return
            }

            let [distance, angle] = this.route[this.currentStep].split('*');
            let rad = +angle * Math.PI / 180
            let x = this.x + distance * move_multiplier * Math.cos(rad)
            let y = this.y + distance * move_multiplier * Math.sin(rad)


            beep.to({ rotation: +angle + 180 }, 500)
                .to( { x: x, y: y }, this.speed * distance )
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

        this.clone = function (x, y, route) {
            this.x = x
            this.y = y
            this.route = route
            return this
        }

        this.speedUp = function (modifier = 2) {

        }

        this.slowDown = function (modifier = 2){

        }

        this.addEventListener("click", function (event){
            let it = event.target;
            console.info('ID', it.id);
            it.gotoAndPlay('click')
            console.log(it)
            setTimeout(() => {
                orkContainer.removeChild(it)
            }, 1000)

            createjs.Tween.get(it, { override: true })
                .to( { x: it.x, y: it.y })
        });

        // this.on("rollover", this._handlers.over);
        // this.on("rollout", this._handlers.out);

        this.cursor = 'pointer';
        this.x = options.x;
        this.y = options.y;


        return this
    }

    let p = createjs.extend(Ork, createjs.Sprite);

    window.Ork = createjs.promote(Ork, "Sprite")
}());
