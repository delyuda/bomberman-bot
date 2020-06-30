/*-
 * #%L
 * Codenjoy - it's a dojo-like platform from developers to developers.
 * %%
 * Copyright (C) 2018 Codenjoy
 * %%
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public
 * License along with this program.  If not, see
 * <http://www.gnu.org/licenses/gpl-3.0.html>.
 * #L%
 */

// TODO test me

var util = require('util');
var WSocket = require('ws');

var log = function(string) {
    console.log(string);
    if (!!printBoardOnTextArea) {
        printLogOnTextArea(string);
    }
};

var printArray = function (array) {
   var result = [];
   for (var index in array) {
       var element = array[index];
       result.push(element.toString());
   }
   return "[" + result + "]";
};

var processBoard = function(boardString) {
    console.time('get Direction Time');
    var board = new Board(boardString);
        if (!!printBoardOnTextArea) {
        printBoardOnTextArea(board.boardAsString());
    }
    let theBoard = new TheBoard(boardString);
        console.log('theBoard',theBoard)

    // var logMessage = board + "\n\n";
    var answer = new DirectionSolver(board, theBoard).get();
    console.timeEnd('get Direction Time');
    // logMessage += "Answer: " + answer + "\n";
    // logMessage += "-----------------------------------\n";
    
    // log(logMessage);
    console.log("Answer: " + answer + "\n-----------------------------------\n");

    return answer;
};

// you can get this code after registration on the server with your email
// var url = "http://codenjoy.com:80/codenjoy-contest/board/player/3edq63tw0bq4w4iem7nb?code=12345678901234567890";
var url="https://botchallenge.cloud.epam.com/codenjoy-contest/board/player/i2t2233nlgu3jegckthq?code=8512134930438622509";

url = url.replace("http", "ws");
url = url.replace("board/player/", "ws?user=");
url = url.replace("?code=", "&code=");

var ws;

function connect() {
    ws = new WSocket(url);
    log('Opening...');

    ws.on('open', function() {
        log('Web socket client opened ' + url);
    });

    ws.on('close', function() {
        log('Web socket client closed');

        setTimeout(function() {
            connect();
        }, 5000);
    });

    ws.on('message', function(message) {
        var pattern = new RegExp(/^board=(.*)$/);
        var parameters = message.match(pattern);
        var boardString = parameters[1];
        var answer = processBoard(boardString);
        ws.send(answer);
    });
}

connect();

var Element = {
    /// This is your Bomberman
    BOMBERMAN : '☺',             // this is what he usually looks like
    BOMB_BOMBERMAN : '☻',        // this is if he is sitting on own bomb
    DEAD_BOMBERMAN : 'Ѡ',        // oops, your Bomberman is dead (don't worry, he will appear somewhere in next move)
                                 // you're getting -200 for each death

    /// this is other players Bombermans
    OTHER_BOMBERMAN : '♥',       // this is what other Bombermans looks like
    OTHER_BOMB_BOMBERMAN : '♠',  // this is if player just set the bomb
    OTHER_DEAD_BOMBERMAN : '♣',  // enemy corpse (it will disappear shortly, right on the next move)
                                 // if you've done it you'll get +1000

    /// the bombs
    BOMB_TIMER_5 : '5',          // after bomberman set the bomb, the timer starts (5 tacts)
    BOMB_TIMER_4 : '4',          // this will blow up after 4 tacts
    BOMB_TIMER_3 : '3',          // this after 3
    BOMB_TIMER_2 : '2',          // two
    BOMB_TIMER_1 : '1',          // one
    BOOM : '҉',                  // Boom! this is what is bomb does, everything that is destroyable got destroyed

    /// walls
    WALL : '☼',                  // indestructible wall - it will not fall from bomb
    DESTROYABLE_WALL : '#',      // this wall could be blowed up
    DESTROYED_WALL : 'H',        // this is how broken wall looks like, it will dissapear on next move
                                 // if it's you did it - you'll get +10 points.

    /// meatchoppers
    MEAT_CHOPPER : '&',          // this guys runs over the board randomly and gets in the way all the time
                                 // if it will touch bomberman - it will die
                                 // you'd better kill this piece of ... meat, you'll get +100 point for it
    DEAD_MEAT_CHOPPER : 'x',     // this is chopper corpse

    /// perks
    BOMB_BLAST_RADIUS_INCREASE : '+', // Bomb blast radius increase. Applicable only to new bombs. The perk is temporary.
    BOMB_COUNT_INCREASE : 'c',   // Increase available bombs count. Number of extra bombs can be set in settings. Temporary.
    BOMB_REMOTE_CONTROL : 'r',   // Bomb blast not by timer but by second act. Number of RC triggers is limited and can be set in settings.
    BOMB_IMMUNE : 'i',

    /// a void
    NONE : ' '                  // this is the only place where you can move your Bomberman
};

var D = function(index, dx, dy, name){

    var changeX = function(x) {
        return x + dx;
    };

    var changeY = function(y) {
        return y + dy;
    };

    var inverted = function() {
        switch (this) {
            case Direction.UP : return Direction.DOWN;
            case Direction.DOWN : return Direction.UP;
            case Direction.LEFT : return Direction.RIGHT;
            case Direction.RIGHT : return Direction.LEFT;
            default : return Direction.STOP;
        }
    };

    var toString = function() {
        return name;
    };

    return {
        changeX : changeX,

        changeY : changeY,

        inverted : inverted,

        toString : toString,

        getIndex : function() {
            return index;
        }
    };
};

