<template>
  <div class="container">
    <h1 style="text-align: center; margin: 20px 0; color: #555">进程调度</h1>
    <el-table :data="tableData" stripe border height="283">
      <el-table-column prop="name" label="进程名">
      </el-table-column>
      <el-table-column prop="priority" label="优先权">
      </el-table-column>
      <el-table-column prop="requiredTime" label="所需时间">
      </el-table-column>
      <el-table-column prop="beginTime" label="开始时间">
      </el-table-column>
      <el-table-column prop="runtime" label="已运行时间">
      </el-table-column>
      <el-table-column prop="endTime" label="结束时间">
      </el-table-column>
      <el-table-column prop="status" label="状态">
      </el-table-column>
    </el-table>
    <div class="form-wrap">
      <el-form :model="process" label-position="top" ref="processForm">
        <el-form-item label="进程名" class="input-item" prop="name">
          <el-input v-model="process.name"></el-input>
        </el-form-item>
        <el-form-item label="优先权" class="input-item" prop="priority">
          <el-input v-model="process.priority"></el-input>
        </el-form-item>
        <el-form-item label="所需时间" class="input-item" prop="requiredTime">
          <el-input v-model="process.requiredTime" ></el-input>
        </el-form-item>
        <el-form-item class="input-item">
          <el-button type="primary" @click="addProcess('processForm')">加入</el-button>
        </el-form-item>
        <el-form-item label="时间片" class="input-item">
          <el-input v-model="timeslice" :disabled="variableSlice"></el-input>
        </el-form-item>
        <el-form-item>
          <el-radio-group v-model="radio">
            <el-radio :label="0">静态优先权算法</el-radio>
            <el-radio :label="1">动态优先权算法</el-radio>
            <el-radio :label="2">简单轮转法</el-radio>
            <el-radio :label="3">可变时间片轮转法</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" style="width: 300px" @click="begin">执行</el-button>
          <el-button @click="reset">重置</el-button>
          <el-button @click="getData">测试数据</el-button>
        </el-form-item>
      </el-form>

    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        time: 0,
        tempArr: [],
        variableSlice: false,
        timeId: 0,
        process: {
          name: '',
          priority: null,
          requiredTime: null
        },
        timeslice: 1,
        radio: 0,
        tableData: []
      }
    },
    methods: {
      getData() {
        this.variableSlice = false
        if (this.timeId) {
          clearInterval(this.timeId)
        }
        this.tableData = [{
          id: 0,
          name: '1',
          priority: 1,
          requiredTime: 10,
          beginTime: '',
          endTime: '',
          runtime: '',
          status: ''
        },
          {
            id: 1,
            name: '2',
            priority: 3,
            requiredTime: 15,
            beginTime: '',
            endTime: '',
            runtime: '',
            status: ''
          },
          {
            id: 2,
            name: '3',
            priority: 2,
            requiredTime: 5,
            beginTime: '',
            endTime: '',
            runtime: '',
            status: ''
          },
          {
            id: 3,
            name: '4',
            priority: 4,
            requiredTime: 3,
            beginTime: '',
            endTime: '',
            runtime: '',
            status: ''
          },
          {
            id: 4,
            name: '5',
            priority: 0,
            requiredTime: 7,
            beginTime: '',
            endTime: '',
            runtime: '',
            status: ''
          }
        ]
      },
      reset() {
        this.tableData = []
        this.init()
      },
      addProcess(formName) {
        let newProcess = {
          id: this.tableData.length,
          name: this.process.name,
          priority: this.process.priority,
          requiredTime: this.process.requiredTime,
          runtime: '',
          status: ''
        }
        this.$refs[formName].resetFields()
        if (newProcess.requiredTime.length === 0) {
          return
        }
        this.tableData.push(newProcess)
        this.tempArr.push(newProcess)
      },
      init() {
        this.time = 0
        this.variableSlice = false
        if (this.timeId) {
          clearInterval(this.timeId)
        }
        this.tempArr = []
        for (let i = 0; i < this.tableData.length; i++) {
          this.tableData[i].status = 'waiting'
          this.tableData[i].runtime = null
          this.tableData[i].beginTime = ''
          this.tableData[i].endTime = ''
        }
        this.tempArr = JSON.parse(JSON.stringify(this.tableData))
      },
      begin() {
        this.init()
        switch (this.radio) {
          case 0:
            this.variableSlice = true
            this.timeslice = 1
            this.staticPriority()
            break
          case 1:
            this.variableSlice = true
            this.timeslice = 3
            this.dynamicPriority()
            break
          case 2:
            this.variableSlice = true
            this.simpleRotary()
            break
          case 3:
            this.variableRotary()
            break
        }
      },
      staticPriority() {
        let maxPriority = 0
        for (let i = 0; i < this.tempArr.length; i++) {
          if (this.tempArr[i].priority > this.tempArr[maxPriority].priority) {
            maxPriority = i
          }
        }
        const index = this.tempArr[maxPriority].id
        this.tableData[index].beginTime = this.time
        this.tempArr.splice(maxPriority, 1)//移除
        this.PCB(this.tableData[index], this.staticPriority)
      },
      dynamicPriority() {
        let maxPriority = 0
        for (let i = 0; i < this.tempArr.length; i++) {
          if (this.tableData[i].status !== 'finish') {
            if (this.tempArr[i].priority > this.tempArr[maxPriority].priority) {
              maxPriority = i
            }
          }
        }
        this.tempArr[maxPriority].priority--
        const index = this.tempArr[maxPriority].id
        if (this.tableData[index].beginTime === '') {
          this.tableData[index].beginTime = this.time
        }
        this.PCB2(this.tableData[index], this.dynamicPriority)
      },
      simpleRotary() {
        let temp = {}
        do {
          temp = this.tempArr.shift()
          this.tempArr.push(temp)
        } while (this.tableData[temp.id].status === 'finish')
        const index = temp.id
        if (this.tableData[index].beginTime === '') {
          this.tableData[index].beginTime = this.time
        }
        this.PCB2(this.tableData[index], this.simpleRotary)
      },
      variableRotary() {
        let temp = {}
        do {
          temp = this.tempArr.shift()
          this.tempArr.push(temp)
        } while (this.tableData[temp.id].status === 'finish')
        const index = temp.id
        if (this.tableData[index].beginTime === '') {
          this.tableData[index].beginTime = this.time
        }
        this.PCB2(this.tableData[index], this.simpleRotary)
      },
      isAllFinish() {
        let flag = true
        for (let i = 0; i < this.tableData.length; i++) {
          if (this.tableData[i].status !== 'finish') {
            flag = false
          }
        }
        return flag
      },
      PCB(process, fn) {

        process.status = 'running'
        this.timeId = setInterval(() => {
          this.time++
          process.runtime++
          if (parseInt(process.requiredTime) === process.runtime) {
            clearInterval(this.timeId)
            process.status = 'finish'
            process.endTime = this.time
            if (this.tempArr.length > 0) {
              fn()
            }
          }
        }, 1000)
      },
      PCB2(process, fn) {
        let timeslice = 1
        if (this.timeslice) {
          timeslice = parseInt(this.timeslice)
        }
        process.status = 'running'
        setTimeout(() => {
          if (process.runtime + timeslice >= parseInt(process.requiredTime)) {
            this.time += (parseInt(process.requiredTime) - process.runtime)
            process.runtime = parseInt(process.requiredTime)
            process.status = 'finish'
            process.endTime = this.time
          } else {
            process.status = 'waiting'
            process.runtime += timeslice
            this.time += timeslice

          }
          if (!this.isAllFinish()) {
            fn()
          }
        }, 1000)
      }
    }

  }
</script>

<style scoped>
  .container {
    width: 800px;
    margin: auto;
  }

  .input-item {
    width: 70px;
    display: inline-block;

  }

  .input-item + .input-item {
    margin-left: 20px;
  }

  .form-wrap {
    margin-top: 20px;
    text-align: center;

  }
  input{
    border: 1px solid #000 !important;
  }
</style>
