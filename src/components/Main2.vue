<template>
  <div class="container">
    <h1 style="text-align: center; margin: 20px 0; color: #555">作业调度</h1>
    <el-table :data="tableData" stripe border height="283">
      <el-table-column prop="name" label="作业">
      </el-table-column>
      <el-table-column prop="enterTime" label="进入时间">
      </el-table-column>
      <el-table-column prop="requiredTime" label="估计运行时间">
      </el-table-column>
      <el-table-column prop="beginTime" label="开始时间">
      </el-table-column>
      <el-table-column prop="endTime" label="结束时间">
      </el-table-column>
      <el-table-column prop="turnoverTime" label="周转时间">
      </el-table-column>
      <el-table-column prop="weightedTime" label="带权周转时间">
      </el-table-column>
    </el-table>
    <div class="form-wrap">
      <el-form :model="homework" label-position="top" ref="processForm">
        <el-form-item label="作业名" class="input-item" prop="name">
          <el-input v-model="homework.name"></el-input>
        </el-form-item>
        <el-form-item label="进入时间" class="input-item" prop="enterTime">
          <el-input v-model="homework.enterTime"></el-input>
        </el-form-item>
        <el-form-item label="估计运行时间" class="input-item" prop="requiredTime">
          <el-input v-model="homework.requiredTime"></el-input>
        </el-form-item>
        <el-form-item class="input-item">
          <el-button type="primary" @click="addProcess('processForm')">加入</el-button>
        </el-form-item>
        <el-form-item>
          <el-radio-group v-model="radio">
            <el-radio :label="0">先来先服务算法</el-radio>
            <el-radio :label="1">短作业优先算法</el-radio>
            <el-radio :label="2">高响应比优先调度法</el-radio>
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
        id: 0,
        time: 0,
        tempArr: [],
        timeId: 0,
        tableData: [],
        homework: {},
        radio: 0
      }
    },
    methods: {
      getData() {
        this.tableData = [{
          id: 0,
          name: 'A',
          enterTime: 0,
          requiredTime: 3,
          beginTime: null,
          endTime: null,
          turnoverTime: null,
          weightedTime: null,
        },
          {
            id: 1,
            name: 'B',
            enterTime: 2,
            requiredTime: 6,
            beginTime: null,
            endTime: null,
            turnoverTime: null,
            weightedTime: null
          },
          {
            id: 2,
            name: 'C',
            enterTime: 4,
            requiredTime: 4,
            beginTime: null,
            endTime: null,
            turnoverTime: null,
            weightedTime: null
          },
          {
            id: 3,
            name: 'D',
            enterTime: 6,
            requiredTime: 5,
            beginTime: null,
            endTime: null,
            turnoverTime: null,
            weightedTime: null
          },
          {
            id: 4,
            name: 'E',
            enterTime: 8,
            requiredTime: 2,
            beginTime: null,
            endTime: null,
            turnoverTime: null,
            weightedTime: null
          }]
      },
      reset() {
        this.tableData = []
      },
      init() {
        this.time = 0
        if (this.timeId) {
          clearInterval(this.timeId)
        }
        this.tempArr = []
        for (let i = 0; i < this.tableData.length; i++) {
          this.tableData[i].beginTime = null
          this.tableData[i].endTime = null
          this.tableData[i].turnoverTime = null
          this.tableData[i].weightedTime = null
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
            this.SJF()
            break
          case 2:
            this.HRRN()
            break
        }
      },
      FCFS() {
        let first = 0
        for (let i = 0; i < this.tempArr.length; i++) {
          if (this.tempArr[i].enterTime < this.tempArr[first].enterTime) {
            first = i
          }
        }
        const index = this.tempArr[first].id
        this.tableData[index].beginTime = this.time
        this.PCB(this.tableData[index], this.FCFS)
        this.tempArr.splice(first, 1)//移除
      },
      SJF() {
        let short = 0
        for (let i = 0; i < this.tempArr.length; i++) {
          if (this.tempArr[i].enterTime <= this.time) {
            if (this.tempArr[i].requiredTime < this.tempArr[short].requiredTime) {
              short = i
            }
          }
        }
        const index = this.tempArr[short].id
        this.tableData[index].beginTime = this.time
        this.PCB(this.tableData[index], this.SJF)
        this.tempArr.splice(short, 1)//移除
      },
      HRRN() {
        let priority = 0
        for (let i = 0; i < this.tempArr.length; i++) {
          if (this.tempArr[i].enterTime <= this.time) {
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
      getPriority(homework) {
        const waitTime = this.time - homework.enterTime
        return parseFloat((homework.requiredTime + waitTime) / homework.requiredTime).toFixed(3)
      },
      PCB(homework, fn) {
        let count = 0
        this.timeId = setInterval(() => {
          count++
          this.time++
          if (count === parseInt(homework.requiredTime)) {
            homework.endTime = this.time
            homework.turnoverTime = homework.endTime - homework.enterTime
            homework.weightedTime = parseFloat(homework.turnoverTime / homework.requiredTime).toFixed(2)
            clearInterval(this.timeId)
            if (this.tempArr.length > 0) {
              fn()
            }
          }
        }, 200)
      },
      addProcess(formName) {
        let newProcess = {
          id: this.tableData.length,
          name: this.homework.name,
          enterTime: this.homework.enterTime,
          requiredTime: this.homework.requiredTime,
          beginTime: null,
          endTime: null,
          turnoverTime: null,
          weightedTime: null
        }
        this.$refs[formName].resetFields()
        this.tableData.push(newProcess)
        this.tempArr.push(newProcess)
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

  .input-item {
    width: 100px;
    display: inline-block;
  }

  .input-item + .input-item {
    margin-left: 20px;
  }
</style>