var Direction = {
    UP : D(2, 0, 1, 'up'),                 // you can move
    DOWN : D(3, 0, -1, 'down'),
    LEFT : D(0, -1, 0, 'left'),
    RIGHT : D(1, 1, 0, 'right'),
    ACT : D(4, 0, 0, 'act'),                // drop bomb
    STOP : D(5, 0, 0, '')                   // stay
};

Direction.values = function() {
   return [Direction.UP, Direction.DOWN, Direction.LEFT, Direction.RIGHT, Direction.ACT, Direction.STOP];
};

Direction.valueOf = function(index) {
    var directions = Direction.values();
    for (var i in directions) {
        var direction = directions[i];
        if (direction.getIndex() == index) {
             return direction;
        }
    }
    return Direction.STOP;
};

var Point = function (x, y) {
    return {
        equals : function (o) {
            return o.getX() == x && o.getY() == y;
        },

        toString : function() {
            return '[' + x + ',' + y + ']';
        },

        isOutOf : function(boardSize) {
            return x >= boardSize || y >= boardSize || x < 0 || y < 0;
        },

        getX : function() {
            return x;
        },

        getY : function() {
            return y;
        }
    }
};

var pt = function(x, y) {
    return new Point(x, y);
};

var LengthToXY = function(boardSize) {
    function inversionY(y) {
        return boardSize - 1 - y;
    }

    function inversionX(x) {
        return x;
    }

    return {
        getXY : function(length) {
            if (length == -1) {
                return null;
            }
            var x = inversionX(length % boardSize);
            var y = inversionY(Math.trunc(length / boardSize));
            return new Point(x, y);
        },

        getLength : function(x, y) {
            var xx = inversionX(x);
            var yy = inversionY(y);
            return yy*boardSize + xx;
        }
    };
};

