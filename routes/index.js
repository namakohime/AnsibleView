const express = require('express')
const router  = express.Router()
const multer  = require('multer')
const path    = require('path')
const fs      = require('fs')
const exec    = require('child_process').exec
const csv     = require('csv')

const jsYaml = require('js-yaml')

const command = `python ./pyprogram/train.py ""%PJName%"" ""%DatasetName%"" ""%InspectionName%"" ""%DefectMode%"" ""%step%""`
const resultPath  = './public/project/%directory%/output/result.csv'
const validationPath  = './public/project/%directory%/output/validation.csv'
const projectInfoPath = './public/project/%projectName%/project.json'
const imagePath   = './image/'
const localPath   = './public/image/'
const datasetPath = './public/dataset/'

const projectPath = './public/project/'

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, localPath)
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
const upload  = multer({ storage: storage })

router.get('/', function(req, res, next) {
  res.render('index');
})

router.get('/api/ansible-project-info', function(req, res, next) {
  let infos = {
    name: [],
  }
  fs.readdir(projectPath, function(err, files){
    if (err) {
      next(err)
    } else {
      let directoryList = files.filter(function(file){
        return fs.statSync(projectPath + file).isDirectory()
      })
      directoryList.forEach(file => {
        infos.name.push(file)
      })
      res.header('Content-Type', 'application/json; charset=utf-8')
      res.json(infos)
    }
  })
})

router.get('/api/ansible-host-info/', function(req, res, next) {
  let infos = {
    line: [],
  }
  try {
    const path = projectPath + req.query.prjName + '/hosts/inventory'
    console.log(path)
    let text = fs.readFileSync( path, 'utf8')
    let lines = text.toString().split('\n')
    lines.forEach(line => {
      infos.line.push(line)
    })
    res.header('Content-Type', 'application/json; charset=utf-8')
    res.json(infos)
  } catch (err) {
    next(err)
  }
})

router.get('/api/ansible-playbook-info/', function(req, res, next) {
  let infos = {
    line: [],
  }
  try {
    const path = projectPath + req.query.prjName + '/test.yml'
    let text = fs.readFileSync( path, 'utf8')
    let lines = text.toString().split('\n')
    lines.forEach(line => {
      infos.line.push(line)
    })
    res.header('Content-Type', 'application/json; charset=utf-8')
    res.json(infos)
    //const yamlData = fs.readFileSync(path, 'utf-8')
    //const data = jsYaml.safeLoad(yamlData)
    //console.log(data)
    //exec(cmd, (err, stdout, stderr) => {
    //if (err) {
    //  next(err)
    //} else {
    //  res.sendStatus(200)
    //}
  } catch (err) {
    next(err)
  }
})

router.get('/api/dataset-image', function(req, res, next) {
  var infos = {
    url:  [],
    name: [],
    type: [],
  }
  var fileList = []
  fs.readdir(localPath, function(err, files){
    if (err) {
      next(err)
    } else {
      fileList = files.filter(function(file){
        return fs.statSync(localPath + file).isFile() && /.*\.png|jpg$/.test(file)
      })
      fileList.forEach(file => {
        infos.url.push(imagePath + file)
        infos.name.push(file)
        infos.type.push('サンプル画像')  
      })
      res.header('Content-Type', 'application/json; charset=utf-8')
      res.json(infos)
    }
  })
})

router.get('/api/result-csv/', function(req, res, next) {
  const path = resultPath.replace('%directory%', req.query.projectName)
  fs.createReadStream(path)
  .on("error", function(err) {
    console.log('Failed to get result.csv')
    next(err)
  })
  .pipe(csv.parse({columns: true}, function(err, data) {
    if (err) {
      next(err)
    } else {
      res.header('Content-Type', 'application/json; charset=utf-8')
      res.json(JSON.stringify(data))
    }
  }))
})

router.get('/api/validation-csv/', function(req, res, next) {
  var directory = req.query.projectName
  const path = validationPath.replace('%directory%', req.query.projectName)
  fs.createReadStream(path)
  .on("error", function(err) {
    console.log('Failed to get result.csv')
    next(err)
  })
  .pipe(csv.parse({columns: true}, function(err, data) {
    if (err) {
      next(err)
    } else {
      res.header('Content-Type', 'application/json; charset=utf-8')
      res.json(JSON.stringify(data))
    }
  }))
})

router.post('/api/uploadImage', upload.single('file'), (req, res, next) => {
  res.sendStatus(200)
})

router.post('/api/set-project-info', function(req, res, next) {
  const path = projectInfoPath.replace('%projectName%', req.body.projectName)
  fs.writeFile( path, JSON.stringify(req.body), (err) => {
    if (err) {
      next(err)
    } else {
      res.sendStatus(200)
    }
  })
})
  
router.post('/api/exec-train', function(req, res, next) {
  const cmd = command.replace('%PJName%', req.body.projectName)
  .replace('%DatasetName%', req.body.datasetName)
  .replace('%InspectionName%', req.body.inspectionName)
  .replace('%DefectMode%', req.body.defectMode)
  .replace('%step%', req.body.maxStep)

  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      next(err)
    } else {
      res.sendStatus(200)
    }
  })
})

module.exports = router;
