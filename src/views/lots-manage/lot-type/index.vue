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
      <el-table-column label="产品类型名称" min-width="150px">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.typeName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="排序编号" width="100">
        <template slot-scope="{row}">
          <span>{{ row.sort }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="150px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.createTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建人" width="100">
        <template slot-scope="{row}">
          <span>{{ row.creater }}</span>
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
    <!-- <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" /> -->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" custom-class="sm-size-dialog" width="400">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="150px" style="width: 300px; margin-left:50px;">
        <el-form-item label="产品类型名称" prop="typeName">
          <el-input v-model="temp.typeName" placeholder="请输入产品类型名称" style="width: 200px" />
        </el-form-item>
        <el-form-item v-if="dialogStatus === 'update'" label="排序编号" prop="sort">
          <el-input-number v-model="temp.sort" placeholder="请输入排序编号" :min="1" :max="100" />
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

    <!-- <el-dialog :visible.sync="dialogPvVisible" title="Reading statistics">
      <el-table :data="pvData" border fit highlight-current-row style="width: 100%">
        <el-table-column prop="key" label="Channel" />
        <el-table-column prop="pv" label="Pv" />
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPvVisible = false">Confirm</el-button>
      </span>
    </el-dialog> -->
  </div>
</template>

<script>
// import Upload from '@/components/Upload/SingleImage2'
import { parseTime } from '@/utils'
// import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'ComplexTable',
  // components: { Pagination, Upload },
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
        typeName: '',
        sort: null
      },
      textMap: {
        update: '编辑产品类型',
        add: '新增产品类型'
      },
      dialogFormVisible: false,
      dialogStatus: '',
      dialogPvVisible: false,
      pvData: [],
      rules: {
        typeName: [{ required: true, message: '不能为空', trigger: 'blur' }],
        sort: [{ required: false, message: '不能为空', trigger: 'blur' }]
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
      this.$ajax('/manager/product/getProductType', 'post', {
        recData: null
      }).then(response => {
        this.total = response.data.length
        this.list = response.data
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
    handleDelete(row) {
      this.$ajax(`/manager/product/deleteProductType`, 'post', {
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
        typeName: '',
        sort: null
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
          this.$ajax('/manager/product/addProductType', 'post', {
            recData: {
              typeName: this.temp.typeName
            }
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
          this.$ajax('/manager/product/updateProductType', 'post', {
            recData: {
              id: tempData.id,
              typeName: tempData.typeName,
              sort: tempData.sort
            }
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
<style >
.sm-size-dialog .el-dialog__body {
  height: 150px;
  overflow: hidden;
}
</style>>
