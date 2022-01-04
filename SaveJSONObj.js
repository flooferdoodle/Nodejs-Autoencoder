const fs = require('fs');
const dir = './savedJSON';
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

module.exports = {
  //store object in json file; will overwrite if directory exists
  save: (obj, name) => {
    fs.writeFileSync(dir + '/' + name + '.json', JSON.stringify(obj));
  },

  //get an object from json file
  load: (name) => {
    try{
      let data = fs.readFileSync(dir + '/' + name + '.json');
      return JSON.parse(data);
    }
    catch(e){
      console.log(e);
      return null;
    }
  },

  makeFolder: (name) => {
    if(!fs.existsSync(dir + '/' + name)){
      fs.mkdirSync(dir + '/' + name);
    }
  }
};
