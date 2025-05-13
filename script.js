const canvas = document.getElementById('simulator');
const ctx = canvas.getContext('2d');
const stepButton = document.getElementById('step');
const simulateButton = document.getElementById('simulate');
const resetButton = document.getElementById('reset');

const SMALL_FONT = '10px Arial';
const MEDIUM_FONT = '15px Arial';

const WIDTH = ctx.canvas.width = window.innerWidth - 10;
const HEIGHT = ctx.canvas.height = window.innerHeight - 10;
const CELL_SIZE = 50;
const DISTANCE = 10;
const DIAGONAL_DISTANCE = Math.sqrt(Math.pow(DISTANCE, 2) + Math.pow(DISTANCE, 2));

const CELL_TYPES = {
    EMPTY: 'EMPTY',
    WALL: 'WALL',
    START: 'START',
    END: 'END',
    OPEN: 'OPEN',
    CLOSED: 'CLOSED'
}

const COLORS = {
    BACKGROUND: 'white',
    GRID: 'gray',
    NUMBERS: 'black',
    EMPTY: 'white',
    WALL: 'black',
    START: 'lime',
    END: 'red',
    OPEN: 'yellow',
    CLOSED: 'lightblue',
}

const MOSTRAR_NUMEROS = false;
const COLOREAR_CELDAS = false;

let previousSelectedCell = null;
let movingCell = false;
let previousCellType = null;
let movingCellType = null;

let startCell = null;
let endCell = null;
let currentCell = null;
let openCells = [];
let closedCells = [];

let caminoEncontrado = false;

ctx.fillStyle = COLORS.BACKGROUND;
ctx.font = SMALL_FONT;
ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

if (!COLOREAR_CELDAS) {
    COLORS.OPEN = COLORS.EMPTY;
    COLORS.CLOSED = COLORS.EMPTY;
}

function emptyStringIfNull(value) {
    return value === null ? '' : value;
}

simulateButton.addEventListener('click', simulate);
stepButton.addEventListener('click', step);
resetButton.addEventListener('click', () => location.reload());

canvas.addEventListener('click', (e) => {
    const x = Math.floor(e.clientX / CELL_SIZE);
    const y = Math.floor(e.clientY / CELL_SIZE);

    const cell = grid.getCell(x, y);
    if (cell) {
        if (movingCell && previousCellType === CELL_TYPES.EMPTY) {
            movingCell = false;
            cell.setType(movingCellType);
        } else if (cell.type === CELL_TYPES.EMPTY) {
            cell.setType(CELL_TYPES.WALL);
        } else if (cell.type === CELL_TYPES.WALL) {
            cell.setType(CELL_TYPES.EMPTY);
        }

        grid.draw();
    } else {
        console.error('Cell not found');
    }
});

canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    const x = Math.floor(e.clientX / CELL_SIZE);
    const y = Math.floor(e.clientY / CELL_SIZE);

    const cell = grid.getCell(x, y);

    if (!movingCell && cell && cell.type !== CELL_TYPES.EMPTY) {
        movingCell = true;
        movingCellType = cell.type;
        cell.setType(CELL_TYPES.EMPTY);
        previousCellType = CELL_TYPES.EMPTY;
    }
})

canvas.addEventListener('mousemove', (e) => {
    const x = Math.floor(e.clientX / CELL_SIZE);
    const y = Math.floor(e.clientY / CELL_SIZE);

    const selectedCell = grid.getCell(x, y);
    if (selectedCell && previousSelectedCell !== selectedCell) {
        if (previousSelectedCell) {
            previousSelectedCell.setHightlight(false);
            movingCell && previousSelectedCell.setType(previousCellType);
        }
        selectedCell.setHightlight(true);

        if (movingCell) {
            previousCellType = selectedCell.type
            selectedCell.setType(movingCellType);
        }

        previousSelectedCell = selectedCell;

        grid.draw();
    }
});

class Vector2D {
    constructor(x, y) {
        if (x != null) {
            this.x = x;
        } else {
            this.x = 0;
        }
        
        if (y != null) {
            this.y = y;
        } else {
            this.y = 0;
        }
    }

    setX(x) {
        this.x = x;
    }

    setY(y) {
        this.y = y;
    }

    addX(x) {
        this.x += x;
    }

    addY(y) {
        this.y += y;
    }
}

