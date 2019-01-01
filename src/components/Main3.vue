<template>
  <el-container>
    <el-header>
      <h1 style="text-align: center; margin: 20px 0; color: #555;font-size: 2em;">存储管理</h1>
    </el-header>
    <el-main>
      <div class="container">
        <section class="clearfix">
          <div class="left">
            <fieldset>
              <legend>操作</legend>
              <el-row>
                <el-button @click="getRandomSpace">随机生成空闲分区</el-button>
                <el-button @click="getHomework">随机生成作业</el-button>
                <el-button type="primary" @click="begin">开始分配</el-button>
              </el-row>
              <el-row>
                <el-button type="warning" @click="recycle" :disabled="flag">回收所有资源</el-button>
                <el-button type="danger" @click="setEmpty">清空</el-button>
              </el-row>
            </fieldset>
          </div>
          <div class="right">
            <fieldset>
              <legend>选择算法</legend>
              <el-radio-group v-model="radio">
                <el-row>
                  <el-radio :label="0">首次适应算法</el-radio>
                </el-row>
                <el-row>
                  <el-radio :label="1">循环首次适应算法</el-radio>
                </el-row>
                <el-row>
                  <el-radio :label="2">最佳适应算法</el-radio>
                </el-row>
                <el-row>
                  <el-radio :label="3">最坏适应算法</el-radio>
                </el-row>
              </el-radio-group>
            </fieldset>

          </div>
        </section>
        <section class="clearfix">
          <div class="left">
            <el-table :data="spacetable" stripe border height="330">
              <el-table-column prop="id" label="分区号">
              </el-table-column>
              <el-table-column prop="size" label="分区大小">
              </el-table-column>
              <el-table-column prop="freeSpace" label="剩余空间">
              </el-table-column>
              <el-table-column prop="startAddr" label="分区始址">
              </el-table-column>
              <el-table-column prop="status" label="状态">
              </el-table-column>
            </el-table>
          </div>
          <div class="right">
            <el-table :data="worktable" stripe border height="330">
              <el-table-column prop="id" label="作业号">
              </el-table-column>
              <el-table-column prop="size" label="作业大小">
              </el-table-column>
              <el-table-column prop="partitionID" label="对应区块">
              </el-table-column>
              <el-table-column prop="status" label="状态">
              </el-table-column>
            </el-table>
          </div>
        </section>
      </div>
    </el-main>
  </el-container>
</template>