var Board = function(board){
    var contains  = function(a, obj) {
        var i = a.length;
        while (i--) {
           if (a[i].equals(obj)) {
               return true;
           }
        }
        return false;
    };

    var removeDuplicates = function(all) {
        var result = [];
        for (var index in all) {
            var point = all[index];
            if (!contains(result, point)) {
                result.push(point);
            }
        }
        return result;
    };

    var boardSize = function() {
        return Math.sqrt(board.length);
    };

    var size = boardSize();
    var xyl = new LengthToXY(size);

    var getBomberman = function() {
        var result = [];
        result = result.concat(findAll(Element.BOMBERMAN));
        result = result.concat(findAll(Element.BOMB_BOMBERMAN));
        result = result.concat(findAll(Element.DEAD_BOMBERMAN));
        return result[0];
    };

    var getOtherBombermans = function() {
        var result = [];
        result = result.concat(findAll(Element.OTHER_BOMBERMAN));
        result = result.concat(findAll(Element.OTHER_BOMB_BOMBERMAN));
        result = result.concat(findAll(Element.OTHER_DEAD_BOMBERMAN));
        return result;
    };

    var isMyBombermanDead = function() {
        return board.indexOf(Element.DEAD_BOMBERMAN) != -1;
    };

    var isMyBombermanBomb = function() {
        return board.indexOf(Element.BOMB_BOMBERMAN) != -1;
    };

    var isAt = function(x, y, element) {
       if (pt(x, y).isOutOf(size)) {
           return false;
       }
       return getAt(x, y) == element;
    };

    var getAt = function(x, y) {
        if (pt(x, y).isOutOf(size)) {
           return Element.WALL;
        }
        return board.charAt(xyl.getLength(x, y));
    };

    var boardAsString = function() {
        var result = "";
        for (var i = 0; i < size; i++) {
            result += board.substring(i * size, (i + 1) * size);
            result += "\n";
        }
        return result;
    };

    var getBarriers = function() {
        var all = getMeatChoppers();
        all = all.concat(getWalls());
        all = all.concat(getBombs());
        all = all.concat(getDestroyWalls());
        all = all.concat(getOtherBombermans());
        all = all.concat(getFutureBlasts());
        return removeDuplicates(all);
    };

    var toString = function() {
        return util.format("%s\n" +
            "Bomberman at: %s\n" +
            "Other bombermans at: %s\n" +
            "Meat choppers at: %s\n" +
            "Destroy walls at: %s\n" +
            "Bombs at: %s\n" +
            "Blasts: %s\n" +
            "Expected blasts at: %s\n" +
            "Perks at: %s",
                boardAsString(),
                getBomberman(),
                printArray(getOtherBombermans()),
                printArray(getMeatChoppers()),
                printArray(getDestroyWalls()),
                printArray(getBombs()),
                printArray(getBlasts()),
                printArray(getFutureBlasts()),
                printArray(getPerks())
                );
    };

    var getMeatChoppers = function() {
       return findAll(Element.MEAT_CHOPPER);
    };

    var findAll = function(element) {
       var result = [];
       for (var i = 0; i < size*size; i++) {
           var point = xyl.getXY(i);
           if (isAt(point.getX(), point.getY(), element)) {
               result.push(point);
           }
       }
       return result;
   };

   var getWalls = function() {
       return findAll(Element.WALL);
   };

   var getDestroyWalls = function() {
       return findAll(Element.DESTROYABLE_WALL);
   };

   var getBombs = function() {
       var result = [];
       result = result.concat(findAll(Element.BOMB_TIMER_1));
       result = result.concat(findAll(Element.BOMB_TIMER_2));
       result = result.concat(findAll(Element.BOMB_TIMER_3));
       result = result.concat(findAll(Element.BOMB_TIMER_4));
       result = result.concat(findAll(Element.BOMB_TIMER_5));
       result = result.concat(findAll(Element.BOMB_BOMBERMAN));
       result = result.concat(findAll(Element.OTHER_BOMB_BOMBERMAN));       
       return result;
   };

   var getPerks = function() {
        var result = [];
        result = result.concat(findAll(Element.BOMB_BLAST_RADIUS_INCREASE));
        result = result.concat(findAll(Element.BOMB_COUNT_INCREASE));
        result = result.concat(findAll(Element.BOMB_REMOTE_CONTROL));
        result = result.concat(findAll(Element.BOMB_IMMUNE));
        return result;
   }

   var getBlasts = function() {
       return findAll(Element.BOOM);
   };

   var getFutureBlasts = function() {
       var bombs = getBombs();
       var result = [];
       for (var index in bombs) {
           var bomb = bombs[index];
           result.push(bomb);
           result.push(new Point(bomb.getX() - 1, bomb.getY())); // TODO to remove duplicate
           result.push(new Point(bomb.getX() + 1, bomb.getY()));
           result.push(new Point(bomb.getX()    , bomb.getY() - 1));
           result.push(new Point(bomb.getX()    , bomb.getY() + 1));
       }
       var result2 = [];
       for (var index in result) {
           var blast = result[index];
           if (blast.isOutOf(size) || contains(getWalls(), blast)) {
               continue;
           }
           result2.push(blast);
       }
       return removeDuplicates(result2);
   };

   var isAnyOfAt = function(x, y, elements) {
       for (var index in elements) {
           var element = elements[index];
           if (isAt(x, y,element)) {
               return true;
           }
       }
       return false;
   };

   var isNear = function(x, y, element) {
       if (pt(x, y).isOutOf(size)) {
           return false;
       }
       return isAt(x + 1, y, element) || // TODO to remove duplicate
              isAt(x - 1, y, element) || 
              isAt(x, y + 1, element) || 
              isAt(x, y - 1, element);
   };

   var isBarrierAt = function(x, y) {
       return contains(getBarriers(), pt(x, y));
   };

   var countNear = function(x, y, element) {
       if (pt(x, y).isOutOf(size)) {
           return 0;
       }
       var count = 0;
       if (isAt(x - 1, y    , element)) count ++; // TODO to remove duplicate
       if (isAt(x + 1, y    , element)) count ++;
       if (isAt(x    , y - 1, element)) count ++;
       if (isAt(x    , y + 1, element)) count ++;
       return count;
   };

    const profitElems = [
        Element.DESTROYABLE_WALL,
        Element.OTHER_BOMBERMAN,
        Element.OTHER_BOMB_BOMBERMAN,
        Element.MEAT_CHOPPER,
        Element.DEAD_MEAT_CHOPPER
    ];
   const checkHorizontal = (x,y,steps) => {
       let count = 0;
       let start = (x === 1 || isAt(x-1, y, Element.WALL)) ? 0 : steps*(-1);
       let end = (x === boardSize()-2 || isAt(x+1, y, Element.WALL)) ? 0 : steps;

       if (start === end) {
           return false;
       }

       for (let i=start; i<=end; i++) {
           if (isAnyOfAt(x+i,y, profitElems)) count++;
       }
       return count > 0;
   }
    const checkVertical = (x,y,steps) => {
        let count = 0;
        let start = (y === 1 || isAt(x, y-1, Element.WALL)) ? 0 : steps*(-1);
        let end = (y === boardSize()-2 || isAt(x, y+1, Element.WALL)) ? 0 : steps;

        if (start === end) {
            return false;
        }

        for (let i=start; i<=end; i++) {
            if (isAnyOfAt(x,y+i, profitElems)) count++;
        }
        return count > 0;
    }

   return {
        size : boardSize,
        getBomberman : getBomberman,
        getOtherBombermans : getOtherBombermans,
        isMyBombermanDead : isMyBombermanDead,
        isAt : isAt,
        boardAsString : boardAsString,
        getBarriers : getBarriers,
        toString : toString,
        getMeatChoppers : getMeatChoppers,
        findAll : findAll,
        getWalls : getWalls,
        getDestroyWalls : getDestroyWalls,
        getBombs : getBombs,
        getBlasts : getBlasts,
        getFutureBlasts : getFutureBlasts,
        isAnyOfAt : isAnyOfAt,
        isNear : isNear,
        isBarrierAt : isBarrierAt,
        countNear : countNear,
        getAt : getAt,
        getPerks: getPerks,
        checkHorizontal: checkHorizontal,
        checkVertical: checkVertical,
        isMyBombermanBomb: isMyBombermanBomb
   };
};

var random = function(n){
    return Math.floor(Math.random()*n);
};


// ------------------------------ my code here ------------------------
let direction = '';
let isBombSet = false;
let myBombs = [];
let perks = [];
let history = [];


const BLOCK_ELEMENTS = [
    Element.WALL,
    Element.DESTROYABLE_WALL,
    Element.BOMB_TIMER_5,
    Element.BOMB_TIMER_4,
    Element.BOMB_TIMER_3,
    Element.BOMB_TIMER_2,
    Element.BOMB_TIMER_1,
    Element.MEAT_CHOPPER,
    Element.DEAD_MEAT_CHOPPER,
    Element.OTHER_BOMB_BOMBERMAN,
    Element.OTHER_BOMBERMAN
];

