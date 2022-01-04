const { Matrix, covariance, EigenvalueDecomposition } = require('ml-matrix');
const Network = require('./NNLib.js');
const MNISTData = require('./readMNIST.js');
const JSONSave = require('./SaveJSONObj.js');
const ProgressBar = require('cli-progress');

const bar = new ProgressBar.SingleBar({}, ProgressBar.Presets.shades_classic);

const eigenPercentThreshold = 0.05; //remove any eigenvectors which are below 1% relevance

const networkName = 'v6|batch=50|epochs=7|r=0.5|c=15.13';

var letterImgs = new MNISTData();
var origData; //matrix storing original encoded data
var network = new Network([1,1,1]);

(async () => {
  await letterImgs.load(['./MNIST/letters-test-images','./MNIST/letters-test-labels']);

  network.loadJSON(JSONSave.load(networkName));

  console.log("getting encoded data values");
  var encodedDataMatrix = getEncodedMatrix();
  console.log("covariance matrix");
  var covarianceMatrix = covariance(encodedDataMatrix);

  var eigenDecomp = new EigenvalueDecomposition(covarianceMatrix);

  //console.log(encodedDataMatrix);
  console.log('Data: ' + encodedDataMatrix.rows + 'x' + encodedDataMatrix.columns);
  console.log('Covariance: ' + covarianceMatrix.rows + 'x' + covarianceMatrix.columns);
  console.log('# of Eigenvalues: ' + eigenDecomp.realEigenvalues.length);
  console.log('Eigenvalues: ' + eigenDecomp.realEigenvalues); //sorted in ascending order

  /*
  The eigenvalues on occasion are negative, because they get too close to zero and become slightly inaccurate.
  Take abs value when summing to counteract.
  */
  //calculate the feature vector based on percentages
  var percentages = new Array(eigenDecomp.realEigenvalues.length);
  let sumEigenvals = 0;
  for(let i = 0; i < percentages.length; i++){ sumEigenvals += Math.abs(eigenDecomp.realEigenvalues[i]); }
  for(let i = 0; i < percentages.length; i++){ percentages[i] = Math.abs(eigenDecomp.realEigenvalues[i])/sumEigenvals; }

  var featureVector = new Matrix(eigenDecomp.eigenvectorMatrix.rows, 0);
  for(let i = percentages.length-1; i >= 0 && percentages[i] > eigenPercentThreshold; i--){
    featureVector.addColumn(eigenDecomp.eigenvectorMatrix.getColumn(i));
  }
  console.log('Eigenvector matrix: ' + eigenDecomp.eigenvectorMatrix.rows + 'x' + eigenDecomp.eigenvectorMatrix.columns);
  console.log('Feature Vector: ' + featureVector.rows + 'x' + featureVector.columns);

  //get new data points on the featureVector axes
  let featureVectorTranspose = featureVector.transpose();
  let dataMatrixTranspose = encodedDataMatrix.transpose();
  console.log('FV Transpose: ' + featureVectorTranspose.rows + 'x' + featureVectorTranspose.columns);
  console.log('Data Transpose: ' + dataMatrixTranspose.rows + 'x' + dataMatrixTranspose.columns);
  var finalDataMatrix = featureVectorTranspose.mmul(dataMatrixTranspose);//Matrix.multiply(featureVectorTranspose, dataMatrixTranspose);
  console.log('Final data: ' + finalDataMatrix.rows + 'x' + finalDataMatrix.columns);

  //I think the final data matrix is rotated, where a column stores the data for a single sample

  //if A*B=C, B = A^-1 * C
  //A^-1 must be square to be invertible, thus must take ALL eigenvectors to transform PCA points to original points

  //save data in JSON 3d array based on each letter
  letterImgs.pos = 0;
  var letterData = new Array(26);//3d array: letter x data points x data point
  for(let i = 0; i < 26; i++){
    letterData[i] = [];
  }
  for(let i = 0; i < finalDataMatrix.columns; i++){
    let currData = finalDataMatrix.getColumn(i);
    //console.log(letterImgs.getLabel());
    letterData[letterImgs.getLabel() - 1].push(currData); //subtract 1 when with letters, don't subtract when with numbers

    letterImgs.pos++;
  }
  JSONSave.save(letterData, 'PCA - ' + networkName);

  //swap order since this is sorted ascending
  let saveEigen = {eigenVectors: eigenDecomp.eigenvectorMatrix.clone(), eigenValues: [...eigenDecomp.realEigenvalues]};
  for(let i = 0; i < saveEigen.eigenValues.length/2; i++){
    saveEigen.eigenVectors.swapColumns(i, saveEigen.eigenValues.length-1-i);

    let temp = saveEigen.eigenValues[i];
    saveEigen.eigenValues[i] = saveEigen.eigenValues[saveEigen.eigenValues.length-1-i];
    saveEigen.eigenValues[saveEigen.eigenValues.length-1-i] = temp;
    //console.log("swap " + i + " with " + (saveEigen.eigenValues.length-1-i));
  }
  //console.log(saveEigen.eigenValues);
  //console.log(saveEigen.eigenVectors);
  JSONSave.save(saveEigen, 'PCA_Eigen - ' + networkName);

})();

function charCode(char){
  return ("" + char).charCodeAt(0);
}

function getEncodedMatrix(){
  //get reference to encoded layer of network
  var encodedLayer = network.layerArr[Math.floor(network.layerArr.length/2)];
  //console.log(network.layerArr[Math.floor(network.layerArr.length/2)]);
  let dimensionality = encodedLayer.nArray.length;
  let data = new Matrix(0, dimensionality);

  bar.start(letterImgs.numOfImgs, 0);
  for(;letterImgs.pos < letterImgs.numOfImgs; letterImgs.pos++){
    let currImg = letterImgs.getImg(letterImgs.pos);
    network.updateVal(currImg, currImg);

    //store neuron values in an array to be added to matrix
    let encodedImg = new Array(dimensionality);
    for(let i = 0; i < dimensionality; i++){
      encodedImg[i] = encodedLayer.nArray[i].val;
    }
    //console.log("encoded data: " + encodedImg);

    data.addRow(encodedImg);

    bar.update(letterImgs.pos);
  }
  bar.stop();

  //standardize data for each dimension (column): (value-mean)/std dev
  data.scaleColumns(/*{max:1, min:0}*/); //by default constrains all values to [0, 1]

  return data;
}
