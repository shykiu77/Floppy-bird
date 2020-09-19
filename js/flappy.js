mainStage = document.querySelector('[wm-flappy]')
const height = mainStage.getBoundingClientRect().height
const width = mainStage.getBoundingClientRect().width


function makeElement(elementType,elementClass){
    const element = document.createElement(elementType)
    element.className = elementClass
    return element
}


function addToStage(...elements){
    elements.forEach(element => mainStage.appendChild(element))
}


function barrier(reversa){
    this.element = makeElement('div','barreira')
    const body = makeElement('div','corpo')
    const border = makeElement('div','borda')

    if(reversa){
        this.element.appendChild(body)
        this.element.appendChild(border)
    }
    else{
        this.element.appendChild(border)
        this.element.appendChild(body)
    }

    this.setHeight = height => body.style.height = `${height}px`
}

function barrierPair(){
    this.element = makeElement('div','par-de-barreiras')
    this.top = new barrier(true)
    this.bottom = new barrier(false)

    this.element.appendChild(this.top.element)
    this.element.appendChild(this.bottom.element)

    // gap/2 <= midpoint <= height-gap/2
    this.setGap = function(gap,midpoint){
        this.top.setHeight(midpoint - gap/2)
        this.bottom.setHeight(height - midpoint - gap/2)
    }
    this.randomizeGap = function(gap){
        let midpoint = Math.random() * (height - gap) + gap/2
        this.setGap(gap,midpoint)
    }

    this.setX = x => this.element.style.left = `${x}px`

    this.getX = () => parseInt(this.element.style.left,10)
}

//Xgap = gap between barrier a pair of barriers. barrierGap = y gap between the two barriers of a pair.
function barrierPairSet(Xgap,Ygap,callback){
    this.barrierPairSet = new Array()
    for(let i=0; i<4; i++){
        this.barrierPairSet[i] = new barrierPair()
        this.barrierPairSet[i].randomizeGap(Ygap)
        this.barrierPairSet[i].setX(width + i*Xgap)
    }

    this.reset = (index) => this.barrierPairSet[index].setX(width)

    this.decreaseX = (decrement) => this.barrierPairSet.forEach(barrierPair => {
        if( barrierPair.getX() >= width/2 && (barrierPair.getX() - decrement )< width/2){
            callback()
        }
        barrierPair.setX(barrierPair.getX() - decrement)
    })

    this.checkOutOfBoundsLeft = function(){
        for(let i=0; i<4; i++){
            if(this.barrierPairSet[i].getX() < -Xgap )
                this.reset(i)
        }
    }
}


function bird(){
    this.element = makeElement('img','passaro')
    this.element.src = './imgs/passaro.png'
    this.element.style.bottom = `${height/2}px`
    this.flying = false
    
    window.onkeydown = () => this.flying = true

    window.onkeyup = () => this.flying = false

    this.updatePosition = function(){
        let change = this.flying ? 8 : -5
        let newY = this.getY() + change
        if (newY < 0)
            newY = 0
        else if (newY > height-60)
            newY = height-60
        
        this.element.style.bottom = `${newY}px`
    }

    this.getY = () => parseInt(this.element.style.bottom,10)
}

function checkOverlap(elementA,elementB){
    const a = elementA.getBoundingClientRect()
    const b = elementB.getBoundingClientRect()
    
    const horizontalOverlap = a.left + a.width >= b.left 
        && b.left + b.width >= a.left

    const verticalOverlap = a.top + a.height >= b.top
        && b.top + b.height >= a.top

    return horizontalOverlap && verticalOverlap
}

function checkColision(bird,barrierSet){
    collision = false
    for(barrierPair of barrierSet.barrierPairSet)
        collision = collision || checkOverlap(bird.element,barrierPair.top.element) || checkOverlap(bird.element,barrierPair.bottom.element)
    
    return collision
}


function progress(){
    this.element = makeElement('span','progresso')

    this.updatePoints = points => {
        this.element.innerHTML = points
    }
    this.updatePoints(0)
}

function flappyBird(){
    let points = 0
    score = new progress()
    addToStage(score.element)
    set = new barrierPairSet(400,200,() => score.updatePoints(++points))
    for (barrierPair of set.barrierPairSet){
        addToStage(barrierPair.element)
    }
    bird = new bird()
    addToStage(bird.element)
    this.start = () => {
        const timer = setInterval(() => {
            set.decreaseX(7)
            set.checkOutOfBoundsLeft()
            bird.updatePosition()
            running = !checkColision(bird,set)
            if(checkColision(bird,set)){
                clearInterval(timer)
            }
        },22)
    }
}


new flappyBird().start()