const FREE_ELEMENTS = [
    Element.NONE,
    Element.BOMB_BLAST_RADIUS_INCREASE,
    Element.BOMB_COUNT_INCREASE,
    Element.BOMB_REMOTE_CONTROL,
    Element.BOMB_IMMUNE
];
const FREE_ELEMENTS_WITH_ME = [
    Element.NONE,
    Element.BOMB_BLAST_RADIUS_INCREASE,
    Element.BOMB_COUNT_INCREASE,
    Element.BOMB_REMOTE_CONTROL,
    Element.BOMB_IMMUNE,
    Element.BOMBERMAN,
    Element.BOMB_BOMBERMAN
];
const BOMB_ELEMENTS = [
    Element.BOMB_TIMER_5,
    Element.BOMB_TIMER_4,
    Element.BOMB_TIMER_3,
    Element.BOMB_TIMER_2,
    Element.BOMB_TIMER_1
];
const BOMB_BLOCK_ELEMENTS = [
    Element.WALL,
    Element.DESTROYABLE_WALL
];
const CHOPPERS_ELEMENTS = [
    Element.MEAT_CHOPPER,
    Element.DEAD_MEAT_CHOPPER
];
const PROFIT_ELEMENTS = [
    Element.DESTROYABLE_WALL,
    Element.OTHER_BOMBERMAN,
    Element.OTHER_BOMB_BOMBERMAN,
    Element.MEAT_CHOPPER,
    Element.DEAD_MEAT_CHOPPER
];
const STATIC_PROFIT_ELEMENTS = [
    Element.DESTROYABLE_WALL
];
const DYNAMIC_PROFIT_ELEMENTS = [
    Element.OTHER_BOMBERMAN,
    Element.OTHER_BOMB_BOMBERMAN,
    Element.MEAT_CHOPPER,
    Element.DEAD_MEAT_CHOPPER
]
const PERK_ELEMENTS = [
    Element.BOMB_BLAST_RADIUS_INCREASE,
    Element.BOMB_COUNT_INCREASE,
    Element.BOMB_REMOTE_CONTROL,
    Element.BOMB_IMMUNE
];
const FIRE_STEPS = 3;
const PERK_TIME = 30;
const PERK_CONTROL_COUNT = 3;

class TheBoard {
    constructor (boardString) {
        this.boardArr = this.parseToArr(boardString);
        this.printBoard(boardString);
        history.push(boardString);
    }

    parseToArr (boardString) {
        this.size = Math.sqrt(boardString.length);
        let regExp = new RegExp('.{'+this.size+'}', 'g');
        return boardString.match(regExp).reduceRight( (arr, item, i) => {
            arr.push(item.split(''));
            return arr;
        }, []);
    }

    printBoard (boardString) {
        this.size = Math.sqrt(boardString.length);
        let regExp = new RegExp('.{'+this.size+'}', 'g');
        let res = boardString.match(regExp).join('\n');

        console.log(res)
    }

    getBoardArr () {
        return this.boardArr;
    }

    isCellBlocked (x,y) {
        let points = [[x+1,y],[x-1,y],[x,y+1],[x,y-1]];
        let counter = 0;

        for (let i = 0; i < points.length; i++) {
            if (this.boardArr[points[i][1]] === undefined || this.boardArr[points[i][1]][points[i][0]] === undefined) {
                counter++;
                continue;
            }
            if (BLOCK_ELEMENTS.includes(this.boardArr[points[i][1]][points[i][0]])) counter++;
        }

        return counter >= 3;
    }

    getFreeDirections (x,y) {
        let res = [];
        if (FREE_ELEMENTS.includes(this.boardArr[y][x-1])) res.push('LEFT');
        if (FREE_ELEMENTS.includes(this.boardArr[y][x+1])) res.push('RIGHT');
        if (FREE_ELEMENTS.includes(this.boardArr[y+1][x])) res.push('UP');
        if (FREE_ELEMENTS.includes(this.boardArr[y-1][x])) res.push('DOWN');
        return res;
    }

    getHorizontalBombs (x,y) {
        let res = {
            isClear: true,
            elements: []
        };

        for (let j = -1; j <= 1; j = j+2) {
            for (let i = 1; i <= FIRE_STEPS; i++) {
                if (x + i*j < 0 || x + i*j > this.size - 1) continue;
                let el = this.boardArr[y][x + i*j];
                if (BOMB_BLOCK_ELEMENTS.includes(el)) {
                    break;
                }
                if (BOMB_ELEMENTS.includes(el)) {
                    res.isClear = false;
                    res.elements.push({
                        el: el,
                        position: [x + j*i, y]
                    });
                    break;
                }
            }
        }

        return res;
    }

    getVerticalBombs (x,y) {
        let res = {
            isClear: true,
            elements: []
        };

        for (let j = -1; j <= 1; j = j+2) {
            for (let i = 1; i <= FIRE_STEPS; i++) {
                if (y + i*j < 0 || y + i*j > this.size - 1) continue;
                let el = this.boardArr[y + i*j][x];
                if (BOMB_BLOCK_ELEMENTS.includes(el)) {
                    break;
                }
                if (BOMB_ELEMENTS.includes(el)) {
                    res.isClear = false;
                    res.elements.push({
                        el: el,
                        position: [x, y + i*j]
                    });
                    break;
                }
            }
        }

        return res;
    }

