const Network = require('./NNLib.js');
const MNISTData = require('./readMNIST.js');
const JSONSave = require('./SaveJSONObj.js');
const ProgressBar = require('cli-progress');
//const { app, BrowserWindow } = require('electron');
//const ipc = require('electron').ipcMain;

const bar = new ProgressBar.SingleBar({}, ProgressBar.Presets.shades_classic);

var num = 5;
var imgArr;
var labelsArr;
var data = new MNISTData();
var network = new Network([784,150,30,2,30,150,784]);
//v1: [784,50,10,50,784]
//v2: [784,75,20,75,784]
//v3: [784,100,30,100,784]
//v4: [784,500,300,2,300,500,784]
    //https://www.google.com/search?q=autoencoder&safe=strict&rlz=1C5GCEM_enUS936US936&sxsrf=ALeKk02OWsjBgOBwBukT37WbzI8Sus4_MA:1613707908887&source=lnms&tbm=isch&sa=X&ved=2ahUKEwjPm7i1ivXuAhVrm-AKHSBqBCYQ_AUoAXoECBMQAw&biw=1440&bih=720#imgrc=ReXPaBPImpAC1M
//v5: [784,100,10,100,784]
//v6: [784,150,30,150,784]
//v7: [784,150,30,2,30,150,784] v6 but trying to condense to 2 dimensions
network.rate = 0.5;
const batchSize = 50;
const epochs = 3;


(async () => {
  await data.load(['./MNIST/letters-train-images','./MNIST/letters-train-labels']);


  //manually finding the cost
  /*network.loadJSON(JSONSave.load('batch=50|epochs=3|r=0.5|c=33.68227676644126'));
  let cost = await getAvgNetworkCost();
  console.log("Cost: " + cost);*/

// training a network that has already been trained
/*
  network.loadJSON(JSONSave.load('v3|batch=50|epochs=6|r=0.5|c=16.77'));
  trainNetwork(1, batchSize);
  let cost = await getAvgNetworkCost();
  JSONSave.save(network, ('v3|batch=' + batchSize + '|epochs=7' + '|r=0.5|c=' + cost));*/


  network.loadJSON(JSONSave.load('v6|batch=50|epochs=7|r=0.5|c=15.13'));
  await trainNetwork(epochs, batchSize);
  //let cost = await getAvgNetworkCost();
  //console.log(cost);
  //JSONSave.save(network, ('v6|batch=' + batchSize + '|epochs=' + epochs + '|r='  + network.rate + '|c=' + cost));


})();

async function getAvgNetworkCost(){

  var testData = new MNISTData();
  await testData.load(['./MNIST/letters-test-images','./MNIST/letters-test-labels']);

  console.log("Calculating Cost...");
  bar.start(testData.numOfImgs, 0);
  let sum = 0;
  for(;testData.pos < testData.numOfImgs; testData.pos++){
    let currImg = testData.getImg(testData.pos);
    network.updateVal(currImg, currImg);
    sum += network.findCost();
    bar.update(testData.pos);
  }
  bar.stop();
  sum /= testData.numOfImgs;
  return parseFloat(sum.toFixed(2));//round to 2 decimals
}


var lastCost = null;
/*function trainNetwork(currEpoch, epochs, batchSize){
  if(currEpoch == 0) console.log("Training..."); //first call
  else if(currEpoch > epochs){//completed training
    return true;
  }

  if(data.pos == 0){ //starting new epoch
    currEpoch++;
    console.log("Epoch " + (currEpoch) + "/" + epochs + ": ");
    data.shuffle();
    bar.start(data.numOfImgs, 0);
  }


  if(data.pos < data.numOfImgs){//currently within epoch
    //iterate through a batch of images and train network
    for(let i = 0; i < batchSize && data.pos < data.numOfImgs; i++){
      let img = data.getShuffledImg();
      network.updateVal(img, img);
      network.calculate();

      data.pos++;
      bar.update(data.pos);
    }

    //learn based on whole batch
    network.learn();

    //pass info to the display
    let avgCost = 0;
    for(let i = 0; i < network.batchCost.length; i++){
      avgCost += network.batchCost[i];
    }
    avgCost /= network.batchCost.length;
    network.batchCost = [];
    lastCost = {x:data.pos, y:avgCost};
  }
  else{ //completed current epoch
    data.pos = 0;

    bar.stop();
  }

  return setImmediate(() => {return trainNetwork(currEpoch, epochs, batchSize);}); //allow for events to occur in between runs
}*/

//backup version (synchronous)
async function trainNetwork(epochs, batchSize){
  console.log("Training...");
  for(let currEpoch = 0; currEpoch < epochs; currEpoch++){
    console.log("Epoch " + (currEpoch+1) + "/" + epochs + ": ");
    data.shuffle();
    bar.start(data.numOfImgs, 0);

    //go through batches
    while(data.pos < data.numOfImgs){
      //iterate through a batch of images and train network
      for(let i = 0; i < batchSize && data.pos < data.numOfImgs; i++){
        let img = data.getShuffledImg();
        network.updateVal(img, img);
        network.calculate();

        //update position and progress bar
        data.pos++;
        bar.update(data.pos);
      }

      //learn based on whole batch
      network.learn();

      //pass info to the display
      let avgCost = 0;
      for(let i = 0; i < network.batchCost.length; i++){
        avgCost += network.batchCost[i];
      }
      avgCost /= network.batchCost.length;
      lastCost = {x:data.pos, y:avgCost};
    }
    data.pos = 0;

    bar.stop();

    //save current epoch version
    let cost = await getAvgNetworkCost();
    console.log(cost);
    JSONSave.save(network, ('v6|batch=' + batchSize + '|epochs=' + (currEpoch+8) + '|r='  + network.rate + '|c=' + cost));
  }
}

//Electron window display--------------------------------------------
/*
function createWindow () {
  const win = new BrowserWindow({
    width: 1000,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  });

  win.loadFile('./webpage/displayTraining.html');
}

//disable if don't want display
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipc.on('costRequest', (event, arg) => {
  //console.log('Cost request');
  //update(lastCost);
  event.reply('costReply', lastCost);
});*/
