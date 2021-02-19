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
      <el-table-column label="订单编号" prop="id" align="center" width="180">
        <template slot-scope="scope">
          <span class="link-type" @click="handleDetail(row)">{{ scope.row.orderNo }}</span>
        </template>
      </el-table-column>
      <el-table-column label="订单状态" class-name="status-col" width="100">
        <template slot-scope="{row}">
          <el-tag :type="row.orderStatus | statusFilter('tag')">
            {{ row.orderStatus | statusFilter('label') }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="是否支付" class-name="status-col" width="100">
        <template slot-scope="{row}">
          <el-tag :type="row.payStatus | statusPayStatus('tag')">
            {{ row.payStatus | statusPayStatus('label') }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="产品标题" min-width="150px">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleDetail(row)">{{ row.productTitl }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商品id" min-width="150px">
        <template slot-scope="{row}">
          <span>{{ row.productId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="价格" min-width="100px">
        <template slot-scope="{row}">
          <span>{{ row.price }}</span>
        </template>
      </el-table-column>
      <el-table-column label="是否填了收货地址" min-width="150px">
        <template slot-scope="{row}">
          <span>{{ row.isAddress ? '是' : '否' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" min-width="150px">
        <template slot-scope="{row}">
          <span>{{ row.createTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width" fixed="right">
        <template slot-scope="{row}">
          <el-button type="primary" size="small" icon="el-icon-edit" @click="handleDetail(row)">
            查看拍卖品
          </el-button>
          <el-button v-if="row.orderStatus==2" type="primary" size="mini" @click="sendProduct(row)">
            已发货
          </el-button>
          <!--<el-button type="primary" size="mini" @click="handleUpdate(row)">-->
            <!--编辑-->
          <!--</el-button>-->
          <!-- <el-button v-if="row.status!='deleted'" size="mini" type="danger" @click="handleModifyStatus(row,'deleted')">
            删除
          </el-button> -->
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      订单详情
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
// import Upload from '@/components/Upload/SingleImage2'
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'ComplexTable',
  components: { Pagination },
  filters: {
    statusFilter(status, type) {
      const statusMap = {
        1: {
          label: '新订单',
          tag: ''
        },
        2: {
          label: '待发货',
          tag: 'danger'
        },
        3: {
          label: '待收货',
          tag: 'warning'
        },
        4: {
          label: '已完成',
          tag: 'success'
        },
        5: {
          label: '已失效',
          tag: 'info'
        }
      }
      return statusMap[status][type]
    },
    statusPayStatus(status, type) {
      const statusMap = {
        0: {
          label: '未支付',
          tag: 'warning'
        },
        1: {
          label: '已支付',
          tag: 'success'
        }
      }
      return statusMap[status][type]
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
        type: '',
        title: '',
        auctioneer: '',
        auctioneerNo: '',
        endTime: new Date(),
        content: '',
        img: ''
      },
      textMap: {
        update: '编辑拍卖场次',
        add: '订单详情'
      },
      dialogFormVisible: false,
      dialogStatus: '',
      dialogPvVisible: false,
      pvData: [],
      rules: {
        type: [{ required: true, message: '类型不能为空', trigger: 'change' }],
        endTime: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }],
        title: [{ required: true, message: '标题不能为空', trigger: 'blur' }],
        auctioneer: [{ required: true, message: '拍卖师不能为空', trigger: 'blur' }],
        auctioneerNo: [{ required: true, message: '拍卖师编号不能为空', trigger: 'blur' }],
        content: [{ required: true, message: '介绍内容', trigger: 'blur' }],
        img: [{ required: true, message: '图片不能为空', trigger: 'change' }]
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
      this.$ajax('/manager/order/listAll', 'post', {
        pageNum: this.listQuery.page,
        pageSize: this.listQuery.limit,
        recData: {
          //orderStatus: 2,
          type: null
        }
      }).then(response => {
        this.list = response.data.list
        this.total = response.data.total
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
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
        type: '',
        title: '',
        auctioneer: '',
        auctioneerNo: '',
        endTime: new Date(),
        content: '',
        img: ''
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'add'
      this.dialogFormVisible = true
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.$ajax('/manager/product/addVenue', 'post', {
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
      sendProduct(row) { //发货
        if (confirm("确定已发货？")) {
            const tempData = {
                id: row.id,
                orderStatus: 3
            };
            this.$ajax('/manager/order/updateStatus', 'post', {
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
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.temp.timestamp = new Date(this.temp.timestamp)
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
          this.$ajax('/manager/product/updateVenue', 'post', {
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
    handleDetail(row) {
      this.$router.push(`/lots-manage/auction/${row.venueId}`)
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
