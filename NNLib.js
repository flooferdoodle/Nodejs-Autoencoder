//Normalization function
function sigmoid(x){
  return 1/(1+Math.pow(Math.E,-x));
}
function derivSig(x){
  return sigmoid(x)*(1-sigmoid(x));
}


class Neuron{
  constructor(numOfInputs){
    this.w = new Array(numOfInputs);
    for(var i = 0;i<this.w.length;i++){
      this.w[i] = Math.random()*2-1;
    }
    this.b = Math.random()*2-1;
    this.val = 0;
    this.z = 0;
    this.dCw = [];
    this.dCa = [];
    this.dCb = [];
  }

  updateVal(inputLayer){
    this.z = 0;
    for(var i = 0;i<inputLayer.length;i++){
      this.z += inputLayer[i].val*this.w[i];
    }
    this.z+=this.b;

    this.val = sigmoid(this.z);
  }

  calcdCa(nextLayer, i){
    var sum = 0;
    for(var j=0;j<nextLayer.nArray.length;j++){
      sum += /* dz/da */ nextLayer.nArray[j].w[i] * /* da/dz */ derivSig(nextLayer.nArray[j].z) * /* dC/da */ nextLayer.nArray[j].dCa[this.dCa.length];
    }
    this.dCa.push(sum);
  }

  calcdCw(prevLayer){
    var tempdcw = new Array(this.w.length);
    for(var k=0;k<tempdcw.length;k++){
      tempdcw[k] = /* dz/dw */ prevLayer[k].val * /* da/dz */ derivSig(this.z) * /* dC/da */ this.dCa[this.dCa.length-1];
    }
    this.dCw.push(tempdcw);
  }

  calcdCb(){
    this.dCb.push(/* dz/db */ 1 * /* da/dz */ derivSig(this.z) * /* dC/da */ this.dCa[this.dCa.length-1]);
  }

  learn(rate){

    //calculate avg of all batches
    var avgdCw = new Array(this.w.length);
    avgdCw.fill(0);
    var avgdCb = 0;
    for(var i=0;i<avgdCw.length;i++){
      for(var j=0;j<this.dCw.length;j++){
        avgdCw[i]+=this.dCw[j][i];
      }
      avgdCw[i] /= this.dCw.length;
    }
    for(i=0;i<this.dCb.length;i++){
      avgdCb+=this.dCb[i];
    }
    avgdCb /= this.dCb.length;


    for(i=0;i<this.w.length;i++){
      this.w[i] -= avgdCw[i]*rate;
    }
    this.b -= avgdCb*rate;

    //reset

    this.dCw = [];
    this.dCa = [];
    this.dCb = [];
  }

}

class InputNeuron{

  constructor(input){
    this.val = input;
  }

  updateVal(input){
    this.val = input;
  }
}

class OutputNeuron{
  constructor(numOfInputs){
    this.w = new Array(numOfInputs);
    for(var i = 0;i<this.w.length;i++){
      this.w[i] = Math.random()*2-1;
    }
    this.b = Math.random()*2-1;
    this.val = 0;
    this.z = 0;
    this.dCw = [];
    this.dCa = [];
    this.dCb = [];
  }

  updateVal(inputLayer){
    this.z = 0;
    for(var i = 0;i<inputLayer.length;i++){
      this.z += inputLayer[i].val*this.w[i];
    }
    this.z+=this.b;

    this.val = sigmoid(this.z);

  }

  calcdCa(y){
    this.dCa.push(/* dC/da */ 2*(this.val-y));
  }

  calcdCw(prevLayer){
    var tempdcw = new Array(this.w.length);
    for(var k=0;k<tempdcw.length;k++){
      tempdcw[k] = /* dz/dw */ prevLayer[k].val * /* da/dz */ derivSig(this.z) * /* dC/da */ this.dCa[this.dCa.length-1];
    }
    this.dCw.push(tempdcw);
  }