    getDangerousChoppers (x,y) {
        let res = {
            isClear: true,
            points: []
        };
        let points = [];

        if (x%2 !== 0 && y%2 !== 0) {
            points = [[x+1,y],[x-1,y],[x,y+1],[x,y-1]];
        }
        if (x%2 === 0) {
            points = [[x-1,y],[x+1,y]];
        }
        if (y%2 === 0) {
            points = [[x,y+1],[x,y-1]];
        }

        for (let i = 0; i < points.length; i++) {
            if (this.boardArr[points[i][1]] === undefined || this.boardArr[points[i][1]][points[i][0]] === undefined) {
                continue;
            }
            if (CHOPPERS_ELEMENTS.includes(this.boardArr[points[i][1]][points[i][0]])) {
                res.isClear = false;
                res.points.push(points[i]);
            }
        }

        return res;
    }

    countProfitAround (x,y) {
        let counter = 0;

        for (let k = 0; k <=1; k++) {
            for (let j = -1; j <= 1; j = j+2) {
                for (let i = 1; i <= FIRE_STEPS; i++) {
                    if (y + i*j < 0 || y + i*j > this.size - 1) continue;
                    let el = this.boardArr[y + i*j*k][x - i*j*(k - 1)];
                    if (el === Element.WALL) {
                        break;
                    }
                    if (PROFIT_ELEMENTS.includes(el)) {
                        counter++;
                        break;
                    }
                }
            }
        }

        return counter;
    }

}


