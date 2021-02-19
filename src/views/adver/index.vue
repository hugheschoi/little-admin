<template>
  <div class="app-container">
    <div class="filter-container">
      <!-- <el-input v-model="listQuery.title" placeholder="请输入关键词搜索" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button> -->
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        添加
      </el-button>
      <el-button style="float:right" round icon="el-icon-refresh" @click="initData">刷新</el-button>
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
      <el-table-column label="标题" min-width="150px">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.title }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" class-name="status-col" width="100">
        <template slot-scope="{row}">
          <el-tag :type="row.status === 0 ? 'danger': 'success'">
            {{ row.status | statusFilter }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="详情" class-name="status-col" width="100">
        <template slot-scope="{row}">
          <span>{{ row.isDetail | detailFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="标题图片" min-width="150px">
        <template slot-scope="{row}">
          <a class="link-type" :href="row.titileUrl" target="_blank"> 查看</a>
        </template>
      </el-table-column>
      <el-table-column label="文本内容" min-width="200px">
        <template slot-scope="{row}">
          <span>{{ row.content }}</span>
        </template>
      </el-table-column>
      <el-table-column label="文本链接地址" min-width="200px">
        <template slot-scope="{row}">
          <a class="link-type" :href="row.contentUrl" target="_blank"> 查看</a>
        </template>
      </el-table-column>
      <el-table-column label="创建人" min-width="150px">
        <template slot-scope="{row}">
          <span>{{ row.creater }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="150px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.createTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width" fixed="right">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button v-if="row.status!='deleted'" size="mini" type="danger" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="130px" style="width: 450px; margin-left:50px;">
        <el-form-item label="标题" prop="title">
          <el-input v-model="temp.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="temp.status">
            <el-radio :label="1">上架</el-radio>
            <el-radio :label="0">下架</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="详情" prop="isDetail">
          <el-radio-group v-model="temp.isDetail">
            <el-radio :label="1">有详情</el-radio>
            <el-radio :label="0">无详情</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="文本内容" prop="content">
          <el-input v-model="temp.content" :autosize="{ minRows: 2, maxRows: 4}" type="textarea" placeholder="请输入文本内容" />
        </el-form-item>
        <el-form-item label="文本链接地址" prop="contentUrl">
          <el-input v-model="temp.contentUrl" placeholder="请输入链接地址" />
        </el-form-item>
        <el-form-item label="图片" prop="titileUrl" style="margin-bottom: 30px;">
          <Upload v-model="temp.titileUrl" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='add'?createData():updateData()">
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
import Upload from '@/components/Upload/SingleImage2'
import { parseTime } from '@/utils'
// import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'ComplexTable',
  components: { Upload },
  // components: { Pagination, Upload },
  filters: {
    statusFilter(status) {
      const statusMap = {
        0: '下架',
        1: '上架'
      }
      return statusMap[status]
    },
    detailFilter(status) {
      const statusMap = {
        0: '无详情',
        1: '有详情'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      tableKey: 0,
      list: null,
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
        title: '',
        titileUrl: '',
        isDetail: 1,
        status: 1,
        content: '',
        contentUrl: ''
      },
      textMap: {
        update: '编辑广告',
        add: '新增广告'
      },
      dialogFormVisible: false,
      dialogStatus: '',
      dialogPvVisible: false,
      pvData: [],
      rules: {
        title: [{ required: true, message: '不能为空', trigger: 'blur' }],
        contentUrl: [{ required: false, message: '不能为空', trigger: 'blur' }],
        content: [{ required: true, message: '不能为空', trigger: 'blur' }],
        titileUrl: [{ required: true, message: '不能为空', trigger: 'change' }]
      },
      downloadLoading: false
    }
  },
  created() {
    this.initData()
  },
  methods: {
    async initData() {
      await this.getTypeList()
      this.getList()
    },
    getList() {
      this.listLoading = true
      this.$ajax('/manager/advert/findAll', 'post', {
        recData: null
      }).then(response => {
        this.list = response.data
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      }).catch(error => {
        console.log(error)
        this.listLoading = false
      })
    },
    getTypeList() {
      this.$ajax('/manager/product/getProductType', 'post', {
        recData: null
      }).then(response => {
        this.typeList = response.data
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
    handleDelete(row) {
      this.$ajax(`/manager/advert/delete`, 'post', {
        recData: {
          id: row.id
        }
      }).then(response => {
        this.$message({
          showClose: true,
          message: '删除成功',
          type: 'success'
        })
        this.getList()
      })
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
        title: '',
        titileUrl: '',
        isDetail: 1,
        status: 1,
        content: '',
        contentUrl: ''
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
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.$ajax('/manager/advert/add', 'post', {
            recData: this.temp
          }).then(res => {
            this.$message({
              showClose: true,
              message: '添加成功',
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
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
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
          if (tempData.titileUrl) {
            const index = tempData.titileUrl.search('images/')
            tempData.titileUrl = tempData.titileUrl.slice(index)
          }
          this.$ajax('/manager/advert/edit', 'post', {
            recData: tempData
          }).then(res => {
            this.$message({
              showClose: true,
              message: '编辑成功',
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