  calcdCb(){
    this.dCb.push(/* dz/db */ 1 * /* da/dz */ derivSig(this.z) * /* dC/da */ this.dCa[this.dCa.length-1]);
  }

  learn(rate){
    //calculate avg of all batches
    var avgdCw = new Array(this.w.length);
    avgdCw.fill(0);
    var avgdCb = 0;

    for(var i=0;i<avgdCw.length;i++){
      for(var j=0;j<this.dCw.length;j++){
        //console.log(this.dCw[j][i]);
        avgdCw[i]+=this.dCw[j][i];
      }
      avgdCw[i] /= this.dCw.length;
    }

    for(i=0;i<this.dCb.length;i++){
      avgdCb+=this.dCb[i];
    }
    avgdCb /= this.dCb.length;


    for(i=0;i<this.w.length;i++){
      this.w[i] -= avgdCw[i]*rate;
    }
    this.b -= avgdCb*rate;

    //reset
    this.dCw = [];
    this.dCa = [];
    this.dCb = [];
  }
}

class HiddenLayer{
  constructor(size, prevLayer){
    //console.log("layer");
    this.nArray = new Array(size);
    for(var i=0;i<size;i++){
      this.nArray[i] = new Neuron(prevLayer.length);
    }
    this.inpArray = prevLayer;
  }

  updateVal(){
    //console.log("layer update");
    for(var i=0;i<this.nArray.length;i++){
      this.nArray[i].updateVal(this.inpArray);
    }
  }

  calcdCa(nextLayer){
    //console.log("hiddenLayer deriv");
    for(var i=0;i<this.nArray.length;i++){
      this.nArray[i].calcdCa(nextLayer,i);
    }
  }

  calcdCw(){
    //console.log("hiddenlayer dcw");
    for(var i=0;i<this.nArray.length;i++){
      this.nArray[i].calcdCw(this.inpArray);
    }
  }

  calcdCb(){
    //console.log("hiddenlayer dcb");
    for(var i=0;i<this.nArray.length;i++){
      this.nArray[i].calcdCb();
    }
  }

  learn(rate){
    for(var i=0;i<this.nArray.length;i++){
      this.nArray[i].learn(rate);
    }
  }
}

class InputLayer{
  constructor(size){
    //console.log("input layer");
    this.nArray = new Array(size);
    for(var i=0;i<size;i++){
      this.nArray[i] = new InputNeuron();
    }
  }

  updateVal(input){
    for(var i=0;i<this.nArray.length;i++){
      this.nArray[i].updateVal(input[i]);
    }
  }
}

class OutputLayer{
  constructor(size, prevLayer){
    //console.log("layer");
    this.nArray = new Array(size);
    for(var i=0;i<size;i++){
      this.nArray[i] = new OutputNeuron(prevLayer.length);
    }
    this.inpArray = prevLayer;
    this.prediction = -1;
  }

  getOutputArr(){
    let arr = new Array(this.nArray.length);
    for(let i = 0; i < arr.length; i++){
      arr[i] = this.nArray[i].val;
    }
    return arr;
  }

  updateVal(){
    //console.log("layer update");
    var max = -1;
    this.prediction = -1;
    for(var i=0;i<this.nArray.length;i++){
      this.nArray[i].updateVal(this.inpArray);
      if(max<this.nArray[i].val){
        max = this.nArray[i].val;
        this.prediction = i;
      }
    }
  }

  calcdCa(desired){
    for(var i=0;i<this.nArray.length;i++){
      this.nArray[i].calcdCa(desired[i]);
    }
  }

  calcdCw(){
    for(var i=0;i<this.nArray.length;i++){
      this.nArray[i].calcdCw(this.inpArray);
    }
  }

  calcdCb(){
    //console.log("output layer dcb");
    for(var i=0;i<this.nArray.length;i++){
      this.nArray[i].calcdCb();
    }
  }
  learn(rate){
    for(var i=0;i<this.nArray.length;i++){
      this.nArray[i].learn(rate);
    }
  }
}

