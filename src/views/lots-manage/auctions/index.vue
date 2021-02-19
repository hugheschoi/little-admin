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
      <el-table-column label="状态" class-name="status-col" width="100">
        <template slot-scope="{row}">
          <el-tag :type="row.status | statusFilter('tag')">
            {{ row.status | statusFilter('label') }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="拍卖场次名称" min-width="150px">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleDetail(row)">{{ row.title }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商品来源" min-width="150px">
        <template slot-scope="{row}">
          <span>{{ row.productSource == 1 ? '自营' : '其他来源' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="显示/隐藏" min-width="150px">
        <template slot-scope="{row}">
          <span>{{ isEmpty(row.isDelete) ? '' : row.isDelete ? '显示' : '隐藏' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="拍卖类型" min-width="150px">
        <template slot-scope="{row}">
          <span>{{ findkeyItem(row.type) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="拍卖场介绍" min-width="150px">
        <template slot-scope="{row}">
          <span>{{ row.content }}</span>
        </template>
      </el-table-column>
      <el-table-column label="拍卖品数量" min-width="150px">
        <template slot-scope="{row}">
          <span>{{ row.productNumber }}</span>
        </template>
      </el-table-column>
      <el-table-column label="场次保证金" min-width="100px">
        <template slot-scope="{row}">
          <span>{{ row.marginMoney }}</span>
        </template>
      </el-table-column>
      <el-table-column label="出价次数" min-width="150px">
        <template slot-scope="{row}">
          <span>{{ row.biddingNumber }}</span>
        </template>
      </el-table-column>
      <el-table-column label="围观次数" min-width="150px">
        <template slot-scope="{row}">
          <span>{{ row.readNumber }}</span>
        </template>
      </el-table-column>
      <el-table-column label="开始日期" width="150px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.startTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="结束日期" width="150px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.endTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="拍卖师" min-width="150px">
        <template slot-scope="{row}">
          <span>{{ row.auctioneer }}</span>
        </template>
      </el-table-column>
      <el-table-column label="拍卖师编号" min-width="150px">
        <template slot-scope="{row}">
          <span>{{ row.auctioneerNo }}</span>
        </template>
      </el-table-column>
      <el-table-column label="区域" min-width="150px">
        <template slot-scope="{row}">
          <span>{{ (row.province || '') + (row.city || '' ) + (row.region || '') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="详细地址" min-width="150px">
        <template slot-scope="{row}">
          <span>{{ row.address }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width" fixed="right">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" :disabled="row.status === 2" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button type="primary" size="small" icon="el-icon-edit" @click="handleDetail(row)">
            查看拍卖品
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
        <el-form-item label="标题" prop="title">
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
        <el-form-item label="拍卖师" prop="auctioneer">
          <el-input v-model="temp.auctioneer" placeholder="请输入拍卖师" />
        </el-form-item>
        <el-form-item label="拍卖师编号" prop="auctioneerNo">
          <el-input v-model="temp.auctioneerNo" placeholder="请输入拍卖师编号" />
        </el-form-item>
        <el-form-item label="场次保证金" prop="marginMoney">
          <el-input-number v-model="temp.marginMoney" :step="100" step-strictly />
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker v-model="temp.startTime" type="datetime" default-time="10:00:00" placeholder="请选择拍卖场开始时间" />
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker v-model="temp.endTime" type="datetime" default-time="22:00:00" placeholder="请选择拍卖场结束时间" />
        </el-form-item>
        <el-form-item label="介绍内容" prop="content">
          <el-input v-model="temp.content" :autosize="{ minRows: 2, maxRows: 4}" type="textarea" placeholder="请输入介绍内容" />
        </el-form-item>
        <el-form-item label="省" prop="province">
          <el-input v-model="temp.province" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="市" prop="city">
          <el-input v-model="temp.city" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="区" prop="region">
          <el-input v-model="temp.region" placeholder="请输入" />
        </el-form-item>
        <!-- <el-form-item label="选择区域" prop="area">
          <el-cascader
            size="large"
            :options="options"
            v-model="temp.area"
            @change="handleChangeArea">
          </el-cascader>
        </el-form-item> -->
        <el-form-item label="详细地址" prop="address">
          <el-input v-model="temp.address" placeholder="请输入详细地址" />
        </el-form-item>
        <!--<el-form-item label="商品来源">-->
          <!--<el-radio-group v-model="temp.productSource">-->
            <!--<el-radio :label="1">自营</el-radio>-->
            <!--<el-radio :label="2">其他来源</el-radio>-->
          <!--</el-radio-group>-->
        <!--</el-form-item>-->
        <el-form-item label="图片" prop="img" style="margin-bottom: 30px;">
          <Upload v-model="temp.img" />
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
// import { regionData, CodeToText, TextToCode } from 'element-china-area-data'
import Upload from '@/components/Upload/SingleImage2'
import { parseTime, isEmpty } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'ComplexTable',
  components: { Pagination, Upload },
  filters: {
    statusFilter(status, type) {
      const statusMap = {
        0: {
          label: '未开始',
          tag: ''
        },
        1: {
          label: '拍卖中',
          tag: 'success'
        },
        2: {
          label: '已结拍',
          tag: 'info'
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
        isDelete: 1,
        auctioneer: '',
        auctioneerNo: '',
        marginMoney: null,
        startTime: null,//new Date(),
        endTime: null,//new Date(),
        content: '',
        img: '',
        province: '',
        city: '',
        region: '',
        address: '',
        productSource: 1
      },
      textMap: {
        update: '编辑拍卖场次',
        add: '新增拍卖场次'
      },
      dialogFormVisible: false,
      dialogStatus: '',
      dialogPvVisible: false,
      pvData: [],
      rules: {
        type: [{ required: true, message: '不能为空', trigger: 'change' }],
        startTime: [{ type: 'date', required: true, message: '开始时间不能为空', trigger: 'change' }],
        endTime: [{ type: 'date', required: true, message: '结束时间不能为空', trigger: 'change' }],
        title: [{ required: true, message: '不能为空', trigger: 'blur' }],
        // auctioneer: [{ required: false, message: '不能为空', trigger: 'blur' }],
        // auctioneerNo: [{ required: false, message: '不能为空', trigger: 'blur' }],
        marginMoney: [{ required: true, message: '不能为空', trigger: 'blur' }],
        // content: [{ required: true, message: '不能为空', trigger: 'blur' }],
        //province: [{ required: true, message: '不能为空', trigger: 'blur' }],
        //city: [{ required: true, message: '不能为空', trigger: 'blur' }],
        //region: [{ required: true, message: '不能为空', trigger: 'blur' }],
        //address: [{ required: true, message: '不能为空', trigger: 'blur' }],
        img: [{ required: true, message: '不能为空', trigger: 'change' }]
      },
      downloadLoading: false
    }
  },
  created() {
    this.initData()
  },
  methods: {
    /*
      value 数组
      text 返回对象
      code 返回数组回显
    */
    // handleChangeArea (v) {
    //   const area = this.formatArea(v)
    //   this.temp.province = area.province
    //   this.temp.city = area.city
    //   this.temp.region = area.region
    //   this.temp.area = v
    // },
    // formatArea (value, type = 'text') {
    //   if (type === 'text') {
    //     const [ province, city, region ] = Array.from(value, i => CodeToText[i])
    //     return {
    //       province,
    //       city,
    //       region
    //     }
    //   } else {
    //     console.log(value)
    //     const result = Array.from(value, (item, index) => {
    //       console.log(item, index)
    //       console.log(TextToCode[item])
    //       return TextToCode[item] ? TextToCode[item].code : ''
    //     })
    //     console.log(result)
    //     return result
    //   }
    //   // this.temp.area =
    //   // console.log(this.selectedOptions)
    // },
    isEmpty,
    async initData() {
      await this.getTypeList()
      this.getList()
    },
    getList() {
      this.listLoading = true
      this.$ajax('/manager/product/getListVenue', 'post', {
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
        isDelete: 1,
        auctioneer: '',
        auctioneerNo: '',
        marginMoney: null,
        startTime: null,//new Date(),
        endTime: null,//new Date(),
        content: '',
        img: '',
        province: '',
        city: '',
        region: '',
        address: '',
        productSource: 1
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
          const tempData = Object.assign({}, this.temp)
          this.$ajax('/manager/product/addVenue', 'post', {
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
      this.temp.productSource = parseInt(this.temp.productSource);
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
          if (tempData.img) {
            const index = tempData.img.search('images/')
            tempData.img = tempData.img.slice(index)
          }
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
      this.$router.push(`/lots-manage/auction/${row.id}`)
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
