const express = require("express");
const path = require("path");
const fileReaderAsync = require("./fileReader");
const filePath = path.join(`${__dirname}/pkgs.json`);
const cors = require("cors");
const app = express();
const fs = require('fs');
const package = JSON.parse(fs.readFileSync("backend/pkgs.json", "utf-8"))

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const port = 9001;

app.get("/", (req, res) => {
  res.sendFile(path.join(`${__dirname}/../frontend/index.html`));
});

app.get("/example", async (req, res) => {
  const fileData = await fileReaderAsync(filePath);

  console.log(fileData.toString());
  res.send(fileData.toString())
});


//Create the endpoints

app.get("/api/package", (req, res) => {
  res.send(JSON.stringify(package.packages));
})

app.get(`/api/package/:id`, (req, res) => {
  let idObject = req.params;
  let id = Object.values(idObject);

  if (id < 7) {
    res.send(JSON.stringify(package.packages[id - 1]));
  }
  else {
    res.send("IT ISN'T AN ID, PICK A NUMBER BETWEEN 1-6 ")
  }
})
//


//Add new Package
app.post('/api/package', (req, res) => {
  //fs.writeFileSync('backend/pkgs.json', "[]");
  fs.readFile('backend/pkgs.json', (err, data) => {
    if (err) {
      res.status(500).send('Please try again');
    } else {
      const pkgs = JSON.parse(data);
      const newPackage = { id: "", name: "", description: "", dependencies: "", releases: "" };
      newPackage.id = pkgs.packages.length + 1;
      newPackage.name = req.body.name;
      newPackage.description = req.body.description;
      newPackage.dependencies = req.body.dependencies;
      newPackage.releases = req.body.releases;
      pkgs.packages.push(newPackage);
      console.dir(pkgs, { depth: null });
      //JSON vissza
      fs.writeFile('backend/pkgs.json', JSON.stringify(pkgs, null, 2), (err) => {
        if (err) {
          console.log(err);
          res.status(500).send('Please try again');
        } else {
          console.log('done');
          res.send('done');
        }
      })
    }
  })
})

//Update package

app.put('/api/package/:id', (req, res) => {
  fs.readFile('backend/pkgs.json', (err, data) => {
    if (err) {
      res.status(500).send('Please try again');
    } else {
      const pkgs = JSON.parse(data);
      const result = pkgs.packages.filter(package => package.id === parseInt(req.params.id));
      const obj = result[0];
      //const result = pkgs.packages.find(package => package.id === req.params.id);
      //const obj = result
      const lastVersion = obj.releases[0].version;
      const myDate = new Date();
      const version = lastVersion.split("."); //[14, 3, 6]

      obj.releases.unshift({
        date: `${myDate.getFullYear()}-${myDate.getMonth() + 1}-${myDate.getDate()}`,
        version: `${version[0]}.${version[1]}.${parseInt(version[2]) + 1}`
      })

      fs.writeFile('backend/pkgs.json', JSON.stringify(pkgs, null, 2), (err) => {
        if (err) {
          console.log(err);
          res.status(500).send('Please try again');
        } else {
          console.log('done');
          res.send('done');
        }
      })
    }
  })
})

//Delete Package

app.delete('/api/package/:id', (req, res) => {
  //fs.writeFileSync('backend/pkgs.json', "[]");
  fs.readFile('backend/pkgs.json', (err, data) => {
    if (err) {
      res.status(500).send('Please try again');
    } else {
      const pkgs = JSON.parse(data);
      const splicedPackages = pkgs.packages.splice(parseInt(req.params.id) - 1, 1);
      console.log(pkgs);

      fs.writeFile('backend/pkgs.json', JSON.stringify(pkgs, null, 2), (err) => {
        if (err) {
          console.log(err);
          res.status(500).send('Please try again');
        } else {
          console.log('done');
          res.send('done');
        }
      })
    }
  })
})




app.listen(port, () => console.log(`http://127.0.0.1:${port}`));
