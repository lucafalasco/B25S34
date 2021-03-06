import { scaleLinear } from 'd3-scale'
const FPS = 10

// width and height of cell polygon in px
const cellLength = 15

let width = window.innerWidth * 2
let height = window.innerHeight * 2

let columns = width / 2 / cellLength
let rows = height / 2 / cellLength

const xDomain = [0, columns]
const yDomain = [0, rows]

// positioning scales
const xScale = scaleLinear()
  .domain(xDomain)
  .range([0, width])

const yScale = scaleLinear()
  .domain(yDomain)
  .range([0, height])

// generate a random field to start from
let field = randomField()

const game = document.getElementById('game')
const ctx = game.getContext('2d')
game.width = width
game.height = height

function iterate() {
  field = createNewGeneration(field)
  render(field)
}

function getCellColor(liveNeighboursCount) {
  switch (liveNeighboursCount) {
    case 2:
      return '#878787'
    case 3:
      return '#AFAFAF'
    case 4:
      return '#D7D7D7'
    case 5:
      return '#FFFFFF'
    default:
      return '#2e2e2e'
  }
}

function render(data) {
  ctx.clearRect(0, 0, width, height)
  data.forEach((row, rowIndex) => {
    row.forEach(column => {
      const xPosition = Math.floor(
        rowIndex % 2 === 1 ? xScale(column.x) - cellLength : xScale(column.x)
      )
      const yPosition = Math.floor(yScale(column.y))
      const fill = column.state ? getCellColor(column.liveNeighbours) : '#2e2e2e'

      ctx.font = '400 24px Space Mono, monospace'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = fill
      if (column.state) {
        ctx.fillText('1', xPosition, yPosition)
      } else {
        ctx.fillText('0', xPosition, yPosition)
      }
    })
  })
}

function randomField() {
  return Array(Math.ceil(rows))
    .fill()
    .map((r, i) =>
      Array(Math.ceil(columns + 1))
        .fill()
        .map((c, j) => ({
          x: j,
          y: i,
          state: Math.random() < 0.5 ? 1 : 0,
        }))
    )
}

function createNewGeneration(states) {
  const nextGen = []
  const ccx = states.length
  states.forEach((row, x) => {
    const ccy = row.length
    nextGen[x] = []
    row.forEach((column, y) => {
      const t = y - 1 < 0 ? ccy - 1 : y - 1 // top index
      const r = x + 1 === ccx ? 0 : x + 1 // right index
      const b = y + 1 === ccy ? 0 : y + 1 // bottom index
      const l = x - 1 < 0 ? ccx - 1 : x - 1 // left index

      const thisState = states[x][y].state
      let liveNeighbours = 0
      liveNeighbours += states[x][t].state ? 1 : 0
      liveNeighbours += states[l][y].state ? 1 : 0
      liveNeighbours += states[r][y].state ? 1 : 0
      liveNeighbours += states[x][b].state ? 1 : 0

      if (y % 2) {
        liveNeighbours += states[l][t].state ? 1 : 0
        liveNeighbours += states[l][b].state ? 1 : 0
      } else {
        liveNeighbours += states[r][t].state ? 1 : 0
        liveNeighbours += states[r][b].state ? 1 : 0
      }

      const newGen = { ...states[x][y] }

      // apply rules B25/S34
      if (thisState) {
        newGen.state = liveNeighbours === 3 || liveNeighbours === 4 ? 1 : 0
      } else {
        newGen.state = liveNeighbours === 2 || liveNeighbours === 5 ? 1 : 0
      }

      newGen.liveNeighbours = liveNeighbours
      nextGen[x][y] = newGen
    })
  })
  return nextGen
}

function reset() {
  // recalculate width and height
  width = window.innerWidth
  height = window.innerHeight
  columns = width / cellLength
  rows = height / cellLength
  game.width = width
  game.height = height

  // generate a new field based on new dimensions
  field = randomField()
}

render(field)
setInterval(() => {
  iterate()
}, 1000 / FPS)

// reset fileld on resize
window.addEventListener('resize', reset)

window.restart = function() {
  reset()
}
