const Network = require('./NNLib.js');
const MNISTData = require('./readMNIST.js');
const JSONSave = require('./SaveJSONObj.js');
const { app, BrowserWindow } = require('electron');
const { Matrix, inverse } = require('ml-matrix');
const ipc = require('electron').ipcMain;

ipc.on('imgRequest', function(event, d){
  //console.log("recieved imgRequest");
  if(!mnistdata.imgReady) event.sender.send('imgReply', null);
  else{
    //re-update network
    let img = mnistdata.getShuffledImg();
    network.updateVal(img, img);

    //send data
    let encodedArr = getEncodedData();

    let reply = {networkData:[{arr:mnistdata.getImgUnscaled(mnistdata.shuffledIndex[mnistdata.pos]),dim:mnistdata.imgSize},
    {arr:network.getOutputArr(),dim:mnistdata.imgSize}],PCAData:getPCAFromData(encodedArr)};
    event.sender.send('imgReply', reply);

    //increment data position
    mnistdata.pos++;
    mnistdata.pos %= mnistdata.numOfImgs;
    //img = mnistdata.getImg(mnistdata.pos);
    //network.updateVal(img, img);
  }
});
ipc.on('randImgRequest', function(event, data){
  if(!mnistdata.imgReady) event.sender.send('randImgReply', null);
  else{
    let randIndex = Math.round(Math.random()*mnistdata.numOfImgs);
    let img = mnistdata.getImg(randIndex);
    network.updateVal(img,img);
    let encodedArr = getEncodedData();
    //console.log("encoded: " + encodedArr);
    let PCAvals = getPCAFromData(encodedArr);
    let reply = {arr:mnistdata.getImgUnscaled(randIndex), dim:mnistdata.imgSize, PCA: PCAvals};
    event.sender.send('randImgReply', reply);
  }
});
ipc.on('sendEncoded', function(event, data){
  if(data == null || data.length < 30){
    console.log("refused encoded");
    event.sender.send('getEncodedUpdate', null);
  }
  else{
    let encoded = getDataFromPCA(data);
    //console.log("New Encoded: " + encoded);
    updateEncodedLayer(encoded);
    //console.log("Sent new network Output");
    let newOutput = { arr:network.getOutputArr(), dim:mnistdata.imgSize };

    //console.log(mnistdata);
    event.sender.send('getEncodedUpdate', newOutput);

  }
});

function getPCAFromData(data){ //data is a 1 row
  let outTranspose = eigenVectorsTranspose.mmul(new Matrix([data]).transpose());
  //console.log(outTranspose);
  //console.log(eigenVectorsTranspose.rows + "x" + eigenVectorsTranspose.columns + " * " + data.length + "x1");
  return outTranspose.getColumn(0);
}
function getDataFromPCA(data){
  //console.log("DATA->PCA:" + eigenVectorsTransposeInverse.rows + "x" + eigenVectorsTransposeInverse.columns + " * " + data.length + "x1");
  let outTranspose = eigenVectorsTransposeInverse.mmul(new Matrix([data]).transpose());
  //console.log(outTranspose);
  return outTranspose.getColumn(0);
}

function updateEncodedLayer(encodedData){
  let encodedLayerNum = Math.floor(network.layerArr.length/2);
  var encodedLayer = network.layerArr[encodedLayerNum].nArray;
  for(let i = 0; i < encodedData.length; i++){
    encodedLayer[i].val = encodedData[i];
  }

  let beforeChange = network.getOutputArr();
  //update decoder network
  for(let i = encodedLayerNum+1;i<network.layerArr.length;i++){
    network.layerArr[i].updateVal();
  }
  //this.prediction = this.layerArr[this.layerArr.length-1].prediction;

  /*
  let afterChange = network.getOutputArr();
  let changedValues = false;
  for(let i = 0; i < beforeChange.length && !changedValues; i++){
    if(beforeChange[i] != afterChange[i]){
      changedValues = true;
      console.log(beforeChange[i] + " -> " + afterChange[i]);
    }
  }
  if(changedValues) console.log("Changed output");*/
}

function getEncodedData(){
  //get reference to encoded layer of network
  var encodedLayer = network.layerArr[Math.floor(network.layerArr.length/2)];
  //console.log(network.layerArr[Math.floor(network.layerArr.length/2)]);
  let dimensionality = encodedLayer.nArray.length;

  //store neuron values in an array to be added to matrix
  let encodedImg = new Array(dimensionality);
  for(let i = 0; i < dimensionality; i++){
    encodedImg[i] = encodedLayer.nArray[i].val;
    //if(encodedImg[i] < 0 || encodedImg[i] > 1) console.log("outside bound");
  }

  //standardize data for each dimension (column): (value-mean)/std dev
  //TODO: add scaling? but also need to reverse scale at the end

  return encodedImg;
}


function createWindow () {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      nodeIntegration: true
    }
  });

  win.loadFile('./webpage/displayNetwork.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

var mnistdata = new MNISTData();
var network = new Network([784,50,10,50,784]);
const networkName = 'v6|batch=50|epochs=7|r=0.5|c=15.13';//'Num-v6|batch=50|epochs=6|r=0.6|c=10.81';
network.loadJSON(JSONSave.load(networkName));
var PCAAxes = JSONSave.load('PCA_Eigen - ' + networkName);
var eigenVectorsTranspose = new Matrix(PCAAxes.eigenVectors).transpose();
var eigenVectorsTransposeInverse = inverse(eigenVectorsTranspose);

(async () => {
  await mnistdata.load(['./MNIST/letters-test-images','./MNIST/letters-test-labels']);
  //await mnistdata.load(['./MNIST/digits-test-images','./MNIST/digits-test-labels']);
  mnistdata.shuffle();
  let firstImg = mnistdata.getShuffledImg();
  network.updateVal(firstImg, firstImg);
})();
