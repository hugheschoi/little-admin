<template>
  <div class="app-container">
    <div class="filter-container">
      <!-- <el-input v-model="listQuery.title" placeholder="请输入关键词搜索" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button> -->
      <!-- <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        添加
      </el-button> -->
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80" :class-name="getSortClass('id')">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" class-name="status-col" width="100">
        <template slot-scope="{row}">
          <el-tag :type="row.status | statusFilter('tag')">
            {{ row.status | statusFilter('label') }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="用户名" min-width="100px">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.userName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="用户类型" min-width="100px">
        <template slot-scope="{row}">
          <span>{{ row.type | typeFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="邮箱" min-width="120px">
        <template slot-scope="{row}">
          <span>{{ row.userEmail }}</span>
        </template>
      </el-table-column>
      <el-table-column label="手机号" min-width="120px">
        <template slot-scope="{row}">
          <span>{{ row.userPhone }}</span>
        </template>
      </el-table-column>
      <el-table-column label="性别" min-width="80px">
        <template slot-scope="{row}">
          <span>{{ row.userSex }}</span>
        </template>
      </el-table-column>
      <el-table-column label="用户生日" min-width="150px">
        <template slot-scope="{row}">
          <span>{{ row.userBirthday }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="150px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.regTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <!-- <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width" fixed="right">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button v-if="row.status!='deleted'" size="mini" type="danger" @click="handleModifyStatus(row,'deleted')">
            删除
          </el-button>
        </template>
      </el-table-column> -->
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="100px" style="width: 450px; margin-left:50px;">
        <el-form-item label="用户名" prop="userName">
          <el-input v-model="temp.userName" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="性别" prop="userSex">
          <el-select v-model="temp.userSex" class="filter-item" placeholder="请选择性别">
            <el-option value="男" />
            <el-option value="女" />
          </el-select>
        </el-form-item>
        <el-form-item label="邮箱" prop="userEmail">
          <el-input v-model="temp.userEmail" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="生日" prop="userBirthday">
          <el-date-picker v-model="temp.userBirthday" type="datetime" placeholder="请选择生日日期" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="temp.status">
            <el-radio :label="0">封禁</el-radio>
            <el-radio :label="1">正常</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="头像" prop="userPic" style="margin-bottom: 30px;">
          <Upload v-model="temp.userPic" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <!-- dialogStatus==='add'?createData():updateData() -->
        <el-button type="primary" @click="updateData">
          确定
        </el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="dialogPvVisible" title="Reading statistics">
      <el-table :data="pvData" border fit highlight-current-row style="width: 100%">
        <el-table-column prop="key" label="Channel" />
        <el-table-column prop="pv" label="Pv" />
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPvVisible = false">Confirm</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
// import { regionData, CodeToText, TextToCode } from 'element-china-area-data'
import Upload from '@/components/Upload/SingleImage2'
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'ComplexTable',
  components: { Pagination, Upload },
  filters: {
    statusFilter(status, type) {
      const statusMap = {
        0: {
          label: '封禁',
          tag: 'danger'
        },
        1: {
          label: '正常',
          tag: 'success'
        }
      }
      return statusMap[status][type]
    },
    typeFilter(status) {
      const map = {
        local: '本地',
        wx: '微信'
      }
      return map[status]
    }
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10,
        importance: undefined,
        title: undefined,
        type: undefined,
        sort: '+id'
      },
      importanceOptions: [1, 2, 3],
      typeList: [],
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      statusOptions: ['published', 'draft', 'deleted'],
      showReviewer: false,
      temp: {
        id: undefined,
        userType: 'local', // 用户类型，本地：local，微信：wx
        userName: '', // 用户名
        userEmail: '', // 邮箱
        userSex: '', // 性别
        userBirthday: '', // 用户生日
        userPic: '', // 用户头像图片
        status: 1 // 0：封禁、1：正常
      },
      textMap: {
        update: '编辑用户信息',
        add: '新增用户'
      },
      dialogFormVisible: false,
      dialogStatus: '',
      dialogPvVisible: false,
      pvData: [],
      rules: {
        name: [{ required: true, message: '不能为空', trigger: 'change' }],
        userSex: [{ required: false, message: '不能为空', trigger: 'change' }],
        mobilePhone: [{ required: true, message: '不能为空', trigger: 'blur' }],
        passWord: [{ required: true, message: '不能为空', trigger: 'blur' }]
      },
      downloadLoading: false
    }
  },
  created() {
    this.initData()
  },
  methods: {
    initData() {
      this.getList()
    },
    getList() {
      this.listLoading = true
      this.$ajax('/manager/user/listUser', 'post', {
        pageNum: this.listQuery.page,
        pageSize: this.listQuery.limit
      }).then(response => {
        this.list = response.data.list
        this.total = response.data.total
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    findkeyItem(type) {
      const result = this.typeList.filter(item => item.type === type)
      if (result.length) {
        return result[0].typeName
      }
      return null
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleModifyStatus(row, status) {
      this.$message({
        message: '操作Success',
        type: 'success'
      })
      row.status = status
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+id'
      } else {
        this.listQuery.sort = '-id'
      }
      this.handleFilter()
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        userType: 'local',
        userName: '',
        userEmail: '',
        userSex: '',
        userBirthday: '',
        userPic: '',
        status: 1
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'add'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      // console.log(this.temp)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          this.$ajax('/manager/user/editUser', 'post', {
            recData: tempData
          }).then(res => {
            this.$message({
              showClose: true,
              message: '修改用户信息成功',
              type: 'success'
            })
            this.dialogFormVisible = false
            this.getList()
          }).catch(err => {
            this.$message({
              showClose: true,
              message: err,
              type: 'error'
            })
          })
        }
      })
    },
    handleDelete(row) {
      this.$notify({
        title: 'Success',
        message: 'Delete Successfully',
        type: 'success',
        duration: 2000
      })
      const index = this.list.indexOf(row)
      this.list.splice(index, 1)
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}`
        ? 'ascending'
        : sort === `-${key}`
          ? 'descending'
          : ''
    }
  }
}
</script>
