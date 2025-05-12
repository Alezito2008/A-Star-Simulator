const canvas = document.getElementById('simulator');
const ctx = canvas.getContext('2d');

const WIDTH = ctx.canvas.width = window.innerWidth - 10;
const HEIGHT = ctx.canvas.height = window.innerHeight - 10;
const CELL_SIZE = 50;
const DISTANCE = 10;
const DIAGONAL_DISTANCE = Math.sqrt(Math.pow(DISTANCE, 2) + Math.pow(DISTANCE, 2));

ctx.fillStyle = 'white';
ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

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
    constructor() {
        this.distancia_inicio = 0;
        this.distancia_final = 0;
        this.fuerza = 0;
        this.highlight = false;
        this.color = 'white';
    }

    setColor(color) {
        this.color = color;
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
                this.grid[i].push(new Cell());
            }
        }

        console.log({
            x: this.celdas_x,
            y: this.celdas_y
        })
    }

    getCell(x, y) {
        return this.grid[y][x];
    }

    drawGrid() {
        // Draw cells
        this.drawCells();

        // Redraw grid lines to ensure visibility
        ctx.strokeStyle = 'gray'; // Set the color for the grid lines
        ctx.lineWidth = 1; // Set the line width

        let coord_x = 0;
        let coord_y = 0;

        const bottom = this.celdas_y * CELL_SIZE;
        const right = this.celdas_x * CELL_SIZE;

        // Draw vertical lines
        for (let x = 0; x <= this.celdas_x; x++) {
            ctx.beginPath();
            ctx.moveTo(coord_x, 0);
            ctx.lineTo(coord_x, bottom);
            ctx.stroke();

            coord_x += CELL_SIZE;
        }

        // Draw horizontal lines
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
                ctx.fillStyle = cell.color;
                ctx.fillRect(j * CELL_SIZE, i * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                if (cell.hightlight) {
                    ctx.strokeStyle = 'yellow';
                    ctx.strokeWidth = 3;
                    ctx.fillStroke(j * CELL_SIZE, i * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                }
            }
        }
    }
}

const grid = new Grid()
grid.drawGrid();
const cell = grid.getCell(0, 0);
cell.setColor('green');
grid.getCell(4, 2).setHightlight(true)
grid.drawGrid(); // Redraw the grid to reflect the cell color change