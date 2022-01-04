//UNUSED

const Network = require('./NNLib.js');
const MNISTData = require('./readMNIST.js');
const JSONSave = require('./SaveJSONObj.js');
const { app, BrowserWindow } = require('electron');
const ipc = require('electron').ipcMain;

ipc.on('imgRequest', function(event, d){
  //console.log("recieved imgRequest");
  /*
  if(!data.imgReady) event.sender.send('imgReply', null);
  else{
    let reply = [{arr:data.getImgUnscaled(),dim:data.imgSize},
    {arr:network.getOutputArr(),dim:data.imgSize}];
    event.sender.send('imgReply', reply);

    data.pos++;
    data.pos %= data.numOfImgs;
    let img = data.getImg();

    network.updateVal(img, img);
  }*/
});

function createWindow () {
  const win = new BrowserWindow({
    width: 1000,
    height: 600,
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

var data = new MNISTData();
var network = new Network([784,50,10,50,784]);
network.loadJSON(JSONSave.load('v3|batch=50|epochs=5|r=0.5|c=17.38'));

(async () => {
  await data.load(['./MNIST/letters-train-images','./MNIST/letters-train-labels']);
  let firstImg = data.getImg();
  network.updateVal(firstImg, firstImg);
})();
