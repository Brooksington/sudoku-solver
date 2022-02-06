/*fair warning, this program contains a fair bit of "legacy" code from testing that I dont have the heart to prune, namely- I had intended
to initially tie my created sudoku(generated from user input) directly to the individual DOM <td> elements. I had a hell of a time
getting it to function as intended, so I abandoned this approach in favor of a more incremental and functional style. I may revisit 
that approach again, as I already think I figured out enough to make it work properly, but I actually quite like the approach I ended
up using in the end. It's probably not optimal, but it works. 

There are also a lot of Arrow functions and other traditionally declared functions, I started opting for function()'s towards the end because
I didnt want to have to worry about hoisting. None of this code screams best practices or anything, I'm still learning what best practices 
even are. I didn't encapsulate anything and most of the matrix manipulation functions should probably be private methods in a class.
*/



//there are 2 hardcoded puzzles named Sudoku1 and 2, 1 is VERY easy, 2 is quite difficult.
//you can choose between the puzzles by changing the value of whichSudokuAmISolving near the bottom(currently line 519)
//inputing "sudoku" into that field, allows you to enter your own sudoku puzzle to solve. Can be entered using tab and 
//the numpad for quick...ish entry
window.addEventListener('DOMContentLoaded', (e) =>{

const base = 10;
const baseRoot=Math.floor(Math.sqrt(base));
const canvas=document.getElementById("canvas");
const ctx=canvas.getContext("2d");
canvas.width=window.innerWidth;
canvas.height=window.innerHeight;
const stack = [];

const sudoku1 = [
    [new SudokuSquare(2),new SudokuSquare(),new SudokuSquare(),new SudokuSquare(5),new SudokuSquare(),new SudokuSquare(),new SudokuSquare(4),new SudokuSquare(7),new SudokuSquare()],
    [new SudokuSquare(),new SudokuSquare(4),new SudokuSquare(),new SudokuSquare(),new SudokuSquare(),new SudokuSquare(8),new SudokuSquare(),new SudokuSquare(),new SudokuSquare(1)],
    [new SudokuSquare(3),new SudokuSquare(),new SudokuSquare(),new SudokuSquare(7),new SudokuSquare(),new SudokuSquare(4),new SudokuSquare(8),new SudokuSquare(),new SudokuSquare()],
    [new SudokuSquare(),new SudokuSquare(),new SudokuSquare(),new SudokuSquare(),new SudokuSquare(),new SudokuSquare(2),new SudokuSquare(7),new SudokuSquare(),new SudokuSquare()],
    [new SudokuSquare(6),new SudokuSquare(),new SudokuSquare(),new SudokuSquare(),new SudokuSquare(),new SudokuSquare(),new SudokuSquare(),new SudokuSquare(),new SudokuSquare(2)],
    [new SudokuSquare(),new SudokuSquare(),new SudokuSquare(9),new SudokuSquare(6),new SudokuSquare(),new SudokuSquare(),new SudokuSquare(),new SudokuSquare(),new SudokuSquare()],
    [new SudokuSquare(),new SudokuSquare(),new SudokuSquare(1),new SudokuSquare(4),new SudokuSquare(),new SudokuSquare(3),new SudokuSquare(),new SudokuSquare(),new SudokuSquare(7)],
    [new SudokuSquare(4),new SudokuSquare(),new SudokuSquare(),new SudokuSquare(2),new SudokuSquare(),new SudokuSquare(),new SudokuSquare(),new SudokuSquare(5),new SudokuSquare()],
    [new SudokuSquare(),new SudokuSquare(5),new SudokuSquare(2),new SudokuSquare(),new SudokuSquare(),new SudokuSquare(9),new SudokuSquare(),new SudokuSquare(),new SudokuSquare(3)]];

const sudoku2 = [
    [new SudokuSquare(7),new SudokuSquare(6),new SudokuSquare(3),new SudokuSquare(),new SudokuSquare(),new SudokuSquare(5),new SudokuSquare(4),new SudokuSquare(),new SudokuSquare()],
    [new SudokuSquare(4),new SudokuSquare(),new SudokuSquare(),new SudokuSquare(6),new SudokuSquare(),new SudokuSquare(),new SudokuSquare(3),new SudokuSquare(8),new SudokuSquare()],
    [new SudokuSquare(),new SudokuSquare(2),new SudokuSquare(),new SudokuSquare(),new SudokuSquare(),new SudokuSquare(4),new SudokuSquare(),new SudokuSquare(1),new SudokuSquare(6)],
    [new SudokuSquare(),new SudokuSquare(5),new SudokuSquare(7),new SudokuSquare(),new SudokuSquare(),new SudokuSquare(6),new SudokuSquare(8),new SudokuSquare(2),new SudokuSquare()],
    [new SudokuSquare(),new SudokuSquare(),new SudokuSquare(),new SudokuSquare(),new SudokuSquare(2),new SudokuSquare(),new SudokuSquare(7),new SudokuSquare(),new SudokuSquare()],
    [new SudokuSquare(2),new SudokuSquare(),new SudokuSquare(),new SudokuSquare(5),new SudokuSquare(7),new SudokuSquare(3),new SudokuSquare(),new SudokuSquare(6),new SudokuSquare()],
    [new SudokuSquare(),new SudokuSquare(7),new SudokuSquare(2),new SudokuSquare(),new SudokuSquare(),new SudokuSquare(),new SudokuSquare(9),new SudokuSquare(),new SudokuSquare(8)],
    [new SudokuSquare(),new SudokuSquare(3),new SudokuSquare(1),new SudokuSquare(),new SudokuSquare(6),new SudokuSquare(),new SudokuSquare(2),new SudokuSquare(),new SudokuSquare()],
    [new SudokuSquare(5),new SudokuSquare(4),new SudokuSquare(),new SudokuSquare(2),new SudokuSquare(8),new SudokuSquare(),new SudokuSquare(),new SudokuSquare(),new SudokuSquare(1)]];

//object factory pretty self explanatory again
function SudokuSquare(value=null){
    this.value=value,
    this.possValuesForSquare=[]
};

function deepCopyArray(inputArray){
    return JSON.parse(JSON.stringify(inputArray));
}
//creates a matrix...pretty self explanatory
const generateMatrix = (width,height,fillValue=null) => {
    const matrix = [];
    while(height--){
        matrix.push(new Array(width).fill(fillValue));
    }
    return matrix;
};

const DOMSudoku = document.getElementById("sudoku");
const renderMatrixToDOM = () => {
    const matrix = generateMatrix(9,9,new SudokuSquare());
    for(let i=0;i<matrix.length;i++){
        const DOMSudokuRow = document.createElement("tr");
        for(let j=0;j<matrix[i].length;j++){
            const id=i.toString()+j.toString();
            const tdElement=document.createElement("td");
            tdElement.setAttribute("id",id);
            tdElement.contentEditable = true;
            //tdElement.innerHTML=id;
            DOMSudokuRow.appendChild(tdElement);
        }
        DOMSudokuRow.classList.add("row"+i.toString());
        DOMSudoku.appendChild(DOMSudokuRow);
    }
    return matrix;
}
//draws the borders of the sudoku board on the canvas, I opt for canvas here because it's fun to fool with and getting it working like
//this allows me to go in again in the future to add background effects and whatnot, and generally gives me a playground.
const drawMatrixBorders = () => {
    canvas.width=window.innerWidth;
    canvas.height=window.innerHeight;
    const matrix = renderMatrixToDOM();
    const sudokuCoords = document.getElementById("sudoku").getBoundingClientRect();
    const sudokuCellCoords = document.getElementById("00").getBoundingClientRect();
    const sudokuCellWidth = sudokuCellCoords.width;
    console.log(sudokuCoords);
    console.log(sudokuCellCoords);
    ctx.strokeStyle="rgba(0,0,0,1)";
    ctx.lineWidth=4;
    ctx.strokeRect(sudokuCoords.left,sudokuCoords.top,sudokuCoords.width,sudokuCoords.height);
    ctx.lineWidth=2.5;
    ctx.beginPath();
    ctx.moveTo(sudokuCoords.left+3*sudokuCellWidth,sudokuCoords.top);
    ctx.lineTo(sudokuCoords.left+3*sudokuCellWidth,sudokuCoords.bottom);
    ctx.moveTo(sudokuCoords.right-3*sudokuCellWidth,sudokuCoords.top);
    ctx.lineTo(sudokuCoords.right-3*sudokuCellWidth,sudokuCoords.bottom);
    ctx.moveTo(sudokuCoords.left,sudokuCoords.top+3*sudokuCellWidth);
    ctx.lineTo(sudokuCoords.right,sudokuCoords.top+3*sudokuCellWidth);
    ctx.moveTo(sudokuCoords.left,sudokuCoords.bottom-3*sudokuCellWidth);
    ctx.lineTo(sudokuCoords.right,sudokuCoords.bottom-3*sudokuCellWidth);
    ctx.stroke();
    return matrix;
}


const sudoku = drawMatrixBorders();

//getRows getCols and getGrid all exist because...well, I wanted to deal with smaller bites of the puzzle when doing compares
//overall, they didnt take long to write at all and made figuring out the base algorithm pretty easy as I didnt stumble over syntax and logic
//errors left and right.
function getRows(matrixToRows){
    const result=[];
    for(let i=0;i<matrixToRows.length;i++){
        const rowInProgress = [];
        for(let j=0;j<matrixToRows[0].length;j++){
            if(matrixToRows[i][j].value===null) rowInProgress.push(0);
            else rowInProgress.push(matrixToRows[i][j].value);
        }
        result.push(rowInProgress);
    }
    return result;
};

function getCols(matrixToCols){
    const result = [];
    for(let i=0;i<matrixToCols[0].length;i++){
        const colInProgress = [];
        for(let j=0;j<matrixToCols.length;j++){
            if(matrixToCols[j][i].value===null) colInProgress.push(0);
            else colInProgress.push(matrixToCols[j][i].value);
        }
        result.push(colInProgress);
    }
    return result;
};

function getGrid(matrixToGrid){
    const result = generateMatrix(baseRoot,baseRoot);
    for(let i=0;i<matrixToGrid.length;i+=baseRoot){
        for(let j=0;j<matrixToGrid[i].length;j+=baseRoot){
            const gridInProgress = [];
            for(let k=0;k<(matrixToGrid.length/baseRoot);k++){
                for(let l=0;l<(matrixToGrid[i+k].length/baseRoot);l++){
                    if(matrixToGrid[i+k][j+l].value===null) gridInProgress.push(0);
                    else gridInProgress.push(matrixToGrid[i+k][j+l].value);
                }
            }
            result[i/baseRoot][j/baseRoot]=gridInProgress;
        }
    }
    return result;
};
//these both solve for the missing values in a missing array or matrix. I opt for .toString().includes() here because 1, it looks clean
//and 2, it works. 
function missingValues(inputArray){
    const result = [];
    for(let i=0;i<inputArray.length;i++){
        const missingValues = [];
        for(let j=1;j<base;j++){
            if(inputArray[i].includes(j)) continue;
            else missingValues.push(j);
        }
        result.push(missingValues);
    }
    return result;
};

function missingValuesGrid(inputMatrix){
    const result = generateMatrix(baseRoot,baseRoot);
    for(let i=0;i<inputMatrix.length;i++){
        for(let j=0;j<inputMatrix[i].length;j++){
            const matrixInProgress = [];
            for(let k=1;k<base;k++){
                if(inputMatrix[i][j].includes(k)) continue;
                else matrixInProgress.push(k);
            }
            result[i][j]=matrixInProgress;
        }
    }
    return result;
};

//these all convert from 1 data type to another, or pull data from the DOM into a matrix. Little bite size pieces of code I can chain
//together to get whatever data type I want pretty quickly. I initially made a few of these for debugging, but ended up liking the approach
//so I just rolled with it and made them integral to my GUI.
function matrixToDom(inputMatrixizedSudoku){
    for(let i=0;i<inputMatrixizedSudoku.length;i++){
        for(let j=0;j<inputMatrixizedSudoku[i].length;j++){
            const id=i.toString()+j.toString();
            const element = document.getElementById(id);
            element.innerHTML=inputMatrixizedSudoku[i][j];
        }
    }
}

function domToMatrix(){
    const matrix=generateMatrix(9,9);
    for(let i=0;i<matrix.length;i++){
        for(let j=0;j<matrix[i].length;j++){
            const id=i.toString()+j.toString();
            const element = document.getElementById(id);
            const elementInner = parseInt(element.innerHTML,10);
            if(typeof elementInner === "number" && elementInner>0 && elementInner<10) matrix[i][j]=elementInner;
            else matrix[i][j]=null;
        }
    }
    return matrix;
}

function matrixToSudoku(inputMatrix){
    const newSudoku = [];
    for(let i=0;i<inputMatrix.length;i++){
        const newRow = [];
        for(let j=0;j<inputMatrix[i].length;j++){
            const newSudokuSquare= new SudokuSquare(inputMatrix[i][j]);
            newRow.push(newSudokuSquare);
        }
        newSudoku.push(newRow);
    }
    return newSudoku;
}

//for tabling matrix easily
function sudokuToMatrix(inputSudoku){
    const result = [];
    for(let i=0;i<inputSudoku.length;i++){
        const rowToPush=[];
        for(let j=0;j<inputSudoku[i].length;j++){
            if(inputSudoku[i][j].value===null) rowToPush.push('-');
            else rowToPush.push(inputSudoku[i][j].value);
        }
        result.push(rowToPush);
    }
    return result;
}

function compareRowCol(rowArray,colArray,inputSudoku){
    for(let i=0;i<inputSudoku.length;i++){
        for(let j=0;j<inputSudoku[i].length;j++){
            const rowColComposite=[];
            //k and l track position in possRowValues array(k) and possColValues array(l)
            //perform comparison of possRowValues(i: position on sudoku/k: position in array of possible) and possColValues(j/l), 
            //store any that match to inputSudoku[i][j].possValuesForSquare 
            if(inputSudoku[i][j].value===null){
                for(let k=0;k<rowArray[i].length;k++){
                    for(let l=0;l<colArray[j].length;l++){
                        if(rowArray[i][k]===colArray[j][l]) rowColComposite.push(rowArray[i][k]);
                    }
                }
                inputSudoku[i][j].possValuesForSquare=rowColComposite;
            }
        }
    }
}

function compareRowColGrid(gridArray,inputSudoku){
    for(let i=0;i<inputSudoku.length;i++){
        for(let j=0;j<inputSudoku[i].length;j++){
            const totalComposite=[];
            const translatedGridPositionArray = gridArray[Math.floor(i/baseRoot)][Math.floor(j/baseRoot)];
            //compare inputSudoku[i][j] to possGridValues array
            //if i<3 and j<3 compare to possGridValues[0][0]
            //if i=5 and j=5 compare to possGridValues[1][1] possGridValues[Math.floor(i/baseRoot)][Math.floor(j/baseRoot)]
            if(inputSudoku[i][j].value===null){
                for(let k=0;k<translatedGridPositionArray.length;k++){
                    for(let l=0;l<inputSudoku[i][j].possValuesForSquare.length;l++){
                        if(translatedGridPositionArray[k]===inputSudoku[i][j].possValuesForSquare[l]){
                        totalComposite.push(translatedGridPositionArray[k]);
                        }   
                    }
                }
                inputSudoku[i][j].possValuesForSquare=totalComposite;
            }   
        }
    }
}

function determinePossibles(inputSudoku){
    const possRowValues=missingValues(getRows(inputSudoku));
    const possColValues=missingValues(getCols(inputSudoku));
    const possGridValues=missingValuesGrid(getGrid(inputSudoku));
    compareRowCol(possRowValues,possColValues,inputSudoku);
    compareRowColGrid(possGridValues,inputSudoku);
    //logPossValues(inputSudoku); 
}

function logPossValues(inputSudoku,showEmpty=false){
    for(let i=0;i<inputSudoku.length;i++){
        for(let j=0;j<inputSudoku[i].length;j++){
            if(!showEmpty && inputSudoku[i][j].possValuesForSquare.length===0) continue;
            console.log(`pos:${i},${j}`);
            console.log(inputSudoku[i][j].possValuesForSquare);
        }
    }
}

function findSeenOnce(i,j,inputSudoku){
    const seenOnce = [];
    const seenMoreThanOnce = [];
    for(let k=0;k<Math.floor(inputSudoku.length/baseRoot);k++){
        for(let l=0;l<Math.floor(inputSudoku[i+k].length/baseRoot);l++){
            if(inputSudoku[i+k][j+l].value!==null) continue;
            for(let m=0;m<inputSudoku[i+k][j+l].possValuesForSquare.length;m++){
                //temp variable holding value of current position in possValuesForSquare array, for easier to read code
                const valueToCheck = inputSudoku[i+k][j+l].possValuesForSquare[m];
                //first if checks if seen once includes the value in question, if so, it pushes that value to seenMoreThanOnce and 
                //removes it from seenOnce, enabling us to track singleton possibilities
                if(!seenMoreThanOnce.includes(valueToCheck)){
                    if(seenOnce.includes(valueToCheck)){
                        seenMoreThanOnce.push(valueToCheck);
                        seenOnce.splice(seenOnce.indexOf(valueToCheck),1);
                    } else {
                        seenOnce.push(valueToCheck);
                    }
                }
            }
        }
    }
    return seenOnce;
}

function evaluateSeenOnce(i,j,seenOnce,inputSudoku){
    let valueFound=false;
    if(seenOnce.length>0){
        for(let k=0;k<Math.floor(inputSudoku.length/baseRoot);k++){
            for(let l=0;l<Math.floor(inputSudoku[i+k].length/baseRoot);l++){
                for(let m=0;m<inputSudoku[i+k][j+l].possValuesForSquare.length;m++){
                    for(let n=0;n<seenOnce.length;n++){
                        if(inputSudoku[i+k][j+l].possValuesForSquare.includes(seenOnce[n])&&inputSudoku[i+k][j+l].value===null){
                            inputSudoku[i+k][j+l].value=seenOnce[n];
                            inputSudoku[i+k][j+l].possValuesForSquare=[];
                            valueFound = true;
                            seenOnce.splice(n,1);
                            determinePossibles(inputSudoku);
                        }
                    }
                }
            }
        }
    }
    return valueFound;
}

function evaluateMissing(inputSudoku){
    //looks at poss values for singleton possible values in a square, and stores those to .value 
    let valueFound = false;
    for(let i=0;i<inputSudoku.length;i++){
        for(let j=0;j<inputSudoku.length;j++){
            if(inputSudoku[i][j].possValuesForSquare.length===1&&inputSudoku[i][j].value===null){
                inputSudoku[i][j].value=inputSudoku[i][j].possValuesForSquare[0];
                inputSudoku[i][j].possValuesForSquare=[];
                determinePossibles(inputSudoku);
                valueFound = true;
            }
        }
    }
    //evaluates each grid, comparing possible values for each square, if any is only possible in a single square, stores that to .value
    for(let i=0;i<inputSudoku.length;i+=baseRoot){
        for(let j=0;j<inputSudoku[i].length;j+=baseRoot){
            const seenOnce = findSeenOnce(i,j,inputSudoku);
            valueFound = evaluateSeenOnce(i,j,seenOnce,inputSudoku);
        }
    }
    return valueFound;
}
//checks for a missing value in all rows, cols and grids. iff none, you're done! There is probably a better way to do this? I'd be curious
//to know.
const isSolved = (inputSudoku) => {
    const rowMissing=missingValues(getRows(inputSudoku));
    const colMissing=missingValues(getCols(inputSudoku));
    const gridMissing=missingValuesGrid(getGrid(inputSudoku));
    for(let i=0;i<rowMissing.length;i++){
        if(rowMissing[i].length!=0||colMissing[i].length!=0) {
            console.log('row or col missing values');
            return false;
        }
    }
    for(let i=0;i<gridMissing.length;i++){
        for(let j=0;j<gridMissing[i].length;j++){
            if(gridMissing[i][j].length!=0) {
                console.log('grid missing value');
                return false;
            }
        }
    }
    return true;
}

function simpleSolver(inputSudoku){
    let countWithoutChanges = 0;
    const maxCount = 5;
    let solved = false;
    while(!solved&&countWithoutChanges<maxCount){
        determinePossibles(inputSudoku);
        if(evaluateMissing(inputSudoku)){
            countWithoutChanges=0;
        } else {
            countWithoutChanges++;
        }
        solved = isSolved(inputSudoku);
    }
    return solved;
}


let branched = false;
function branch(sudokuToBranch){
    console.log(`called branch`);
    let shortest=sudokuToBranch[0][0];
    let shortestXPos=0;
    let shortestYPos=0;
    for(let i=0;i<sudokuToBranch.length;i++){
        for(let j=0;j<sudokuToBranch[i].length;j++){
            if(sudokuToBranch[i][j].possValuesForSquare.length<2||sudokuToBranch[i][j].value!==null){
                continue;
            } 
            if(shortest.possValuesForSquare.length===0){
                shortest = JSON.parse(JSON.stringify(sudokuToBranch[i][j]));
                shortestXPos = i;
                shortestYPos = j;
            } else if(shortest.possValuesForSquare.length>sudokuToBranch[i][j].possValuesForSquare.length){
                shortest = JSON.parse(JSON.stringify(sudokuToBranch[i][j]));
                shortestXPos = i;
                shortestYPos = j;
            } 
        }
    }
    if(shortest.possValuesForSquare.length>1){
        for(let i=0;i<shortest.possValuesForSquare.length;i++){
            const branchedSudoku = deepCopyArray(sudokuToBranch);
            branchedSudoku[shortestXPos][shortestYPos].value=shortest.possValuesForSquare[i];
            branchedSudoku[shortestXPos][shortestYPos].possValuesForSquare=[];
            stack.push(branchedSudoku);
            branched=true;
        }
        return true;
    } else return false;
    /*for(let i=0;i<shortest.possValuesForSquare.length;i++){
        if(i===0) console.log(`shortest: ${shortest.possValuesForSquare} branch Pos: x:${shortestXPos}, y:${shortestYPos}`);
        console.log(`branch ${i+1}: ${shortest.possValuesForSquare[i]}`);
    }*/
}

/*
branched is a variable that tracks whether or not the original puzzle was branched already. If the puzzle was branched and you've exhausted 
all possible branches originating from that first branch, we return the current sudoku in progress in defeat.

if the stack is empty and the original puzzle was not yet branched, we initialize the stack by calling branch(which fills the stack)

if the stack is not empty we pop the first branch off the top and evaluate it using simple solver, if it is solved successfully, we return 
the branched sudoku in success. Otherwise, we call branch on current branch, and if it finds a suitable branch, we evaluate that. If it 
cannot find a suitable branch, we pop a new value off of the stack and begin evaluating that.
*/
let currentBranch;
function handleBranches(inputSudoku,branchPossible=true){
    if(stack.length===0&&branched&&!branchPossible) {
        console.log(`first`);
        return inputSudoku;
    }
    if(stack.length===0&&!branched) {
        if(!branch(inputSudoku)) {
            console.log(`second`);
            return inputSudoku;
        }
    } 
    if(stack.length>0){
        currentBranch = stack.pop();
        console.table(stack);
        if(simpleSolver(currentBranch)) {
            console.log(`third`);
            return currentBranch;
        }
        else {
            branchPossible = branch(currentBranch);
            console.table(sudokuToMatrix(currentBranch));
            handleBranches(currentBranch,branchPossible); 
        }
    }
}

//well, the name is a bit...OK. So, initially my intention was to call init to set initial board state, then call another function called
//solve to well...solve the puzzle. But then I realized init as written(with only a few additions, namely a while loop and a few other minor 
//tweaks), would solve the puzzle. So i just rolled with it, and kept the name as a reminder that things dont always go to plan.
const init = (inputSudoku) => {
    let isSolved = simpleSolver(inputSudoku);
    if(isSolved){
        matrixToDom(sudokuToMatrix(inputSudoku));  
        console.table(sudokuToMatrix(inputSudoku));  
    } else {
        handleBranches(inputSudoku);
        matrixToDom(sudokuToMatrix(currentBranch));
        console.table(sudokuToMatrix(currentBranch));
    }
    //logPossValues(inputSudoku,false);
};

function debugDuplicates(value,inputSudoku,i,j){
    const rowValues = getRows(inputSudoku);
    const colValues = getCols(inputSudoku);
    const gridValues = getGrid(inputSudoku);
    const containedRow = rowValues[i].includes(value);
    const containedCol = colValues[j].includes(value);
    const containedGrid = gridValues[Math.floor(i/baseRoot)][Math.floor(j/baseRoot)].includes(value);
    if(containedRow) console.log(`row:${i}`);
    if(containedCol) console.log(`col:${j}`);
    if(containedGrid) console.log(`grid: ${Math.floor(i/baseRoot)} ${Math.floor(j/baseRoot)}`);
    if(containedRow || containedCol || containedGrid) return true;
    else return false;
}

//sudoku/sudoku1/sudoku2
const whichSudokuAmISolving = sudoku;
if(whichSudokuAmISolving !== sudoku) matrixToDom(sudokuToMatrix(whichSudokuAmISolving));

//it's a button...
const button = document.getElementById("button");
button.addEventListener("click", (e) => {
    if(whichSudokuAmISolving===sudoku){
        let toSolveMatrix=domToMatrix();
        let toSolveSudoku=matrixToSudoku(toSolveMatrix);
        init(toSolveSudoku);
    } else {
        init(whichSudokuAmISolving);
    }
    
});
});