class Cell {
    constructor(coords) {
        this.distancia_inicio = null;
        this.distancia_final = null;
        this.fuerza = null;
        this.highlight = false;
        this.color = COLORS.EMPTY;
        this.type = CELL_TYPES.EMPTY;
        this.coords = new Vector2D(coords.x, coords.y);
        this.pointsTo = null;
    }

    setColor(color) {
        this.color = color;
    }

    calcularDistancia(targetCell) {
        const dy = Math.abs(this.coords.y - targetCell.coords.y);
        const dx = Math.abs(this.coords.x - targetCell.coords.x);
        const diagonales = Math.min(dx, dy);
        const rectas = Math.abs(dx - dy)
        const distancia = Math.floor(rectas * DISTANCE + diagonales * DIAGONAL_DISTANCE);
        return distancia
    }

    setType(type) {
        this.type = type;
        switch (type) {
            case CELL_TYPES.EMPTY:
                this.color = COLORS.EMPTY;
                break;
            case CELL_TYPES.WALL:
                this.color = COLORS.WALL;
                break;
            case CELL_TYPES.START:
                startCell = this;
                this.color = COLORS.START;
                break;
            case CELL_TYPES.END:
                endCell = this;
                this.color = COLORS.END;
                break;
            case CELL_TYPES.OPEN:
                this.color = COLORS.OPEN;
                if (!openCells.includes(this)) openCells.push(this);
                break;
            case CELL_TYPES.CLOSED:
                this.color = COLORS.CLOSED;
                this.getNeightbors().forEach(neighbor => {
                    if (neighbor.type !== CELL_TYPES.CLOSED && neighbor.type !== CELL_TYPES.WALL) {
                        const nuevaDistanciaInicio = neighbor.calcularDistancia(this) + this.distancia_inicio;

                        if (neighbor.type !== CELL_TYPES.OPEN || neighbor.distancia_inicio > nuevaDistanciaInicio) {
                            neighbor.setType(CELL_TYPES.OPEN);
                            neighbor.pointsTo = this;
                        }

                        neighbor.distancia_final = neighbor.calcularDistancia(endCell);
                        if (neighbor.distancia_inicio > nuevaDistanciaInicio || !neighbor.distancia_inicio) {
                            neighbor.distancia_inicio = nuevaDistanciaInicio;
                        }
                        neighbor.distancia_final = neighbor.distancia_final;
                        neighbor.fuerza = neighbor.distancia_inicio + neighbor.distancia_final;

                        startCell.setColor(COLORS.STARt);
                        endCell.setColor(COLORS.END);
                    }
                })
                closedCells.push(this);
                currentCell = this;
                // Eliminar de las abiertas
                const index = openCells.indexOf(this);
                if (index > -1) {
                    openCells.splice(index, 1);
                }
                break;
            default:
                this.color = COLORS.EMPTY;
        }
    }

    setHightlight(isHighlighted) {
        this.highlight = isHighlighted;
    }

    getNeightbors() {
        const neighbors = [];
        const directions = [
            { x: 0, y: -1 }, // Arriba
            { x: 0, y: 1 }, // Abajo
            { x: 1, y: 0 }, // Derecha
            { x: -1, y: 0 }, // Izquierda
            { x: -1, y: -1 }, // Arriba izquierda
            { x: 1, y: -1 }, // Arriba derecha
            { x: 1, y: 1 }, // Abajo derecha
            { x: -1, y: 1 } // Abajo izquierda
        ];

        for (const dir of directions) {
            const neighbor = grid.getCell(this.coords.x + dir.x, this.coords.y + dir.y);
            if (neighbor) {
                neighbors.push(neighbor);
            }
        }

        return neighbors;
    }

    getPixelCoords() {
        return {
            x: this.coords.x * CELL_SIZE,
            y: this.coords.y * CELL_SIZE
        }
    }

    drawLineTo(targetCell) {
        ctx.beginPath();
        ctx.moveTo(this.getPixelCoords().x + (CELL_SIZE / 2), this.getPixelCoords().y + (CELL_SIZE / 2));
        ctx.lineTo(targetCell.getPixelCoords().x + (CELL_SIZE / 2), targetCell.getPixelCoords().y + (CELL_SIZE / 2));
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 3;
        ctx.stroke();
    }
}

class Grid {
    constructor() {
        console.log('Initialized Grid')
        this.celdas_x = parseInt(WIDTH / CELL_SIZE);
        this.celdas_y = parseInt(HEIGHT / CELL_SIZE);
        this.grid = [];
        
        for (let i = 0; i < this.celdas_y; i++) {
            this.grid.push([])

            for (let j = 0; j < this.celdas_x; j++) {
                const coords = new Vector2D(j, i);
                const cell = new Cell(coords)
                this.grid[i].push(cell);
            }
        }

        console.log({
            x: this.celdas_x,
            y: this.celdas_y
        })
    }

