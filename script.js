//set up network
var mnistdata, network;
window.onload = function(){
  mnistdata = new MNISTData();
  network = new Network([784,50,10,50,784]);
  console.log(network);
  network.loadJSON(savedNetworkJSON);

}




function requestNextImage(){
  /*
  ipc.once('imgReply', function(event, imgData){
    drawImageAndNetwork(imgData.networkData);
    updateSliders(imgData.PCAData);
  });
  ipc.send('imgRequest', null);*/
}
const getLImg = () => {
  if(!requestedRandomFlag) requestRandomImage(interpLImg);
  else return setTimeout(getLImg, 50);
  //getInterpolatedValues();
  //updateInterpNetwork();
};
const getRImg = () => {
  if(!requestedRandomFlag) requestRandomImage(interpRImg);
  else return setTimeout(getRImg, 50);
  //getInterpolatedValues();
  //updateInterpNetwork();
};
var requestedRandomFlag = false;
function requestRandomImage(imgVar){
  /*
  ipc.once('randImgReply', function(event, imgData){
    //console.log("recieved random img");
    imgVar.arr = imgData.arr; imgVar.dim = imgData.dim; imgVar.PCA = imgData.PCA;
    imgVar.empty = false;
    requestedRandomFlag = false;
    //console.log(imgVar.PCA);
    drawInterpolationImages();
    updateInterpNetwork();
  });
  if(!requestedRandomFlag) ipc.send('randImgRequest', null);*/
}
function updateInterpNetwork(){
  //console.log("updated interpolation");
  let interpValues = getInterpolatedValues();

  updateNetworkFromEncoded(true);
}

function getInterpolatedValues(){
  let slider = GetElementInsideContainer("demoContainer", 'interpSlider');
  let interpValues = new Array(interpLImg.PCA.length);
  let scale = slider.value/(slider.max);
  for(let i = 0; i < interpValues.length; i++){
    interpDir = interpRImg.PCA[i] - interpLImg.PCA[i];
    interpValues[i] = interpLImg.PCA[i] + scale * interpDir;
  }
  updateSliders(interpValues);
  return interpValues;
}

var requestedEncoded = false;
function updateNetworkFromEncoded(isInterpNetwork){
  /*
  ipc.once('getEncodedUpdate', function(event, outputData){
    //console.log(outputData);
    //console.log("recieved update on network output");
    //console.log("recieved update on network output from sent encoded");
    requestedEncoded = false;
    if(outputData != null){

      if(!isInterpNetwork) drawReconstructionNetwork(outputData);
      else drawInterpolationNetwork(outputData);
    }
  });

  let PCAData = getPCAData();
  //console.log((PCAData.length == 30) + " " + requestedEncoded);
  if(PCAData.length == 30 && !requestedEncoded){
    //console.log("sent encoded request");
    requestedEncoded = true;
    ipc.send('sendEncoded', getPCAData());
  }*/
}
var sliderDivPressed = false;
function slidersPressed(){
  updateNetworkFromEncoded(GetElementInsideContainer("demoContainer", "imageInterpolation").style.display != "none");
  if(sliderDivPressed) setTimeout(slidersPressed, 100);
}

