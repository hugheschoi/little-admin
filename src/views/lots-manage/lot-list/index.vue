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
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80" :class-name="getSortClass('id')">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="拍卖品标题" min-width="150px">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.title }}</span>
        </template>
      </el-table-column>
      <el-table-column label="显示/隐藏" min-width="100px">
        <template slot-scope="{row}">
          <span>{{ isEmpty(row.isDelete) ? '' : row.isDelete ? '显示' : '隐藏' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="联系方式" min-width="100px">
        <template slot-scope="{row}">
          <span>{{ row.linkPhone }}</span>
        </template>
      </el-table-column>
      <el-table-column label="保证金" min-width="100px">
        <template slot-scope="{row}">
          <span>{{ row.marginMoney }}</span>
        </template>
      </el-table-column>
      <el-table-column label="起拍价" min-width="100px">
        <template slot-scope="{row}">
          <span>{{ row.startPrice }}</span>
        </template>
      </el-table-column>
      <el-table-column label="产品描述信息" min-width="150px">
        <template slot-scope="{row}">
          <span>{{ row.productInfo }}</span>
        </template>
      </el-table-column>
      <el-table-column label="落槌价" min-width="100px">
        <template slot-scope="{row}">
          <span>{{ row.end_price }}</span>
        </template>
      </el-table-column>
      <!-- <el-table-column label="竞价阶梯" min-width="100px">
        <template slot-scope="{row}">
          <span>{{ row.increasePrice }}</span>
        </template>
      </el-table-column> -->
      <el-table-column label="佣金" min-width="100px">
        <template slot-scope="{row}">
          <span>{{ row.brokerage }}</span>
        </template>
      </el-table-column>
      <el-table-column label="艺术家" min-width="100px">
        <template slot-scope="{row}">
          <span>{{ row.artist }}</span>
        </template>
      </el-table-column>
      <el-table-column label="艺术家信息" min-width="150px">
        <template slot-scope="{row}">
          <span>{{ row.artistInfo }}</span>
        </template>
      </el-table-column>
      <el-table-column label="lot批号" min-width="120px">
        <template slot-scope="{row}">
          <span>{{ row.lot }}</span>
        </template>
      </el-table-column>
      <el-table-column label="尺寸" min-width="80px">
        <template slot-scope="{row}">
          <span>{{ row.size }}</span>
        </template>
      </el-table-column>
      <el-table-column label="质地" min-width="80px">
        <template slot-scope="{row}">
          <span>{{ row.texture }}</span>
        </template>
      </el-table-column>
      <el-table-column label="钤印" min-width="80px">
        <template slot-scope="{row}">
          <span>{{ row.seal }}</span>
        </template>
      </el-table-column>
      <el-table-column label="结拍时间" min-width="80px">
        <template slot-scope="{row}">
          <span>{{ row.end_time }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width" fixed="right">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <!-- <el-button v-if="row.status!='deleted'" size="mini" type="danger" @click="handleModifyStatus(row,'deleted')">
            删除
          </el-button> -->
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="100px" style="width: 450px; margin-left:50px;">
        <el-form-item label="拍卖品标题" prop="title">
          <el-input v-model="temp.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item v-if="dialogStatus==='update'" label="显示/隐藏" prop="isDelete">
          <el-radio-group v-model="temp.isDelete">
            <el-radio :label="0">隐藏</el-radio>
            <el-radio :label="1">显示</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="temp.type" class="filter-item" placeholder="请选择拍卖场类型">
            <el-option v-for="item in typeList" :key="item.id" :label="item.typeName" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="起拍价" prop="startPrice">
          <el-input-number v-model="temp.startPrice" :step="100" step-strictly />
        </el-form-item>
        <el-form-item label="联系方式" prop="linkPhone">
          <el-input v-model="temp.linkPhone" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="保证金" prop="marginMoney">
          <el-input-number v-model="temp.marginMoney" :step="100" step-strictly />
        </el-form-item>
        <!-- <el-form-item label="竞价阶梯" prop="increasePrice">
          <el-input-number v-model="temp.increasePrice" />
        </el-form-item> -->
        <el-form-item label="佣金(%)" prop="brokerage">
          <el-input-number v-model="temp.brokerage" />
        </el-form-item>
        <el-form-item label="艺术家" prop="artist">
          <el-input v-model="temp.artist" placeholder="请输入艺术家" />
        </el-form-item>
        <el-form-item label="艺术家信息" prop="artistInfo">
          <el-input v-model="temp.artistInfo" :autosize="{ minRows: 2, maxRows: 4}" type="textarea" placeholder="请输入艺术家信息" />
        </el-form-item>
        <el-form-item label="lot批号" prop="lot">
          <el-input v-model="temp.lot" placeholder="请输入lot批号" />
        </el-form-item>
        <el-form-item label="尺寸" prop="size">
          <el-input v-model="temp.size" placeholder="请输入尺寸" />
        </el-form-item>
        <el-form-item label="质地" prop="texture">
          <el-input v-model="temp.texture" placeholder="请输入质地" />
        </el-form-item>
        <el-form-item label="钤印" prop="texture">
          <el-input v-model="temp.seal" placeholder="请输入钤印" />
        </el-form-item>
        <el-form-item label="结拍时间" prop="endTime">
          <el-date-picker v-model="temp.endTime" type="datetime" placeholder="请选择拍卖场结束日期" />
        </el-form-item>
        <el-form-item label="是否包邮" prop="freeShipping">
          <el-radio-group v-model="temp.freeShipping">
            <el-radio :label="0">不包邮</el-radio>
            <el-radio :label="1">包邮</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="验货方式" prop="examineType">
          <el-radio-group v-model="temp.examineType">
            <el-radio :label="0">无</el-radio>
            <el-radio :label="1">当面验货</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="年代" prop="madeYear">
          <el-input v-model="temp.madeYear" placeholder="请输入年代" />
        </el-form-item>
        <el-form-item label="品相" prop="style">
          <el-input v-model="temp.style" placeholder="请输入拍卖品品相" />
        </el-form-item>
        <el-form-item label="产品描述信息" prop="productInfo">
          <el-input v-model="temp.productInfo" type="textarea" placeholder="请输入拍卖品描述信息" />
        </el-form-item>
        <el-form-item label="图片" prop="imgArray" style="margin-bottom: 30px;">
          <Upload v-model="temp.imgArray" @on-change="handleChangeImg" />
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
import Upload from '@/components/Upload/upload'
import { parseTime, formatImageUrl, isEmpty } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'ComplexTable',
  components: { Pagination, Upload },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
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
        id: null,
        type: '',
        venueId: undefined,
        title: '',
        isDelete: 1,
        startPrice: null,
        increasePrice: null,
        brokerage: null,
        artist: '',
        artistInfo: '',
        lot: '',
        size: '',
        texture: '',
        seal: '',
        // sort: '1',
        endTime: null,
        freeShipping: 0,
        examineType: 0,
        madeYear: '',
        style: '',
        imgArray: [],
        img2Array: [],
        // 新增
        linkPhone: '',
        marginMoney: null,
        productInfo: ''
      },
      textMap: {
        update: '编辑拍卖品',
        add: '新增拍卖品'
      },
      dialogFormVisible: false,
      dialogStatus: '',
      dialogPvVisible: false,
      pvData: [],
      rules: {
        type: [{ required: true, message: '不能为空', trigger: 'change' }],
        endTime: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }],
        title: [{ required: true, message: '不能为空', trigger: 'blur' }],
        startPrice: [{ required: true, message: '不能为空', trigger: 'blur' }],
        increasePrice: [{ required: true, message: '不能为空', trigger: 'blur' }],
        linkPhone: [{ required: false, message: '不能为空', trigger: 'blur' }],
        marginMoney: [{ required: true, message: '不能为空', trigger: 'blur' }],
        brokerage: [{ required: true, message: '不能为空', trigger: 'blur' }],
        artist: [{ required: false, message: '不能为空', trigger: 'blur' }],
        artistInfo: [{ required: false, message: '不能为空', trigger: 'blur' }],
        lot: [{ required: true, message: '不能为空', trigger: 'blur' }],
        size: [{ required: true, message: '不能为空', trigger: 'blur' }],
        texture: [{ required: false, message: '不能为空', trigger: 'blur' }],
        seal: [{ required: false, message: '不能为空', trigger: 'blur' }],
        freeShipping: [{ required: false, message: '不能为空', trigger: 'blur' }],
        examineType: [{ required: false, message: '不能为空', trigger: 'blur' }],
        madeYear: [{ required: false, message: '不能为空', trigger: 'blur' }],
        style: [{ required: false, message: '不能为空', trigger: 'blur' }],
        productInfo: [{ required: true, message: '不能为空', trigger: 'blur' }],
        imgArray: [{ required: true, message: '图片不能为空', trigger: 'change' }]
      },
      downloadLoading: false
    }
  },
  watch: {
    'temp.imgArray': {
      handler(v) {
        // console.log('temp.imgArray:', v)
      },
      deep: true,
      immediate: true
    },
    'temp.startPrice': {
      handler(v) {
          //console.log('temp.startPrice:', v)
          this.temp.marginMoney = v * 0.1;
      },
      deep: true,
      immediate: true
    }
  },
  created() {
    this.temp.venueId = this.$route.params.id
    this.initData()
  },
  methods: {
    isEmpty,
    initData() {
      this.getTypeList();
      this.getList();
    },
    getAuctionDetail() {
        this.listLoading = true
        this.$ajax('/manager/product/getVenueInfo', 'post', {
            recData: {
                venueId: this.$route.params.id
            }
        }).then(response => {
            this.temp.endTime = response.data.endTime+300000*(this.total);
            console.log(this.temp.endTime);
            this.listLoading = false;
        })
    },
    getList() {
      this.listLoading = true
      this.$ajax('/manager/product/getProductList', 'post', {
        pageNum: this.listQuery.page,
        pageSize: this.listQuery.limit,
        recData: {
          venueId: this.$route.params.id
        }
      }).then(response => {
        // console.log(response)
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
        id: null,
        venueId: this.$route.params.id,
        type: '',
        title: '',
        isDelete: 1,
        startPrice: null,
        increasePrice: null,
        brokerage: null,
        artist: '',
        artistInfo: '',
        lot: '',
        size: '',
        texture: '',
        seal: '',
        endTime: null,
        freeShipping: 0,
        examineType: 0,
        madeYear: '',
        style: '',
        imgArray: [],
        img2Array: [],
        linkPhone: '',
        marginMoney: null,
        productInfo: ''
      }
    },
    handleCreate() {
      this.resetTemp();
      this.getAuctionDetail();
      this.dialogStatus = 'add'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          // console.log(tempData)
          const formatArr = Array.from(tempData.imgArray, item => item.url.replace('/api/', ''))
          tempData.imgArray = formatArr
          tempData.img2Array = formatArr
          // console.log(tempData)
          this.$ajax('/manager/product/add', 'post', {
            recData: tempData
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
      if (this.temp.imgArray.length) {
        const formatArr = Array.from(this.temp.imgArray, (item, index) => {
          return {
            uid: index,
            url: item
          }
        })
        this.temp.imgArray = formatArr
      }
      // console.log(this.temp)
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
          const formatArr = Array.from(tempData.imgArray, item => formatImageUrl(item.url))
          tempData.imgArray = formatArr
          this.$ajax('/manager/product/update', 'post', {
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
    },
    handleChangeImg(fileList) {
      this.temp.imgArray = fileList
    }
  }
}
</script>
