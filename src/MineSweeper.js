import React from 'react';

function checkIfAllNoneMineCellsAreVisible(cells){
  // if one cell that hs not got a mine and is not visible is found then return false
  if(cells.some(cell => cell.hasMine === false && cell.visible === false)){console.log('FALSE')
    return false;
  }
  console.log('GAME WON');
  return true;
}

class MineSweeper extends React.Component{
  constructor(props){
    super(props);

    // props will be widthLength, heightLenth, mineCount
    // cell number will not change so does not need to be within state
    this.cellNumber = props.widthLength * props.heightLength;
    let width = props.widthLength;

    // to constructor
    // 1) make widthLength * heightLength ammount of default cells
    // 2) randomly assign mineCount worth of mines
    // 3) count the adjacent mines on every cell and set adjacentMineCount value
    let cells = new Array(this.cellNumber).fill(null).map((value, index) => this._createDefaultCell(index));
    
    // make an array of the non mine cells. As the cells are populated with mines, this list will get shorter
    let nonMineCells = cells.slice();

    for(let i = 0; i < props.mineCount;i++){
      let nextMine = nonMineCells[Math.floor(Math.random() * nonMineCells.length)];
      
      nextMine.hasMine = true;
      
      // remove this from non mine cell list
      nonMineCells = nonMineCells.filter(cell => cell.hasMine === false);
    
      // if we have ran out of cells then stop here
      if(nonMineCells.length === 0) break;
    }

    // count adjacent mines
    cells.forEach(cell => {
      cell.adjacentMineCount = this._getAdjacentCells(cells, cell).filter(adjacentCell => adjacentCell.hasMine).length;
    })

    this.state = {
      gameComplete: false,
      cells: cells
    };
  }

  _createDefaultCell(index){
    return {
      index: index,
      hasMine: false,
      visible: false,
      adjacentMineCount: 0
    }
  }

  _getAdjacentCells(cells, cell){
    let width = this.props.widthLength;
    let adjacentIndexOffsetList = [-width - 1, -width, -width + 1, -1, 1, width - 1, width, width + 1];
    let adjacentCellIndexList = adjacentIndexOffsetList.map(indexOffset => cell.index + indexOffset);

    return adjacentCellIndexList.map(index => cells[index]).filter(adjacentCell => adjacentCell);
  }

  _mineClick(){
    console.log('GAME LOST')
    
    // display all cells
    let cells = this.state.cells.map(cell => Object.assign({}, cell, {visible: true}));

    this.setState({
      gameComplete: true,
      cells: cells
    })
  }

  _openAdjacentCells(index){
    
    let cells = this.state.cells.map(cell => Object.assign({}, cell));
    let cell = cells.find(cell => cell.index === index);

    let checkedCells = [];
    let cellsToMakeVisible = [];

    const processCell = (thisCell) => {
      checkedCells.push(thisCell);
      cellsToMakeVisible.push(thisCell);

      let adjacentCells = this._getAdjacentCells(cells, thisCell);

      // add any non blank cells
      adjacentCells
        .filter(adjacentCell => adjacentCell.adjacentMineCount > 0)
        .forEach(adjacentCell => cellsToMakeVisible.push(adjacentCell));

      // run this function recursivly on any blank cell that has not already been checked
      adjacentCells
        .filter(adjacentCell => adjacentCell.adjacentMineCount === 0)
        .filter(blankCell => !checkedCells.some(checkedCell => checkedCell.index === blankCell.index))
        .forEach(blankCell => processCell(blankCell));
    };

    processCell(cell);

    cellsToMakeVisible.forEach(c => c.visible = true);

    this.setState({
      gameComplete: checkIfAllNoneMineCellsAreVisible(cells, cell),
      cells: cells
    })
  }

  _showCell(index){

    // clone the cell array
    let cells = this.state.cells.map(cell => Object.assign({}, cell));
    
    // find this cell and set it to visible
    let cell = cells.find(cell => cell.index === index);
    cell.visible = true;

    this.setState({
      gameComplete: checkIfAllNoneMineCellsAreVisible(cells),
      cells: cells
    });
  }

  _cellOnClick(index){

    if(this.state.gameComplete) return;

    let cell = this.state.cells.find(cell => cell.index === index);

    // if we have already been clicked on then stop here
    if(cell.visible) return;

    // procedure here:
    // 1) if mine then show all mines and set came to complete
    // 2) if not mine and adjacentMineCount === 0, open with all adjacent cells
    // 3) if not mine and adjacentMineCount > 0, open and show number
    // 4) Finaly check for none mine cells that have not been opened. If there are none, the player has won.

    // 1) mine click
    if(cell.hasMine) {
      return this._mineClick();
    }

    // 2) open adjacent cells
    if(cell.adjacentMineCount === 0){
      return this._openAdjacentCells(cell.index);
    }

    // 3) show this cell
    this._showCell(cell.index);
  }

  _lastCellInRow(index){

    if((index % this.props.widthLength) + 1 === this.props.widthLength) return true;

    return false;
  }

  _buildCellElement(cell){

    let visibleClass;

    // set the visible class depending on the current state of the cell
    if(cell.visible === false){
      visibleClass = 'closed';
    } else if(cell.hasMine){
      visibleClass = 'mine';
    } else if(cell.adjacentMineCount > 0) {
      visibleClass = 'open';
    } else {
      visibleClass = 'blank';
    }

    let content;
    if(!cell.visible){
      content = ''
    } else if(cell.hasMine){
      content = 'X'
    } else if(cell.adjacentMineCount === 0){
      content = '';
    } else {
      content = cell.adjacentMineCount;
    }

    return (
      <div key={cell.index} className={`cell ${visibleClass}`} onClick={ ()=> this._cellOnClick(cell.index)}>
        {content}
      </div>
    );
  }

  render(){

    // build an array to hold each row
    let rowList = new Array(this.props.heightLength).fill(null).map(()=>[]);

    for(let i = 0; i < this.state.cells.length;i++){
      let cell = this.state.cells[i];

      let rowIndex = Math.floor(i / this.props.widthLength);

      // build the element
      cell = this._buildCellElement(cell);
      
      // push onto row list
      rowList[rowIndex].push(cell)
    }

    // wrapp rows into elements
    rowList = rowList.map((row, row_i) => (
      <div className='row' key={`row_${row_i}`}>{row}</div>
    ))
    
    return (
    <div>
      <div className='board'>{rowList}</div>
      <div></div>
    </div>
    )
  }
}

export default MineSweeper;