function clearCanvas(){
  ctx.fillStyle = "gray";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "black";
}
let margin = [10,10];
var interpLImg = {arr:new Array(784).fill(0),dim:[28,28],PCA:new Array(30).fill(0),empty:true};
var interpRImg = {arr:new Array(784).fill(0),dim:[28,28],PCA:new Array(30).fill(0),empty:true};
function drawInterpolationImages(){
  clearCanvas();
  //draw left and right images
  let w = (canvas.width/2 - 4*margin[0])/2;
  let h = canvas.height - 2*margin[1];
  let wL = w/interpLImg.dim[0];
  let hL = h/interpLImg.dim[1];
  let size = Math.min(wL,hL);
  let yStart = canvas.height/2 - size*interpLImg.dim[1]/2;

  //left image
  drawImageCircles(interpLImg.arr, interpLImg.dim, margin[0], yStart, size);
  //right image
  drawImageCircles(interpRImg.arr, interpRImg.dim, canvas.width/2 + w + 3*margin[0], yStart, size);
}
function drawInterpolationNetwork(data){
  let w = canvas.width/2 - 2*margin[0];
  let h = canvas.height - 2*margin[1];
  w /= data.dim[0];
  h /= data.dim[1];
  let size = Math.min(w,h);
  let xStart = (canvas.width/2 - 4*margin[0])/2 + 3*margin[0];
  drawNetworkImage(data.arr, data.dim, xStart, margin[1], size);
}
function drawImageAndNetwork(dataArr){
  clearCanvas();
  let w = canvas.width/2 - 2*margin[0];
  let h = canvas.height - 2*margin[1];
  w /= dataArr[0].dim[0];
  h /= dataArr[0].dim[1];
  let size = Math.min(w,h);

  drawImageCircles(dataArr[0].arr,dataArr[0].dim,margin[0],margin[1],size);

  drawNetworkImage(dataArr[1].arr, dataArr[1].dim, margin[0] + canvas.width/2,margin[1],size);
}
function drawReconstructionNetwork(data){
  let w = canvas.width/2 - 2*margin[0];
  let h = canvas.height - 2*margin[1];
  w /= data.dim[0];
  h /= data.dim[1];
  let size = Math.min(w,h);
  drawNetworkImage(data.arr, data.dim, margin[0] + canvas.width/2,margin[1],size);
}
function drawNetworkImage(data, dim, xStart, yStart, size){
  let scaledData = new Array(data.length);
  for(let i = 0; i < data.length; i++){
    scaledData[i] = map(data[i],0,1,0,255);
  }

  drawImageCircles(scaledData,dim,xStart,yStart,size);
}
function drawCircleCorner(x, y, d){
  ctx.beginPath();
  ctx.arc(x+d/2, y+d/2, d/2, 0, 2*Math.PI);
  ctx.closePath();
  ctx.fill();
}
function drawImageCircles(imgArr, imgDim, startx, starty, size){
  //size = sidelength of square (sqr root of # of nodes)
  for(let x = 0; x < imgDim[0]; x++){
    for(let y = 0; y < imgDim[1]; y++){
      let currColor = 255 - imgArr[x*imgDim[0] + y];
      ctx.fillStyle = 'rgb(' + currColor + ',' + currColor + ',' + currColor + ')';
      ctx.strokeStyle = 'rgb(' + currColor + ',' + currColor + ',' + currColor + ')';
      drawCircleCorner(startx + x*size, starty + y*size, size);
    }
  }
}




/*controlPanel.appendChild(interpolateMode);
controlPanel.appendChild(interpLabel);
controlPanel.appendChild(nextButton);*/

/*
var body = document.getElementsByTagName("body")[0];

var sliderContainer = document.createElement('div');
demoContainer.appendChild(sliderContainer);
sliderContainer.style = "background-color: #eeeeee;";
sliderContainer.addEventListener('mousedown', function(){
  //console.log("mouse down div");
  sliderDivPressed = true;
  slidersPressed();
});
sliderContainer.addEventListener('mouseup', function(){sliderDivPressed = false;});
body.appendChild(sliderContainer);

//create sliders for PCA
var sliders = new Array();
let sliderWidth = demoContainer.width/6;
for(let i = 0; i < 30; i++){
  sliders.push(document.createElement('input'));
  sliders[i].type = "range";
  sliders[i].min = "-100"; sliders[i].max = "100"; sliders[i].value = "0";
  sliders[i].class = "PCASlider";
  sliders[i].name = "Slider " + i;
  sliders[i].style= "width: 16.2%";

  //sliders[i].oninput = "updateNetworkFromEncoded()";
  //if(i < 5) sliders[i].addEventListener('input', updateNetworkFromEncoded);
  sliderContainer.appendChild(sliders[i]);


  //add label (for debug)
  //let label = document.createElement('label');
  //label.for = "Slider " + i;
  //if(i < 5) label.innerText = "Slider " + i;
  //sliderContainer.appendChild(label);
}
*/

//var sliderClass = document.getElementsByClassName("PCASlider");
//sliderClass.addEventListener('input', updateNetworkFromEncoded(), false);



function updateSliders(data){
  //console.log(data);
  for(let i = 0; i < sliders.length; i++){
    sliders[i].value = data[i] * 100;
  }
}
function getPCAData(){
  let out = new Array(sliders.length);
  for(let i = 0; i < sliders.length; i++){
    out[i] = sliders[i].value / 100;
  }
  return out;
}

function map(n, start1, stop1, start2, stop2) {
  return ((n-start1)/(stop1-start1))*(stop2-start2)+start2;
}

function openTab(evt, tabName) {
  //console.log("tab opened");
  var i, tabcontent, tablinks;
  tabcontent = demoContainer.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = demoContainer.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  GetElementInsideContainer("demoContainer", tabName).style.display = "block";
  evt.currentTarget.className += " active";
}
