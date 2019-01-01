<template>
  <div class="container">
    <h1 style="text-align: center; margin: 20px 0; color: #555">进程调度课程设计</h1>
    <el-table :data="tableData" stripe border>
      <el-table-column prop="name" label="进程名">
      </el-table-column>
      <el-table-column prop="arriveTime" label="到达时间">
      </el-table-column>
      <el-table-column prop="serverTime" label="服务时间">
      </el-table-column>
      <el-table-column prop="beginTime" label="开始时间">
      </el-table-column>
      <el-table-column prop="runningTime" label="已运行时间">
      </el-table-column>
      <el-table-column prop="completeTime" label="完成时间">
      </el-table-column>
      <el-table-column prop="turnOverTime" label="周转时间">
      </el-table-column>
      <el-table-column prop="weightTime" label="带权周转时间">
      </el-table-column>
    </el-table>
    <div class="form-wrap">
      <el-radio-group v-model="radio">
        <el-radio :label="0">先来先服务</el-radio>
        <el-radio :label="1">非抢占短进程优先</el-radio>
        <el-radio :label="2">抢占短进程优先</el-radio>
        <el-radio :label="3">高响应比优先</el-radio>
        <el-radio :label="4">时间片轮转</el-radio>
      </el-radio-group>
      <el-button type="primary" style="width: 300px;margin: 30px 0;" @click="begin">执行</el-button>
    </div>
    <div>{{message}}</div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        queue: [],
        message: '',
        time: 0,
        timeId: 0,
        tempArr: [],
        radio: 0,
        tableData: [{
          id: 0,
          name: 'A',
          arriveTime: 0,
          serverTime: 3,
          beginTime: '',
          runningTime: '',
          completeTime: '',
          turnOverTime: '',
          weightTime: '',
        }, {
          id: 1,
          name: 'B',
          arriveTime: 2,
          serverTime: 6,
          beginTime: '',
          runningTime: '',
          completeTime: '',
          turnOverTime: '',
          weightTime: '',
        }, {
          id: 2,
          name: 'C',
          arriveTime: 4,
          serverTime: 4,
          beginTime: '',
          runningTime: '',
          completeTime: '',
          turnOverTime: '',
          weightTime: '',
        }, {
          id: 3,
          name: 'D',
          arriveTime: 6,
          serverTime: 5,
          beginTime: '',
          runningTime: '',
          completeTime: '',
          turnOverTime: '',
          weightTime: '',
        },
          {
            id: 4,
            name: 'E',
            arriveTime: 8,
            serverTime: 2,
            beginTime: '',
            runningTime: '',
            completeTime: '',
            turnOverTime: '',
            weightTime: '',
          }
        ]
      }
    },
    methods: {
      init() {
        this.queue = []
        this.time = 0
        this.message = ''
        if (this.timeId) {
          clearInterval(this.timeId)
        }
        this.tempArr = []
        for (let i = 0; i < this.tableData.length; i++) {
          this.tableData[i].beginTime = ''
          this.tableData[i].runningTime = ''
          this.tableData[i].completeTime = ''
          this.tableData[i].turnOverTime = ''
          this.tableData[i].weightTime = ''
        }
        this.tempArr = JSON.parse(JSON.stringify(this.tableData))
      },
      begin() {
        this.init()
        switch (this.radio) {
          case 0:
            this.FCFS()
            break
          case 1:
            this.SPF()
            break
          case 2:
            this.QSPF()
            break
          case 3:
            this.HRRN()
            break
          case 4:
            this.RR()
            break
        }
      },
      countAvgTime(property) {
        let sum = 0
        for (let i = 0; i < this.tableData.length; i++) {
          sum += parseFloat(this.tableData[i][property])
        }
        return parseFloat(sum / this.tableData.length).toFixed(2)
      },
      FCFS() {
        let first = 0
        for (let i = 0; i < this.tempArr.length; i++) {
          if (this.tempArr[i].arriveTime < this.tempArr[first].arriveTime) {
            first = i
          }
        }
        const index = this.tempArr[first].id
        this.tableData[index].beginTime = this.time
        this.PCB(this.tableData[index], this.FCFS)
        this.tempArr.splice(first, 1)//移除
      },
      SPF() {
        let short = 0
        for (let i = 0; i < this.tempArr.length; i++) {
          if (this.tempArr[i].arriveTime <= this.time) {
            if (this.tempArr[i].serverTime < this.tempArr[short].serverTime) {
              short = i
            }
          }
        }
        const index = this.tempArr[short].id
        this.tableData[index].beginTime = this.time
        this.PCB(this.tableData[index], this.SPF)
        this.tempArr.splice(short, 1)//移除
      },
      QSPF() {
        let process = {}
        let short = 0
        let shortTime = this.tempArr[short].serverTime - this.tempArr[short].runningTime
        for (let i = 0; i < this.tempArr.length; i++) {
          if (this.tempArr[i].arriveTime <= this.time) {
            let requiredTime = this.tempArr[i].serverTime - this.tempArr[i].runningTime
            if (requiredTime < shortTime) {
              shortTime = requiredTime
              short = i
            }
          }
        }
        const index = this.tempArr[short].id
        process = this.tableData[index]
        if (process.beginTime === '') {
          process.beginTime = this.time
        }
        setTimeout(() => {
          this.time++
          process.runningTime++
          if (process.runningTime === process.serverTime) {
            process.completeTime = this.time
            process.turnOverTime = process.completeTime - process.arriveTime
            process.weightTime = parseFloat(process.turnOverTime / process.serverTime).toFixed(2)
            this.tempArr.splice(short, 1)
          }
          if (this.tempArr.length > 0) {
            this.QSPF()
          } else {
            this.message = `平均周转时间：${this.countAvgTime('turnOverTime')}，平均带权周转时间：${this.countAvgTime('weightTime')}`
          }
        }, 1000)
      },
      PCB(process, fn) {
        this.timeId = setInterval(() => {
          this.time++
          process.runningTime++
          if (process.runningTime === process.serverTime) {
            process.completeTime = this.time
            process.turnOverTime = process.completeTime - process.arriveTime
            process.weightTime = parseFloat(process.turnOverTime / process.serverTime).toFixed(2)
            clearInterval(this.timeId)
            if (this.tempArr.length > 0) {
              fn()
            } else {
              this.message = `平均周转时间：${this.countAvgTime('turnOverTime')}，平均带权周转时间：${this.countAvgTime('weightTime')}`

            }
          }
        }, 1000)
      },
      HRRN() {
        let priority = 0
        for (let i = 0; i < this.tempArr.length; i++) {
          if (this.tempArr[i].arriveTime <= this.time) {
            if (this.getPriority(this.tempArr[i]) > this.getPriority(this.tempArr[priority])) {
              priority = i
            }
          }
        }
        const index = this.tempArr[priority].id
        this.tableData[index].beginTime = this.time
        this.PCB(this.tableData[index], this.HRRN)
        this.tempArr.splice(priority, 1)//移除
      },
      getPriority(process) {
        const waitTime = this.time - process.arriveTime
        return parseFloat((process.serverTime + waitTime) / process.serverTime).toFixed(3)
      },
      RR() {
        let index = null
        let process = {}
        let flag = false
        for (let i = 0; i < this.tempArr.length; i++) {
          if (this.tempArr[i].arriveTime <= this.time) {
            if (!this.queue.includes(i)) {
              this.queue.push(i)
            }
          }
        }
        for (let i = 0; i < this.queue.length; i++) {
          index = this.queue.shift()
          this.queue.push(index)
          process = this.tableData[index]
          if (process.runningTime !== process.serverTime) {
            flag = true
            break
          }

        }
        if (!flag) {
          this.message = `平均周转时间：${this.countAvgTime('turnOverTime')}，平均带权周转时间：${this.countAvgTime('weightTime')}`
          return
        }
        if (process.beginTime === '') {
          process.beginTime = this.time
        }
        setTimeout(() => {
          this.time++
          process.runningTime++
          if (process.runningTime === process.serverTime) {
            process.completeTime = this.time
            process.turnOverTime = process.completeTime - process.arriveTime
            process.weightTime = parseFloat(process.turnOverTime / process.serverTime).toFixed(2)
          }
          this.RR()
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

  .form-wrap {
    margin-top: 20px;
    text-align: center;
  }
  td{
    border: 1px solid #000 !important;
  }
</style>
