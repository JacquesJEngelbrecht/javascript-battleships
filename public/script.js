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
    const singlePlayerButton = document.querySelector('#singlePlayerButton')
    const multiPlayerButton = document.querySelector('#multiPlayerButton')
    const userSquares = []
    const computerSquares = []
    const width = 10
    let isHorizontal = true
    let isgameover = false
    let currentPlayer = 'user' 
    let gameMode = ""
    let playerNum = 0
    let ready = false
    let enemyReady = false
    let allShipsPlaced = false
    let shotFired = -1

    //Select mode
    singlePlayerButton.addEventListener('click', startSinglePlayer)
    multiPlayerButton.addEventListener('click', startMultiPlayer) 

    //Single Player
    function startSinglePlayer() {
        gameMode = 'singlePlayer'

        generate(shipArray[0])
        generate(shipArray[1])
        generate(shipArray[2])
        generate(shipArray[3])
        generate(shipArray[4])
        startButton.addEventListener('click', playGameSingle)
    }

    //Multi Player
    function startMultiPlayer() {
        gameMode = 'multiPlayer'
        const socket = io()

         //Get player number
        socket.on('player-number', num => {
            if(num === -1) {
                infoDisplay.innerHTML = 'Sorry the server is full!'
            } else {
                playerNum = parseInt(num)
                if(playerNum === 1) currentPlayer = "enemy"
                console.log(playerNum)

                //Get other player status
                socket.emit('check-players')
            }
        })
        //Antohter player connected or disconnected
        socket.on('player-connection', num => {
            console.log(`Player number ${num} has connected or disconnected`)
            playerConnectedOrDisconnected(num)
        })

        //On enemy ready
        socket.on('enemy-ready', num => {
            enemyReady = true
            playerReady(num)
            if (ready) playGameMulti(socket)
        })

        //Check player status
        socket.on('check-players', players => {
            players.forEach((p, i) => {
                if(p.connected) playerConnectedOrDisconnected(i)
                if(p.ready) {
                    playerReady(i)
                    if(i !== playerNum) enemyReady = true
                }
            })
        })

        //Ready button event
        startButton.addEventListener('click', () => {
            if(allShipsPlaced) playGameMulti(socket)
            else infoDisplay.innerHTML = 'Please place all of your ships!'
        })

        //Setup listener for firing
        computerSquares.forEach(square => {
            square.addEventListener('click' ,() => {
                if(currentPlayer === 'user' && ready && enemyReady) {
                    shotFired = square.dataset.id 
                    socket.emit('fire', shotFired)
                }
            })
        })

        //On fire received
        socket.on('fire', id => {
            enemyGo(id)
            const square = userSquares[id]
            socket.emit('fire-reply', square.classList)
            playGameMulti(socket)
        })

        //On fire reply received
        socket.on('fire-reply', classList => {
            revealSquare(classList)
            playGameMulti(socket)
        })

        function playerConnectedOrDisconnected(num) {
            let player = `.p${parseInt(num) + 1}`
            document.querySelector(`${player} .connected span`).classList.toggle('green')
            if(parseInt(num) === playerNum) document.querySelector(player).style.fontWeight = 'bold'
        }
    }

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
    //Computer's square board
    function generate(ship) {
        let squareDirection = Math.floor(Math.square() * ship.directions.length)
        let current = ship.directions[squareDirection]
        if (squareDirection === 0) direction = 1
        if (squareDirection === 1) direction = 10
        let squareStart = Math.abs(Math.floor(Math.square() * computerSquares.length - (ship.directions[0].length * direction)))
            
        const isTaken = current.some(index => computerSquares[squareStart + index].classList.contains('taken'))
        const isAtRightEdge = current.some(index => (squareStart + index) % width === width - 1)
        const isAtLeftEdge = current.some(index => (squareStart + index) % width === 0)

        if (!isTaken && !isAtRightEdge && !isAtLeftEdge) current.forEach(index => computerSquares[squareStart + index].classList.add('taken', ship.name))

        else generate(ship)
  
    }

    

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

        if(isHorizontal  && !newNotAllowedHorizontal.includes(shipLastId)) {
            for(let i = 0; i < draggedShipLength; i++) {
               userSquares[parseInt(this.dataset.id) - selectedShipIndex + i].classList.add('taken', shipClass)
            }
        } else if(!isHorizontal && !newNotAllowedVertical.includes(shipLastId)) {
            for(let i = 0; i < draggedShipLength; i++) {
               userSquares[parseInt(this.dataset.id) - selectedShipIndex + width*i].classList.add('taken', shipClass)
            }
        } else return

        displayGrid.removeChild(draggedShip)
        if(!displayGrid.querySelector('.ship')) allShipsPlaced = true
    }

    function dragEnd() {
        console.log('dragEnd')
    }

    //Game logic Multi Player
    function playGameMulti(socket) {
        if(isgameover) return
        if(!ready) {
            socket.emit('player-ready')
            ready = true
            playerReady(playerNum)
        }
        if(enemyReady) {
            if(currentPlayer === 'user') {
                turnDisplay.innerHTML = 'Your Go'
            }
            if(currentPlayer === 'enemy') {
                turnDisplay.innerHTML = 'Enemy Go'
            }
        }
    }

    function playerReady(num) {
        let player = `.p${parseInt(num) + 1}`
        document.querySelector(`${player} .ready span`).classList.toggle('green')
    }

    //Game logic Single Player
    function playGameSingle() {
        if (isgameover) return
        if( currentPlayer === 'user') {
            turnDisplay.innerHTML = 'Your Go'
            computerSquares.forEach(square => square.addEventListener('click', function(e) {
                revealSquare(square)
            }))
        }
        if( currentPlayer === 'computer') {
            turnDisplay.innerHTML = 'Computers Go'
            setTimeout(enemyGo, 1000)
        }
    }

    

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
        playGameSingle()
    }

    let computerDestroyerCount = 0
    let computerSubmarineCount = 0
    let computerCruiserCount = 0
    let computerBattleshipCount = 0
    let computerCarrierCount = 0

    function enemyGo(square) {
        if(gameMode === 'singlePlayer') square = Math.floor(Math.square() * userSquares.length)
        if(!userSquares[square].classList.contains('kapow')) {
            userSquares[square].classList.add('kapow')
            if(userSquares[square].classList.contains('destroyer')) computerDestroyerCount++
            if(userSquares[square].classList.contains('submarine')) computerSubmarineCount++
            if(userSquares[square].classList.contains('cruiser')) computerCruiserCount++
            if(userSquares[square].classList.contains('battleship')) computerBattleshipCount++
            if(userSquares[square].classList.contains('carrier')) computerCarrierCount++
            checkForWins()
        } else if(gameMode === 'singePlayer') enemyGo()
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

    function isGameOver() {
        isgameover = true
        startButton.removeEventListener('click', playGameSingle)
    }
})