<script>
  export default {
    data() {
      return {
        radio: 0,
        spacetable: [],
        worktable: [],
        flag: true
      }
    },
    methods: {
      getRandomSpace() {
        this.spacetable = []
        let min = 0, max = 0
        for (let i = 0; i < 6; i++) {
          max = this.getNum(min, min + 200)
          let partition = {
            id: i,
            size: max - min,
            freeSpace: max - min,
            startAddr: min,
            status: '空闲'
          }
          this.spacetable.push(partition)
          min = max
        }
      },
      getNum(min, max) {
        const num = Math.random() * (max - min) + min
        return Math.ceil(num)
      },
      getHomework() {
        this.recycle()
        this.worktable = []
        for (let i = 0; i < 6; i++) {
          let homework = {
            id: i,
            size: this.getNum(1, 150),
            partitionID: '',
            status: '未分配'
          }
          this.worktable.push(homework)
        }

      },
      setEmpty() {
        this.worktable = []
        this.spacetable = []
      },
      compare(before, after) {
        if (before.id < after.id) {
          return -1
        } else {
          return 1
        }
      },
      begin() {
        this.flag = false
        switch (this.radio) {
          case 0:
            this.FF()
            break
          case 1:
            this.NF()
            break
          case 2:
            this.BF()
            break
          case 3:
            this.WF()
            break
        }
      },
      FF() {
        this.spacetable.sort(this.compare)
        for (let i = 0; i < this.worktable.length; i++) {
          const homework = this.worktable[i]
          if (homework.status !== 'success') {
            for (let j = 0; j < this.spacetable.length; j++) {
              const partition = this.spacetable[j]
              if (homework.size <= partition.freeSpace) {
                homework.partitionID = partition.id
                homework.status = 'success'
                partition.freeSpace = partition.freeSpace - homework.size
                partition.startAddr += homework.size
                partition.status = '已分配'
                break
              }
            }
          }
        }
      },
      NF() {
        this.spacetable.sort(this.compare)
        let lastIndex = 0
        for (let i = 0; i < this.worktable.length; i++) {
          const homework = this.worktable[i]
          if (homework.status !== 'success') {
            for (let j = lastIndex; j < this.spacetable.length; j++) {
              const partition = this.spacetable[j]
              if (homework.size <= partition.freeSpace) {
                homework.partitionID = partition.id
                homework.status = 'success'
                partition.freeSpace = partition.freeSpace - homework.size
                partition.startAddr += homework.size
                partition.status = '已分配'
                lastIndex = j + 1
                break
              }
            }
            if (homework.status !== 'success') {
              for (let j = 0; j <= lastIndex; j++) {
                const partition = this.spacetable[j]
                if (homework.size <= partition.freeSpace) {
                  homework.partitionID = partition.id
                  homework.status = 'success'
                  partition.freeSpace = partition.freeSpace - homework.size
                  partition.startAddr += homework.size
                  partition.status = '已分配'
                  lastIndex = j + 1
                  break
                }
              }
            }
          }
        }
      },
      BF() {
        for (let i = 0; i < this.worktable.length; i++) {
          const homework = this.worktable[i]
          if (homework.status !== 'success') {
            this.spacetable.sort((before, after) => {
              if (before.freeSpace >= after.freeSpace) {
                return 1
              } else return -1
            })
            for (let j = 0; j < this.spacetable.length; j++) {
              const partition = this.spacetable[j]
              if (homework.size <= partition.freeSpace) {
                homework.partitionID = partition.id
                homework.status = 'success'
                partition.freeSpace = partition.freeSpace - homework.size
                partition.startAddr += homework.size
                partition.status = '已分配'
                break
              }
            }
          }
        }

      },
      WF() {
        for (let i = 0; i < this.worktable.length; i++) {
          const homework = this.worktable[i]
          if (homework.status !== 'success') {
            this.spacetable.sort((before, after) => {
              if (before.freeSpace >= after.freeSpace) {
                return -1
              } else return 1
            })
            for (let j = 0; j < this.spacetable.length; j++) {
              const partition = this.spacetable[j]
              if (homework.size <= partition.freeSpace) {
                homework.partitionID = partition.id
                homework.status = 'success'
                partition.freeSpace = partition.freeSpace - homework.size
                partition.startAddr += homework.size
                partition.status = '已分配'
                break
              }
            }
          }
        }
      },
      recycle() {
        this.flag = true
        for (let i = 0; i < this.worktable.length; i++) {
          const homework = this.worktable[i]
          if (homework.status === 'success' && homework.partitionID !== '') {
            for (let j = 0; j < this.spacetable.length; j++) {
              const partition = this.spacetable[j]
              if (partition.id === homework.partitionID) {
                partition.freeSpace += homework.size
                partition.startAddr -= homework.size
                partition.status = '空闲'
                homework.partitionID = ''
              }
            }
          }
        }
      }

    }
  }
</script>

<style scoped>
  .container {
    width: 960px;
    margin: auto;
  }

  .left {
    width: 59%;
    float: left;

  }

  .right {
    width: 40%;
    float: right;
  }

  fieldset {
    box-sizing: border-box;
    margin: 1em 0;
    padding: 20px 50px;
    border: 1px solid #ccc;
    height: 150px;
  }

  legend {
    padding: 0 10px;
  }

  .el-row + .el-row {
    margin-top: 10px;
  }
</style>