    getCell(x, y) {
        if (x < 0 || x >= this.celdas_x || y < 0 || y >= this.celdas_y) {
            return null;
        }
        return this.grid[y][x];
    }

    draw() {
        this.drawCells();

        ctx.strokeStyle = COLORS.GRID; // Color de las líneas
        ctx.lineWidth = 1; // Ancho de las líneas

        let coord_x = 0;
        let coord_y = 0;

        const bottom = this.celdas_y * CELL_SIZE;
        const right = this.celdas_x * CELL_SIZE;

        // Líneas verticales
        for (let x = 0; x <= this.celdas_x; x++) {
            ctx.beginPath();
            ctx.moveTo(coord_x, 0);
            ctx.lineTo(coord_x, bottom);
            ctx.stroke();

            coord_x += CELL_SIZE;
        }

        // Líneas horizontales
        for (let y = 0; y <= this.celdas_y; y++) {
            ctx.beginPath();
            ctx.moveTo(0, coord_y);
            ctx.lineTo(right, coord_y);
            ctx.stroke();

            coord_y += CELL_SIZE;
        }

        caminoEncontrado && colorearCamino();
    }

    drawCells() {
        for (let i = 0; i < this.celdas_y; i++) {
            for (let j = 0; j < this.celdas_x; j++) {
                const cell = this.grid[i][j];
                cell.coords.x = j;
                cell.coords.y = i;
                this.drawCell(cell)
            }
        }
    }

    drawCell(cell) {
        ctx.fillStyle = cell.color;
        ctx.fillRect(cell.coords.x * CELL_SIZE, cell.coords.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        ctx.fillStyle = MOSTRAR_NUMEROS ? COLORS.NUMBERS : 'transparent' ;
        ctx.font = SMALL_FONT;
        ctx.textAlign = 'left';
        ctx.fillText(emptyStringIfNull(cell.distancia_inicio), cell.coords.x * CELL_SIZE + 5, cell.coords.y * CELL_SIZE + 15);
        ctx.textAlign = 'right';
        ctx.fillText(emptyStringIfNull(cell.distancia_final), cell.coords.x * CELL_SIZE + CELL_SIZE - 5, cell.coords.y * CELL_SIZE + 15);
        ctx.textAlign = 'center';
        ctx.font = MEDIUM_FONT;
        ctx.fillText(emptyStringIfNull(cell.fuerza), cell.coords.x * CELL_SIZE + (CELL_SIZE / 2), cell.coords.y * CELL_SIZE + (CELL_SIZE / 4)*3);
        if (cell.highlight) {
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 2;
            ctx.strokeRect(cell.coords.x * CELL_SIZE + (ctx.lineWidth - 1), cell.coords.y * CELL_SIZE + (ctx.lineWidth - 1), CELL_SIZE - (ctx.lineWidth - 1)*2, CELL_SIZE - (ctx.lineWidth - 1)*2);
        }
    }
}

function colorearCamino() {
    let actual = endCell;
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'blue';
    while (actual !== startCell && actual) {
        actual.drawLineTo(actual.pointsTo);
        actual = actual.pointsTo;
    }
}

function step() {
    if (!currentCell) {
        currentCell = startCell;
        currentCell.setType(CELL_TYPES.CLOSED);
    }

    if (openCells.length === 0) {
        alert('No se encontró el camino')
        caminoEncontrado = true;
        return
    }

    openCells.sort((a, b) => {
    if (a.fuerza === b.fuerza) {
        return a.distancia_final - b.distancia_final;
    }
    return a.fuerza - b.fuerza;
    });

    openCells[0].setType(CELL_TYPES.CLOSED);
    if (currentCell === endCell) {
        currentCell.setType(CELL_TYPES.END);
        caminoEncontrado = true;
        colorearCamino();
    }

    grid.draw();
}

function simulate() {
    if (caminoEncontrado) {
        alert('Ya se encontró el camino')
        return
    }

    while (!caminoEncontrado) {
        step();
    }
}

const grid = new Grid()
grid.draw();
grid.getCell(2, 7).setType(CELL_TYPES.START);
grid.getCell(7, 9).setType(CELL_TYPES.END);
grid.draw();