class Network{
  constructor(sizeArr){
    var layerNum = sizeArr.length;
    //console.log("network");
    this.layerArr = new Array(layerNum);
    this.layerArr[0] = new InputLayer(sizeArr[0]);
    for(var i =1;i<layerNum-1;i++){
      this.layerArr[i] = new HiddenLayer(sizeArr[i],this.layerArr[i-1].nArray);
    }
    this.layerArr[layerNum-1] = new OutputLayer(sizeArr[sizeArr.length-1],this.layerArr[layerNum-2].nArray);

    this.cost = 0;
    this.prediction = -1;
    this.desired = null;
    this.rate = 0.5;
    this.batchCost = [];
  }


  //adds in new image to the InputLayer, adds desired output, and updates all later layers
  updateVal(inputArr, desired){
    //console.log("network update");
    this.desired = desired;
    this.layerArr[0].updateVal(inputArr);

    for(var i = 1;i<this.layerArr.length;i++){
      this.layerArr[i].updateVal();
    }
    this.prediction = this.layerArr[this.layerArr.length-1].prediction;

  }

  findCost(/*desired*/){
    var sum = 0;
    for(var i = 0;i<this.desired.length;i++){
      sum += Math.pow((this.desired[i]-this.layerArr[this.layerArr.length-1].nArray[i].val),2);
    }
    this.cost = sum;
    return sum;
  }

  getOutputArr(){
    return this.layerArr[this.layerArr.length-1].getOutputArr();
  }

  calculate(/*desired*/){
    //this.desired = desired;
    this.calcdCa(this.desired);
    this.calcdCw();
    this.calcdCb();

    this.batchCost.push(this.findCost());
  }


  learn(){
    //this.calculate();
    for(var i = this.layerArr.length-1;i>0;i--){
      this.layerArr[i].learn(this.rate);
    }
  }


  calcdCa(desired){
    this.layerArr[this.layerArr.length-1].calcdCa(desired);
    for(var i = this.layerArr.length-2;i>0;i--){
      //console.log("network hiddenlayers deriv");
      this.layerArr[i].calcdCa(this.layerArr[i+1]);
    }
  }
  calcdCw(){
    for(var i=this.layerArr.length-1;i>0;i--){
      this.layerArr[i].calcdCw();
    }
  }
  calcdCb(){
    for(var i=this.layerArr.length-1;i>0;i--){
      this.layerArr[i].calcdCb();
    }
  }

  loadJSON(data){
    var layerNum = data.layerArr.length;
    this.layerArr = new Array(layerNum);
    this.layerArr[0] = new InputLayer(data.layerArr[0].nArray.length);
    for(var i = 1; i < layerNum; i++){
      if(i == layerNum-1) this.layerArr[i] = new OutputLayer(data.layerArr[i].nArray.length,this.layerArr[i-1].nArray);
      else this.layerArr[i] = new HiddenLayer(data.layerArr[i].nArray.length,this.layerArr[i-1].nArray);
      let neurons = this.layerArr[i].nArray;
      let neuronData = data.layerArr[i].nArray;
      for(var n = 0; n < neurons.length; n++){
        neurons[n].w = neuronData[n].w;
        neurons[n].b = neuronData[n].b;
      }
    }

    this.cost = 0;
    this.prediction = -1;
    this.desired = null;


  }
}
//--------------------------------------------------
//derivative relations
/*
function cost(y){
  var sum = 0;
  for(i=0;i<brain.layerArr[brain.layerArr.length-1].nArray.length;i++){
    sum+=Math.pow(brain.layerArr[brain.layerArr.length-1].nArray[i].val-y[i],2);
  }
  return sum;
}*/

/*
//only on the last
var dCa = 2*(a[a.length-1]-y);
//az relation
var daz = (l) => derivSig(z[l-1]);
//zw relation
var dzw = (l) => a[l-1];
//zb relation
var dzb = 1;
//za relation
var dza = (l) => w[l-1];
*/

//---------------------------------------------------
module.exports = Network;
