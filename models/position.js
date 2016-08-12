class Position {
  constructor(x, y){
    this.x = parseInt(x);
    this.y = parseInt(y);
  }
  getRow(){
    return this.y;
  };
  getColumn(){
    return this.x;
  };
  outOfBounds(){
    return this.x < 1 || this.x > 8 || this.y < 1 || this.y > 8;
  }
  getNotation(){
      let columns = ['a','b','c', 'd', 'e', 'f','g','h'];
      return columns[this.x-1]+this.y;
  }
}

module.exports = Position;
