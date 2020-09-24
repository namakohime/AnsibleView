
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
    hostInfo: '',
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
          vm.playbookInfo = ''
          response.data.line.forEach(line => {
            vm.playbookInfo = vm.playbookInfo + line.replace(',', '') + '\n'
          })

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
    openSubwindow: function (event) {
      const dialog = document.getElementById('confirmation')
      if (!dialog) {
        console.error('No such element ' + hash)
        return this
      }
      if (dialog.open) { 
        return this 
      }
      dialog.showModal()
      return this
    },
    closeSubwindow: function (event) {
      const dialog = document.getElementById('confirmation')
      if (!dialog) {
        console.error('No such element ' + hash)
        return this
      }
      dialog.close()
      return this
    },
  }
})
