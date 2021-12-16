const fs = require("fs");
const baseUrl = "http://localhost:3000/";
const { dirname } = require('path');

exports.getListFiles = (req, res) => {  
  const directoryPath = __basedir + "/resources/static/assets/uploads/";

  fs.readdir(directoryPath, function (err, files) {
    if (err) {
      res.status(500).send({
        message: "Unable to scan files!",
      });
    }

    let fileInfos = [];

    files.forEach((file) => {
      fileInfos.push({
        name: file,
        url: baseUrl + file,
      });
    });

    res.status(200).send(fileInfos);
  });
};

 exports.downloadPrice = async (req, res) => {
    try {
        const directoryPath = __dirname + "/data/prices.tsv";
        const fileName = 'prices.tsv'
        const fileURL = directoryPath
        const stream = fs.createReadStream(fileURL);
        res.set({
          'Content-Disposition': `attachment; filename='${fileName}'`,
          'Content-Type': 'application/tsv',
        });
        stream.pipe(res);
      } catch (e) {
        console.error(e)
        res.status(500).end();
      }
};

