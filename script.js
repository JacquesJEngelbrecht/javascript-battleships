document.addEventListener('DOMContentLoaded', () => {
    const userGrid = document.querySelector('.grid-user')
    const computerGrid = document.querySelector('.grid-computer')
    const displayGrid = document.querySelector('.grid-display')
    const ships = document.querySelectorAll('.ship')
    const destroyer = document.querySelector('.destroyer-container')
    const submarine = document.querySelector('.submarine-container')
    const cruiser = document.querySelector('.cruiser-container')
    const battleship = document.querySelector('.battleship-container')
    const carrier = document.querySelector('.carrier-container')
    const startButton = document.getElementById('start')
    const rotateButton = document.getElementById('rotate')
    const turnDisplay = document.getElementById('whose-go')
    const infoDisplay = document.getElementById('info')
    const userSquares = []
    const computerSquares = []
    const width = 10
    let isHorizontal = true
    let isGameOver = false
    let currentPlayer = 'user' 

    //Create boards
    function createBoard(grid, squares) {
        for(let i = 0; i < width*width; i++) {
            const square = document.createElement('div')
            square.dataset.id = i
            grid.appendChild(square)
            squares.push(square)
        }
    }

    createBoard(userGrid, userSquares)
    createBoard(computerGrid, computerSquares)

    //Ships
    const shipArray = [
        {
            name: 'destroyer',
            directions: [
                [0, 1],
                [0, width]
            ]
        },
        {
            name: 'submarine',
            directions: [
                [0, 1, 2],
                [0, width, width*2]
            ]
        },
        {
            name: 'cruiser',
            directions: [
                [0, 1, 2],
                [0, width, width*2]
            ]
        },
        {
            name: 'battleship',
            directions: [
                [0, 1, 2, 3],
                [0, width, width*2, width*3]
            ]
        },
        {
            name: 'carrier',
            directions: [
                [0, 1, 2, 3, 4],
                [0, width, width*2, width*3, width*4]
            ]
        }
    ]
    //Computer's random board
    function generate(ship) {
        let randomDirection = Math.floor(Math.random() * ship.directions.length)
        let current = ship.directions[randomDirection]
        if (randomDirection === 0) direction = 1
        if (randomDirection === 1) direction = 10
        let randomStart = Math.abs(Math.floor(Math.random() * computerSquares.length - (ship.directions[0].length * direction)))
            
        const isTaken = current.some(index => computerSquares[randomStart + index].classList.contains('taken'))
        const isAtRightEdge = current.some(index => (randomStart + index) % width === width - 1)
        const isAtLeftEdge = current.some(index => (randomStart + index) % width === 0)

        if (!isTaken && !isAtRightEdge && !isAtLeftEdge) current.forEach(index => computerSquares[randomStart + index].classList.add('taken', ship.name))

        else generate(ship)
  
    }

    generate(shipArray[0])
    generate(shipArray[1])
    generate(shipArray[2])
    generate(shipArray[3])
    generate(shipArray[4])

    //Rotate
    function rotate() {
        if(isHorizontal) {
            destroyer.classList.toggle('destroyer-container-vertical')
            submarine.classList.toggle('submarine-container-vertical')
            cruiser.classList.toggle('cruiser-container-vertical')
            battleship.classList.toggle('battleship-container-vertical')
            carrier.classList.toggle('carrier-container-vertical')
            isHorizontal = false
        } else {
            destroyer.classList = 'destroyer-container'
            submarine.classList = 'submarine-container'
            cruiser.classList = 'cruiser-container'
            battleship.classList = 'battleship-container'
            carrier.classList = 'carrier-container'
            isHorizontal = true
        }
    }
    rotateButton.addEventListener('click', rotate)

    //Dragable 
    ships.forEach(ship => ship.addEventListener('dragstart', dragStart))
    userSquares.forEach(square => square.addEventListener('dragstart', dragStart))
    userSquares.forEach(square => square.addEventListener('dragover', dragOver))
    userSquares.forEach(square => square.addEventListener('dragenter', dragEnter))
    userSquares.forEach(square => square.addEventListener('dragleave', dragLeave))
    userSquares.forEach(square => square.addEventListener('drop', dragDrop))
    userSquares.forEach(square => square.addEventListener('dragend', dragEnd))

    let selectedShipnameWithIndex
    let draggedShip
    let draggedShipLength  
    

    ships.forEach(ship => ship.addEventListener('mousedown', (e) => {
        selectedShipnameWithIndex = e.target.id
        console.log(selectedShipnameWithIndex)
    }))

    function dragStart() {
        draggedShip = this
        draggedShipLength = this.childNodes.length
    }

    function dragOver(e) {
        e.preventDefault()
    }

    function dragEnter(e) {
        e.preventDefault()
    }

    function dragLeave(e) {
        e.preventDefault()
    }

    function dragDrop() {
        let shipNameWithLastId = draggedShip.lastChild.id
        let shipClass = shipNameWithLastId.slice(0, -2)
        let lastShipIndex = parseInt(shipNameWithLastId.substr(-1))
        let shipLastId = lastShipIndex + parseInt(this.dataset.id)
        const notAllowedHorizontal = [0,10,20,30,40,50,60,70,80,90,1,11,21,31,41,51,61,71,81,91,2,12,22,32,42,52,62,72,82,92,3.13,23,43,53,63,73,83,93]
        const notAllowedVertical = [99,98,97,96,95,94,93,92,91,90,89,88,87,86,85,84,83,82,81,80,79,78,77,76,75,74,73,72,71,70,69,68,67,66,65,64,63,62,61,60]
        let newNotAllowedHorizontal = notAllowedHorizontal.splice(0, 10 * lastShipIndex)
        let newNotAllowedVertical = notAllowedVertical.splice(0, 10 * lastShipIndex)
        selectedShipIndex = parseInt(selectedShipnameWithIndex.substr(-1))
        shipLastId = shipLastId - selectedShipIndex
        //console.log(shipLastId)
        if(isHorizontal  && !newNotAllowedHorizontal.includes(shipLastId)) {
            for(let i = 0; i < draggedShipLength; i++) {
               userSquares[parseInt(this.dataset.id) - selectedShipIndex + i].classList.add('taken', shipClass)
            }
        } else if(!isHorizontal &&!newNotAllowedVertical.includes(shipLastId)) {
            for(let i = 0; i < draggedShipLength; i++) {
               userSquares[parseInt(this.dataset.id) - selectedShipIndex + width*i].classList.add('taken', shipClass)
            }
        } else return

        displayGrid.removeChild(draggedShip)
    }

    function dragEnd() {
        console.log('dragEnd')
    }

    //Games logic
    function playGame() {
        if (isGameOver) return
        if( currentPlayer === 'user') {
            turnDisplay.innerHTML = 'Your Go'
            computerSquares.forEach(square => square.addEventListener('click', function(e) {
                revealSquare(square)
            }))
        }
        if( currentPlayer === 'computer') {
            turnDisplay.innerHTML = 'Computers Go'
            setTimeout(computerGo, 1000)
        }
    }

    startButton.addEventListener('click', playGame)

    let destroyerCount = 0
    let submarineCount = 0
    let cruiserCount = 0
    let battleshipCount = 0
    let carrierCount = 0

    function revealSquare(square) {
        if(!square.classList.contains('kapow')) {
            if(square.classList.contains('destroyer')) destroyerCount++
            if(square.classList.contains('submarine')) submarineCount++
            if(square.classList.contains('cruiser')) cruiserCount++
            if(square.classList.contains('battleship')) battleshipCount++
            if(square.classList.contains('carrier')) carrierCount++
        } 
        
        if (square.classList.contains('taken')) {
            square.classList.add('kapow')
        } else {
            square.classList.add('missed')
        }
        checkForWins()
        currentPlayer = 'computer'
        playGame()
    }

    let computerDestroyerCount = 0
    let computerSubmarineCount = 0
    let computerCruiserCount = 0
    let computerBattleshipCount = 0
    let computerCarrierCount = 0

    function computerGo() {
        let random = Math.floor(Math.random() * userSquares.length)
        if(!userSquares[random].classList.contains('kapow')) {
            userSquares[random].classList.add('kapow')
            if(userSquares[random].classList.contains('destroyer')) computerDestroyerCount++
            if(userSquares[random].classList.contains('submarine')) computerSubmarineCount++
            if(userSquares[random].classList.contains('cruiser')) computerCruiserCount++
            if(userSquares[random].classList.contains('battleship')) computerBattleshipCount++
            if(userSquares[random].classList.contains('carrier')) computerCarrierCount++
        } else computerGo()
        currentPlayer = 'user'
        turnDisplay.innerHTML = 'Your Go'
    } 

    function checkForWins() {
        //User
        if(destroyerCount === 2) {
            infoDisplay.innerHTML = 'You sunk the computers destroyer!'
            destroyerCount = 10
        }
        if(submarineCount === 3) {
            infoDisplay.innerHTML = 'You sunk the computers submarine!'
            submarineCount = 10
        }
        if(cruiserCount === 3) {
            infoDisplay.innerHTML = 'You sunk the computers cruiser!'
            cruiserCount = 10
        }
        if(battleshipCount === 4) {
            infoDisplay.innerHTML = 'You sunk the computers battleship!'
            battleshipCount = 10
        }
        if(carrierCount === 5) {
            infoDisplay.innerHTML = 'You sunk the computers carrier!'
            carrierCount = 10
        }

        //Computer
        if(computerDestroyerCount === 2) {
            infoDisplay.innerHTML = 'Computer sunk your destroyer!'
            computerDestroyerCount = 10
        }
        if(computerSubmarineCount === 3) {
            infoDisplay.innerHTML = 'Computer sunk your submarine!'
            computerSubmarineCount = 10
        }
        if(computerCruiserCount === 3) {
            infoDisplay.innerHTML = 'Computer sunk your cruiser!'
            computerCruiserCount = 10
        }
        if(computerBattleshipCount === 4) {
            infoDisplay.innerHTML = 'Computer sunk your battleship!'
            computerBattleshipCount = 10
        }
        if(computerCarrierCount === 5) {
            infoDisplay.innerHTML = 'Computer sunk your carrier!'
            computerCarrierCount = 10
        }
        if((destroyerCount + submarineCount + cruiserCount + battleshipCount + carrierCount) === 50) {
            infoDisplay.innerHTML = "You Win!"
            isGameOver()
        }
        if((computerDestroyerCount + computerSubmarineCount + computerCruiserCount + computerBattleshipCount + computerCarrierCount) === 50) {
            infoDisplay.innerHTML = "Computer Win!"
            isGameOver()
        }
    }

    function Games() {
        isGameOver = true
        startButton.removeEventListener('click', playGame)
    }
})