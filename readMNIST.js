const fs = require('fs');

function map(n, start1, stop1, start2, stop2) {
  return ((n-start1)/(stop1-start1))*(stop2-start2)+start2;
}

//Fisher-Yates (aka Knuth) Shuffle
function shuffleArray(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

//class holding all binary data
class MNISTData{
  constructor(){
    this.imgReady = false;
    this.labelReady = false;
    this.imgSize = [0,0];
    this.numOfImgs = -1;
    this.numOfLabels = -2;
    this.size = 0;
    this.imgArr = null;
    this.labelArr = null;
    this.pos = 0;
    this.shuffledIndex = new Array();
  }

  clear(){
    this.imgReady = false;
    this.labelReady = false;
    this.imgSize = [0,0];
    this.numOfImgs = -1;
    this.numOfLabels = -2;
    this.size = 0;
    this.imgArr = null;
    this.labelArr = null;
    this.pos = 0;
  }

  async loadImgFile(filePath){
    this.imgReady = false;
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, (err, data) => {
        if(err){
          reject(err);
          throw err;
        }
        var magicnum = data.readInt32BE(); //Big Endian number
        //console.log(magicnum);
        /*if(magicnum!=2051){
          console.log("incorrect img file");
          clear();
          reject();
        }*/
        this.numOfImgs = data.readInt32BE(4);
        this.imgSize = [data.readInt32BE(8), data.readInt32BE(12)];
        //console.log(this.numOfImgs + " " + this.imgSize[0] + "x" + this.imgSize[1]);
        this.imgArr = data.slice(16);
        this.imgReady = true;
        resolve(this.imgArr);
        //checkFiles();
      });
    });

    //console.log("loading img");
    /*
    var reader = new FileReader();
    var set = this;
    reader.onload = function(e){
      set.imgArr = reader.result;
      //dataview is in big endian, but normal int32 is in little endian
      var magicnum = new DataView(set.imgArr,0,4).getInt32(0);
      console.log("magicnum: " + magicnum);
      if(magicnum!=2051){
        console.log("incorrect file");
        //document.getElementById(set.buttonName).disabled = false;
        set.clear();
      }
      else{

        set.numOfImgs = new DataView(set.imgArr,4,4).getInt32(0);
        set.imgSize = [new DataView(set.imgArr,8,4).getInt32(0),new DataView(set.imgArr,12,4).getInt32(0)];
        console.log(set.numOfImgs + " " + set.imgSize[0] + "x" + set.imgSize[1]);
        set.imgArr = set.imgArr.slice(16);
        set.imgReady = true;
        checkFiles(set);
      }
    };
    reader.readAsArrayBuffer(file);*/
  }

  shuffle(){
    shuffleArray(this.shuffledIndex);
  }

  getImg(pos){
    if(!this.imgReady || pos >= this.numOfImgs) return null;
    let output = new Array(this.imgSize[0]*this.imgSize[1]);

    for(let c = 0; c < this.imgSize[1]; c++){
      for(let r = 0; r < this.imgSize[0]; r++){
        output[r*this.imgSize[0] + c] = map(this.imgArr[(pos*this.imgSize[0]*this.imgSize[1]) + (r*this.imgSize[0]) + (c)],0,255,0,1);
      }
    }
    return output;
  }
  getShuffledImg(){
    let result = this.getImg(this.shuffledIndex[this.pos]);
    return result;
  }
  getImgUnscaled(pos){//returns 0-255 values instead of 0-1 values
    if(!this.imgReady || pos >= this.numOfImgs) return null;
    let output = new Array(this.imgSize[0]*this.imgSize[1]);

    for(let c = 0; c < this.imgSize[1]; c++){
      for(let r = 0; r < this.imgSize[0]; r++){
        //output[c*this.imgSize[1] + r] = this.imgArr[(this.pos*this.imgSize[0]*this.imgSize[1]) + (r*this.imgSize[0]) + (c)];
        output[r*this.imgSize[0] + c] = this.imgArr[(pos*this.imgSize[0]*this.imgSize[1]) + (r*this.imgSize[0]) + (c)];

      }
    }
    return output;
  }

  async loadLabelFile(filePath){
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, (err, data) => {
        if(err){
          reject(err);
          throw err;
        }
        /*if(magicnum!=2049){
          console.log("incorrect img file");
          clear();
          reject();
        }*/
        var magicnum = data.readInt32BE();
        //console.log("Labelnum: " + magicnum);
        this.numOfLabels = data.readInt32BE(4);
        //console.log(this.numOfLabels);
        this.labelArr = data.slice(8);
        this.labelReady = true;
        resolve(this.labelArr);
      });
    });
    //console.log("loading label");
    /*
    this.labelReady = false;
    var reader = new FileReader();
    var set = this;
    reader.onload = function(e){
      set.labelArr = reader.result;
      var magicnum = new DataView(set.labelArr,0,4).getInt32(0);
      console.log("magicnum: " + magicnum);
      if(magicnum!=2049){
        console.log("incorrect file type");
        set.clear();
      }
      else{
        set.numOfLabels = new DataView(set.labelArr,4,4).getInt32(0);
        console.log(set.numOfLabels);
        set.labelArr = set.labelArr.slice(8);
        set.labelReady = true;
      }
    };
    reader.readAsArrayBuffer(file);*/
  }

  getLabel(){
    if(!this.labelReady || this.pos >= this.numOfLabels) return null;
    return this.labelArr[this.pos];
  }

  async load(paths){
    await this.loadImgFile(paths[0]);
    await this.loadLabelFile(paths[1]);

    //get ordered indices
    for(let i = 0; i < this.numOfImgs; i++){
      this.shuffledIndex.push(i);
    }

    console.log("Loaded MNIST Dataset");
  }

  checkFiles(){

    if(!imgReady || !labelReady){
      window.setTimeout(checkFiles, 100);
    }
    else{
      if(numOfImgs!=numOfLabels){
        console.log("Files don't match. Please reupload files.");

        //document.getElementById(set.buttonName).disabled = false;
        clear();
      }
      else{
        size = numOfImgs;
      }
    }

  }
}
module.exports = MNISTData;
