const canvas = document.getElementById('simulator');
const ctx = canvas.getContext('2d');

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
    VISITED: 'VISITED',
    CURRENT: 'CURRENT'
}

let previousSelectedCell = null;

let movingCell = false;
let previousCellType = null;
let movingCellType = null;

ctx.fillStyle = 'white';
ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

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

    if (!movingCell) {
        movingCell = true;
        movingCellType = cell.type;
        cell.setType(CELL_TYPES.EMPTY);
        previousCellType = CELL_TYPES.EMPTY;
    } else {
        alert('Ya estás moviendo una celda');
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
    }

    grid.draw();
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
        this.distancia_inicio = 0;
        this.distancia_final = 0;
        this.fuerza = 0;
        this.highlight = false;
        this.color = 'white';
        this.type = CELL_TYPES.EMPTY;
        this.coords = new Vector2D(coords.x, coords.y);
    }

    setColor(color) {
        this.color = color;
    }

    setType(type) {
        this.type = type;
        switch (type) {
            case CELL_TYPES.EMPTY:
                this.color = 'white';
                break;
            case CELL_TYPES.WALL:
                this.color = 'black';
                break;
            case CELL_TYPES.START:
                this.color = 'blue';
                break;
            case CELL_TYPES.END:
                this.color = 'red';
                break;
            case CELL_TYPES.VISITED:
                this.color = 'yellow';
                break;
            case CELL_TYPES.CURRENT:
                this.color = 'green';
                break;
            default:
                this.color = 'white';
        }
    }

    setHightlight(isHighlighted) {
        this.highlight = isHighlighted;
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
                this.grid[i].push(new Cell(coords));
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

        ctx.strokeStyle = 'gray'; // Color de las líneas
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
    }

    drawCells() {
        for (let i = 0; i < this.celdas_y; i++) {
            for (let j = 0; j < this.celdas_x; j++) {
                const cell = this.grid[i][j];
                cell.x = j;
                cell.y = i;
                this.drawCell(cell)
            }
        }
    }

    drawCell(cell) {
        ctx.fillStyle = cell.color;
        ctx.fillRect(cell.x * CELL_SIZE, cell.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        if (cell.highlight) {
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 2;
            ctx.strokeRect(cell.x * CELL_SIZE + (ctx.lineWidth - 1), cell.y * CELL_SIZE + (ctx.lineWidth - 1), CELL_SIZE - (ctx.lineWidth - 1)*2, CELL_SIZE - (ctx.lineWidth - 1)*2);
        }
    }
}

const grid = new Grid()
grid.draw();
grid.getCell(1, 1).setType(CELL_TYPES.START);
grid.draw();