
Vue.use(TreeView);

var add = new Vue({
   
  // element to mount to
  el: '#app',
  
  // initial data
  data: {
    isSelectProject: false,
    SelectProjectNo: 0,
    selected: '',
    projects: {
      no: [1,2,3,4,5,6,7,8,9,10],
      name: ['試験環境構築', 'メンテナンス タスク入れ替え','メンテナンス 戻し作業', 'Bat Genarate', 'Distribute source code', '', '', '', '', ''],
    },
    hostInfo: 'update host information',
    playbookInfo: '',
    consoleinfo: 'start ansible viewer...',
    jsonSource: [
      {id:1, text:'text1'},
      {id:2, text:'text2'},
      {id:3, text:'text3'},
      {id:4, text:'text4'},
      {id:5, list:[
        {id:1, text:'text1'},
        {id:2, text:'text2'},
        {id:3, text:'text3'},
        {id:4, list:[
          {id:1, text:'text1'},
          {id:2, text:'text2'},
          {id:3, text:'text3'},
        ]},
      ]}
     ]
  },

  mounted: function() {
    {
      let vm = this
      axios
        .get('/api/ansible-project-info')
        .then(function (response) {
          vm.projects.name = response.data.name
        })
    }
  },
  
  // methods
  methods: {
    selectLanguage: function (lang) {
      console.log(this.selected + ' ' + lang)
      if ( this.selected === 'ja' ) {
        location.href = '/?lang=ja'  
      } 
      else {
        location.href = '/?lang=en'
      }
    },
    selectProject: function (index) {
      let vm = this
      this.isSelectProject = true
      this.SelectProjectNo = index
      axios
        .get(`/api/ansible-playbook-info/?prjName=${vm.projects.name[index]}`)
        .then(function (response) {
          // JSONにセット
          vm.playbookInfo = response.data

          // コンソールに表示
          console.log(vm.playbookInfo)
        })
      axios
        .get(`/api/ansible-host-info/?prjName=${vm.projects.name[index]}`)
        .then(function (response) {
          vm.hostInfo = ''
          response.data.line.forEach(line => {
            vm.hostInfo = vm.hostInfo + line.replace(',', '') + '\n'
          })

          // コンソールに表示
          console.log(vm.hostInfo) 
        })
    },
    updateHostInfo: function (e) {
      let vm = this
      axios
        .post(`/api/ansible-host-info/?prjName=${vm.projects.name[index]}`, jsonSource)
        .then(function (response) {
          // コンソールに表示 

        })
    },
    updatePlaybookInfo: function (e) {
      let vm = this
      axios
        .post(`/api/ansible-playbook-info/?prjName=${vm.projects.name[index]}`, hostInfo)
        .then(function (response) {
          // コンソールに表示 
        })
    },
    execPlaybook: function (e) {

    },

    addEvent: function (e) {
      axios.post('/user', {
        firstName: 'Fred',
        lastName: 'Flintstone'
      })
      .then(function (response) {
        console.log('POST responce ' +  response)
        location.href = '/userName'
      })
      .catch(function (error) {
        console.log(error);
      })
    },

    dragEnter: function (e) {
        this.isEnter = true
    },
    dragLeave: function (e) {
        this.isEnter = false
    },
    deleteFile: function (index) {
        this.files.splice(index, 1)
    },
    dropFile: function (e) {
      this.isDrop = true
      this.isEnter = false
      this.files.push(...event.dataTransfer.files)
      this.files.forEach(file => {
        this.createImage(file)
      })
    },
    selectFile: function (e) {
      this.isDrop = true
      this.files.push(...event.target.files)
      this.files.forEach(file => {
        this.createImage(file)
      })
    },
    createImage: function(file) {
      let reader = new FileReader();
      reader.onload = (e) => {
        this.uploadedImage[0].push(e.target.result)
      };
      reader.readAsDataURL(file);
    },
    uploadEvent: function(e) {
      var totalFileSize = 0
      var index = 0
      for ( file of this.files ) {
        index += 1
        // check file size
        if (file.size > 1024 * 20 * 1000) {
          this.errors.push(`File upload error. Max file size is 20MB. File name: ${file.name} File size: ${file.size}`)
          continue
        }
        // check total file size
        if (index > 3000) {
          this.errors.push('File upload error. Max number of files are 3000.')
          continues
        }
        var form = new FormData()
        var url = '/api/uploadImage'
        form.append('file', file)
        
        axios.post(url, form).then(response => {
          console.log(response.data)
        })
        .catch(error => {
          console.log(error)
        })
      }
    },
    createNewProj: function(isnew) {
      if (isnew) {
          this.isNewProj = true
      } else {
          this.isNewProj = false
      }
    },
    
    execModel: function() {
      let vm = this
      this.projectValid = []

      axios
        .post('/api/set-project-info', vm.projectinfo)
        .catch(error => {
          this.errors.push('Failed to save project info.')
        })

      axios
        .post('/api/exec-train', vm.projectinfo)
        .then(function (response) {
          axios
            .get(`/api/result-csv/?projectName=${vm.projectinfo.projectName}`)
            .then(function (response) {
              vm.projectResult = JSON.parse(response.data)
              vm.labelList.push(vm.step+1)
              vm.chartListsOk.push((vm.projectResult[0].okNg1))
              vm.chartListsNg.push((vm.projectResult[0].okNg2)+10)
              vm.chartListsAll.push((vm.projectResult[0].okNg3)+5)
              vm.creatChart()
            })
        })
        .then(function (response) {
          axios
            .get(`/api/validation-csv/?projectName=${vm.projectinfo.projectName}`)
            .then(function (response) {
              vm.projectValid = JSON.parse(response.data)
              vm.projectValid[1].originalUrl = 'aaa'
              vm.projectValid[1].originalUrl = `./project/${vm.projectinfo.projectName}/input/input_1234.jpg`
              vm.projectValid[1].markedUrl = `./project/${vm.projectinfo.projectName}/output/output_1234.jpg`
            })
        })
        .then(function (response) {  
          vm.trainNum = vm.projectValid.length
          vm.step++
          if (vm.step < vm.projectinfo.maxStep){
            vm.execModel()
            location.href = '#train-exec'
          } else {
            vm.step = 0
            location.href = '#train-result'
          }
        })
        .catch(error => {
          console.log(error)
        })
    },
    
    creatChart: function () {
      //グラフ描画
      config = {
        type: 'line',
        data: {
          labels: this.labelList,
          datasets: [{
            label: '折れ線A',
            borderColor: 'rgb(154, 162, 235)',
            fill: false,
            data: this.chartListsOk
          },
          {
            label: '折れ線B',
            borderColor: 'rgb(54, 162, 235)',
            fill: false,
            data: this.chartListsNg
          },
          {
            label: '折れ線C',
            borderColor: 'rgb(255, 99, 132)',
            fill: false,
            data: this.chartListsAll
          },
          ]
        }
      }
      chart = new Chart(document.getElementById('chart').getContext('2d'), config);
    },
    selectOriginal: function(index) {
      this.selectOriginalUrl = this.projectValid[index].originalUrl
    },
    selectMarked: function(index) {
      this.selectMarkedUrl = this.projectValid[index].markedUrl
    },
    openSubwindow: function(event) {
      const d = document.getElementById('result-window')
      console.log(d)
      d.dialog('open')
      /*const hash = event instanceof Event ? event.currentTarget.hash : event
      const dialog = document.getElementById(hash.substr(1))
      if (!dialog){
        console.error('No such element' + hash)
        return this
      }
      if (dialog.open) { return this }
        //common.activeDialogs.push(dialog)
      console.log('open !!!')
        dialog.open()
        return this*/
    },
    closeSubwindow: function(event) {
      //for ( common.activeDialog.reverse() ) { d.close() }
      const d = document.getElementById('result-window')
      d.dialog('close')
    },
  }
})