var DirectionSolver = function(board, theBoard){

    const getInverted = (dir) => {
        switch (dir) {
            case 'UP' : return 'DOWN';
            case 'DOWN' : return 'UP';
            case 'LEFT' : return 'RIGHT';
            case 'RIGHT' : return 'LEFT';
            default : return '';
        }
    }

    const getRandomDir = (available = []) => {
        const n = 10;
        const k = random(n);
        const l = available.length;
        let newInd;
        for (let i = 0; i < l; i++) {
            if ( (k === 0 || k > Math.floor(n * i / l)) && (k === n || k <= Math.floor(n * (i + 1) / l)) ) {
                newInd = i;
                break;
            }
        }

        return available[newInd];
    }

    const getPriorityDir = (fromPoint, toPoint, available = []) => {
        let priorities = [];

        if (fromPoint[0] === toPoint[0] || Math.abs(fromPoint[0] - toPoint[0]) === 1) {
            priorities.push(fromPoint[1] - toPoint[1] > 0 ? 'DOWN' : 'UP');
        }
        if (fromPoint[1] === toPoint[1] || Math.abs(fromPoint[1] - toPoint[1]) === 1)  {
            priorities.push(fromPoint[0] - toPoint[0] > 0 ? 'LEFT' : 'RIGHT');
        }

        if (!priorities.length) {
            priorities.push(fromPoint[0] - toPoint[0] > 0 ? 'LEFT' : 'RIGHT');
            priorities.push(fromPoint[1] - toPoint[1] > 0 ? 'DOWN' : 'UP');

            priorities.push(getInverted(priorities[0]));
            priorities.push(getInverted(priorities[1]));
        }
        if (priorities.length === 1) {
            if (priorities[0] === 'LEFT' || priorities[0] === 'RIGHT') {
                priorities.push('UP','DOWN',getInverted(priorities[0]));
            } else {
                priorities.push('LEFT','RIGHT',getInverted(priorities[0]));
            }
        }
        if (priorities.length === 2) {
            priorities.push(getInverted(priorities[0]));
            priorities.push(getInverted(priorities[1]));
        }

        let resDir = '';
        for (let i = 0; i < priorities.length; i++) {
            if (available.indexOf(priorities[i]) !== -1 &&
                !theBoard.isCellBlocked(Direction[priorities[i]].changeX(fromPoint[0]),Direction[priorities[i]].changeY(fromPoint[1]))) {
                resDir = priorities[i];
                break;
            }
        }
        return resDir || 'STOP';
    }


    const calcDistance = (x1,y1,x2,y2) => {
        return Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
    }

    const getAroundState = (x,y) => {
        /*
            x,y --- current coordinates of bomberman
         */

        const around = [
            { point: [x-1,y], direction: 'LEFT' },
            { point: [x+1,y], direction: 'RIGHT' },
            { point: [x,y+1], direction: 'UP' },
            { point: [x,y-1], direction: 'DOWN' }
        ];

        for (let i = 0; i < around.length; i++) {
            if (theBoard.boardArr[around[i].point[1]] === undefined ||
                theBoard.boardArr[around[i].point[1]][around[i].point[0]] === undefined) {
                around[i].isFree = false;
                continue;
            }

            if (theBoard.boardArr[around[i].point[1]][around[i].point[0]] === Element.NONE) around[i].isFree = true;
            if (PERK_ELEMENTS.includes(theBoard.boardArr[around[i].point[1]][around[i].point[0]])) {
                around[i].isFree = true;
                around[i].isPerk = true;
                around[i].perk = theBoard.boardArr[around[i].point[1]][around[i].point[0]];
            }
            // check bombs action in each point
            let horBombs =  theBoard.getHorizontalBombs(around[i].point[0],around[i].point[1]);
            let vertBombs =  theBoard.getVerticalBombs(around[i].point[0],around[i].point[1]);
            around[i].bombs = {
                isClear: horBombs.isClear && vertBombs.isClear,
                elements: horBombs.elements.concat(vertBombs.elements)
            };

            // check choppers near each point
            let choppers = theBoard.getDangerousChoppers(around[i].point[0],around[i].point[1]);
            around[i].choppers = {
                isClear: choppers.isClear,
                points: choppers.points
            };
            // check is this cell blocked
            around[i].isBlocked = theBoard.isCellBlocked(around[i].point[0],around[i].point[1]);

            if (around[i].isFree) {
                around[i].profit = theBoard.countProfitAround(around[i].point[0],around[i].point[1]);
            }
        }

        return around;
    }

    const countFreeDirections = (around) => {
        let res = [];
        for (let i = 0; i < around.length; i++) {
            if (around[i].isFree && around[i].bombs.isClear && around[i].choppers.isClear && !around[i].isBlocked) {
                res.push(around[i]);
            }
        }
        return res;
    }

    const isHideWayBlocked = (x,y,dir) => {
        let isBlocked = [false,false,false];
        let points = [];
        switch (dir) {
            case 'LEFT':
                points = [[x-1,y],[x-1,y+1],[x-1,y-1]];
                break;
            case 'RIGHT':
                points = [[x+1,y],[x+1,y+1],[x+1,y-1]];
                break;
            case 'UP':
                points = [[x,y+1],[x-1,y+1],[x+1,y+1]];
                break;
            case 'DOWN':
                points = [[x,y-1],[x-1,y-1],[x+1,y-1]];
                break;
        }

        for (let i = 0; i < points.length; i++) {
            if (theBoard.boardArr[points[i][1]] === undefined ||
                theBoard.boardArr[points[i][1]][points[i][0]] === undefined) {
                isBlocked[i] = true;
                continue;
            }
            if (!FREE_ELEMENTS_WITH_ME.includes(theBoard.boardArr[points[i][1]][points[i][0]])) {
                isBlocked[i] = true;
            }
        }

        return isBlocked[0] || (isBlocked[1] && isBlocked[2]);
    }

    const checkForwardWay = (x,y,dir) => {
        let points = {
            'LEFT': [[x-1,y],[x-2,y],[x-3,y],[x-4,y]],
            'RIGHT': [[x+1,y],[x+2,y],[x+3,y],[x+4,y]],
            'UP': [[x,y+1],[x,y+2],[x,y+3],[x,y+4]],
            'DOWN': [[x,y-1],[x,y-2],[x,y-3],[x,y-4]]
        };
        let res = {
            isClear: true
        };

        for (let i = 0; i < points[dir].length; i++) {
            if (theBoard.boardArr[points[dir][i][1]] === undefined ||
                theBoard.boardArr[points[dir][i][1]][points[dir][i][0]] === undefined ||
                BLOCK_ELEMENTS.includes(theBoard.boardArr[points[dir][i][1]][points[dir][i][0]])) {
                res.isClear = false;
                break;
            }
        }

        return res;
    }

    const checkChoppersOnHideWay = (x,y,dir) => {
        let oddDx = (x%2 === 0) ? 2 : 1;
        let oddDy = (y%2 === 0) ? 2 : 1;
        let points = {
            'LEFT': [[x-1,y],[x-2,y],[x-3,y],[x-4,y],[x-5,y],[x-oddDx,y+1],[x-oddDx,y-1]],
            'RIGHT': [[x+1,y],[x+2,y],[x+3,y],[x+4,y],[x+5,y],[x+oddDx,y+1],[x+oddDx,y-1]],
            'UP': [[x,y+1],[x,y+2],[x,y+3],[x,y+4],[x,y+5],[x+1,y+oddDy],[x-1,y+oddDy]],
            'DOWN': [[x,y-1],[x,y-2],[x,y-3],[x,y-4],[x,y-5],[x+1,y-oddDy],[x-1,y-oddDy]]
        };
        let res = {
            isClear: true
        };

        for (let i = 0; i < points[dir].length; i++) {
            if (theBoard.boardArr[points[dir][i][1]] === undefined ||
                theBoard.boardArr[points[dir][i][1]][points[dir][i][0]] === undefined ||
                ([0,1].includes(i) && BLOCK_ELEMENTS.includes(theBoard.boardArr[points[dir][i][1]][points[dir][i][0]])) ) {
                break;
            }
            if (CHOPPERS_ELEMENTS.includes(theBoard.boardArr[points[dir][i][1]][points[dir][i][0]])) {
                res.isClear = false;
                break;
            }
        }

        return res;
    }

    const checkHideWays = (free) => {
        let res = [];

        for (let i = 0; i < free.length; i++) {
            console.log('checkChoppersOnHideWay(free[i].point[0],free[i].point[1],free[i].direction)',
                checkChoppersOnHideWay(free[i].point[0],free[i].point[1],free[i].direction))
            if ((!isHideWayBlocked(free[i].point[0],free[i].point[1],free[i].direction) ||
                checkForwardWay(free[i].point[0],free[i].point[1],free[i].direction).isClear) &&
                checkChoppersOnHideWay(free[i].point[0],free[i].point[1],free[i].direction).isClear) {
                res.push(free[i]);
            }
        }

        return res;
    }

    const checkXChopper = (x,y) => {
        let points = [
            [[x-1,y], [x-2,y]],
            [[x+1,y], [x+2,y]],
            [[x,y+1], [x,y+2]],
            [[x,y-1], [x,y-2]]
        ];
        let res = {
            isClear: true
        };

        outer: for (let i = 0; i < points.length; i++) {
            for (let j = 0; j < points[i].length; j++) {
                if (theBoard.boardArr[points[i][j][1]] === undefined ||
                    theBoard.boardArr[points[i][j][1]][points[i][j][0]] === undefined) {
                    continue;
                }
                if (BOMB_BLOCK_ELEMENTS.includes(theBoard.boardArr[points[i][j][1]][points[i][j][0]])) {
                    break;
                }
                if (theBoard.boardArr[points[i][j][1]][points[i][j][0]] === Element.DEAD_MEAT_CHOPPER) {
                    res.isClear = false;
                    break outer;
                }
            }
        }

        return res;
    }

    const checkStopBombermen = () => {
        let other = [];
        let stopped = [];
        for (let i = history.length - 1; i >= history.length - 5; i--) {
            other.push([]);
            let index = history[i].indexOf(Element.OTHER_BOMBERMAN);
            while (index !== -1) {
                other[other.length-1].push(index);
                index = history[i].indexOf(Element.OTHER_BOMBERMAN, index + 1);
            }
        }
        if (other[0]) {
            for (let i = 0; i < other[0].length; i++) {
                let count = 0;
                for (let j = 1; j < other.length; j++) {
                    if (other[j].includes(other[1][i])) count++;
                }
                if (count === 4) {
                    stopped.push(other[1][i]);
                }
            }
        }
        let stoppedPoints = stopped.map(index => {
            let y = theBoard.size - Math.floor(index / theBoard.size);
            let x = index - Math.floor(index / theBoard.size) * theBoard.size;
            return [x,y];
        });
        return stoppedPoints;
    }

    const updatePerks = () => {
        perks.forEach( (item, i) => {
            if (item.type !== Element.BOMB_REMOTE_CONTROL) {
                if (item.tick === PERK_TIME) {
                    delete perks[i];
                } else {
                    item.tick++;
                }
            } else {
                if (item.count === PERK_CONTROL_COUNT) {
                    delete perks[i];
                }
            }
        });
        for (let i = 0; i < perks.length; i++) {
            if (!perks[i]) {
                perks.splice(i,1);
            }
        }
    };

    const getElements = (x,y) => {
        let choppers = [];
        let perks = [];

        for (let i = 0; i < theBoard.boardArr.length; i++) {
            for (let j = 0; j < theBoard.boardArr[i].length; j++) {
                if (theBoard.boardArr[j][i] === Element.MEAT_CHOPPER) {
                    choppers.push([i,j]);
                }
                if (PERK_ELEMENTS.includes(theBoard.boardArr[j][i])) {
                    perks.push([i,j]);
                }
            }
        }

        if (x && y) {
            choppers.sort( (a,b) => {
                return calcDistance(x,y,a[0],a[1]) >= calcDistance(x,y,b[0],b[1]);
            });
            perks.sort( (a,b) => {
                return calcDistance(x,y,a[0],a[1]) >= calcDistance(x,y,b[0],b[1]);
            })
        }

        return {
            choppers,
            perks
        };
    }

    const checkChoppersAround = (x,y) => {
        let oddDx = (x%2 === 0) ? 2 : 1;
        let oddDy = (y%2 === 0) ? 2 : 1;
        let points = [
            [[x-1,y],[x-2,y],[x-3,y],[x-4,y],[x-oddDx,y-1],[x-oddDx,y+1]],
            [[x+1,y],[x+2,y],[x+3,y],[x+4,y],[x+oddDx,y-1],[x+oddDx,y+1]],
            [[x,y-1],[x,y-2],[x,y-3],[x,y-4],[x-1,y-oddDy],[x+1,y-oddDy]],
            [[x,y+1],[x,y+2],[x,y+3],[x,y+4],[x-1,y+oddDy],[x+1,y+oddDy]]
        ];

        let res = {
            isClear: true
        };

        outer: for (let i = 0; i < points.length; i++) {
            for (let j = 0; j < points[i].length; j++) {
                if (theBoard.boardArr[points[i][j][1]] === undefined ||
                    theBoard.boardArr[points[i][j][1]][points[i][j][0]] === undefined) {
                    continue;
                }
                if (BOMB_BLOCK_ELEMENTS.includes(theBoard.boardArr[points[i][j][1]][points[i][j][0]])) {
                    break;
                }
                if (theBoard.boardArr[points[i][j][1]][points[i][j][0]] === Element.MEAT_CHOPPER) {
                    res.isClear = false;
                    break outer;
                }
            }
        }

        return res;
    }

    const findPriorityDir = (x,y,free,aroundState) => {
        let res = '';
        let freeDirs = free.map( item => item.direction);

        if (history.length >= 5) {
            let otherStopped = checkStopBombermen();
            if (otherStopped.length) {
                let nearCell = aroundState.find( item =>
                    Math.abs(item.point[0]-otherStopped[0]) <= 1 && Math.abs(item.point[1]-otherStopped[1]) <= 1 );
                if (nearCell) {
                    return nearCell.direction;
                }
                let priorityDir = getPriorityDir([x, y], otherStopped[0], freeDirs);
                if (priorityDir) {
                    return priorityDir;
                }
            }
        }

        let elements = getElements(x,y);
        if (elements.perks[0] &&
            Math.abs(elements.perks[0][0] - x) <= 5 && Math.abs(elements.perks[0][1] - y) <= 5) {
            let priorityDir = getPriorityDir([x, y], elements.perks[0], freeDirs);
            if (priorityDir) {
                return priorityDir;
            }
        }
        // go to choppers, if its are far away
        if (checkChoppersAround(x,y).isClear) {
            let choppers = elements.choppers;
            if (choppers[0]) {
                let priorityDir = getPriorityDir([x, y], choppers[0], freeDirs);
                if (priorityDir) {
                    return priorityDir;
                }
            }
        }

        return res;
    }

    const afterBombSet = (x,y,free,aroundState) => {

    }


    return {
        get: () => {
            if (board.isMyBombermanDead()) {
                history = [];
                myBombs = [];
                perks = [];
                console.log('======================');
                return Direction.STOP.toString();
            }

            let bomberman = board.getBomberman();
            let bombermanX = bomberman.getX();
            let bombermanY = bomberman.getY();

            updatePerks();

            if (board.isMyBombermanBomb()) {
                let freeDirs = theBoard.getFreeDirections(bombermanX, bombermanY);
                direction = getRandomDir(freeDirs);
                return Direction[direction || 'STOP'].toString();
            }

            let aroundState = getAroundState(bombermanX, bombermanY);
            let free = countFreeDirections(aroundState);

            let perkAround = aroundState.find( item => item.isPerk && item.bombs.isClear && item.choppers.isClear);
            if (perkAround) {
                perks.push({
                    type: perkAround.perk,
                    tick: 0,
                    count: 0,
                    point: perkAround.point
                });
                direction = perkAround.direction;
                return Direction[direction].toString();
            }

            let actReady = false;
            if (isBombSet) {
                let perkControl = perks.find( item => item.type === Element.BOMB_REMOTE_CONTROL);
                if (perkControl && bombermanX !== perkControl.point[0] && bombermanY !== perkControl.point[1]) {
                    actReady = true;
                    perkControl.count++;
                }
            }


            if (!isBombSet) {
                let profitAround = theBoard.countProfitAround(bombermanX, bombermanY);
                let moreProfit = free.sort( (a,b) => {
                    return a.profit > b.profit ? -1 : 1;
                }).find(item => item.profit > profitAround);

                if (moreProfit) {
                    direction = moreProfit.direction;
                    return Direction[direction].toString();
                }

                if (profitAround >= 1 && free.length) {
                    let hideWays = checkHideWays(free);
                    if (hideWays.length) {
                        isBombSet = true;
                        myBombs.push([bombermanX,bombermanY]);
                        let index = myBombs.length - 1;
                        setTimeout( function (index) {
                            isBombSet = false;
                            myBombs.splice(index,1);
                        }, 5000);
                        if (hideWays.length > 1) {
                            let nextDir = findPriorityDir(bombermanX,bombermanY,hideWays,aroundState);
                            if (!nextDir) {
                                nextDir = getRandomDir(hideWays.map(item => item.direction));
                            }
                            direction = nextDir;
                        } else {
                            direction = hideWays[0].direction;
                        }
                        return Direction.ACT.toString() + ',' + Direction[direction].toString();
                    }
                }
            }

            // check for x-chopper. continue move forward if it present
            if (free.length >= 1 && direction) {
                let xChopper = checkXChopper(bombermanX, bombermanY);
                if (!xChopper.isClear) {
                    let currentDir = aroundState.find( item => item.direction === direction);
                    if (currentDir.isFree && !currentDir.isBlocked && currentDir.choppers.isClear) {
                        return Direction[direction].toString() + (actReady ? ',act' : '');
                    }
                }
            }

            if (free.length >= 3 || (free.length === 2 && !direction) ) {
                let priorityDir = findPriorityDir(bombermanX, bombermanY, free,aroundState);
                if (priorityDir) {
                    direction = priorityDir;
                    return Direction[direction].toString()  + (actReady ? ',act' : '');
                }

                direction = getRandomDir(free.map(item => item.direction));
                return Direction[direction].toString() + (actReady ? ',act' : '');
            }

            if (free.length === 2 && direction) {
                let withoutBack = free.filter( item => item.direction !== getInverted(direction));
                let freeDirs = withoutBack.map( item => item.direction);
                let nextDir = '';
                if (freeDirs.length === 2) {
                    nextDir = findPriorityDir(bombermanX,bombermanY,withoutBack,aroundState);
                    if (!nextDir) {
                        nextDir = getRandomDir(freeDirs);
                    }
                } else {
                    nextDir = freeDirs[0];
                }
                direction = nextDir;
                return Direction[direction].toString()  + (actReady ? ',act' : '');
            }

            if (free.length === 1) {
                direction = free[0].direction;
                return Direction[direction].toString() + (actReady ? ',act' : '');
            }

            let horBombs =  theBoard.getHorizontalBombs(bombermanX,bombermanY);
            let vertBombs =  theBoard.getVerticalBombs(bombermanX,bombermanY);
            let currentBombs = {
                isClear: horBombs.isClear && vertBombs.isClear,
                elements: horBombs.elements.concat(vertBombs.elements)
            }
            if (free.length === 0 && !currentBombs.isClear) {
                let blockedSaveCell = aroundState.find( item => item.isFree && item.isBlocked && item.bombs.isClear);
                if (blockedSaveCell) {
                    direction = blockedSaveCell.direction;
                    return Direction[direction].toString() + (actReady ? ',act' : '');
                }
                let freeCells = aroundState.filter( item => item.isFree)
                    .sort( (a,b) => a.direction === direction ? -1 : 1);
                if (freeCells.length) {
                    if (freeCells[0].bombs.elements.find(item => item.el === Element.BOMB_TIMER_1)) {
                        return Direction.STOP.toString() + (actReady ? ',act' : '');
                    }
                    direction = freeCells[0].direction;
                    return Direction[direction].toString() + (actReady ? ',act' : '');
                }
            }

            direction = '';
            return Direction.STOP.toString() + (actReady ? ',act' : '');
        }

    };
};

