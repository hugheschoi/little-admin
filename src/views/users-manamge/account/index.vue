<template>
  <div class="app-container">
    <!-- <div class="filter-container"></div> -->
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="用户id" prop="userId" align="center" width="180">
        <template slot-scope="scope">
          <span>{{ scope.row.userId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="场次id" prop="venueId" align="center" width="180">
        <template slot-scope="scope">
          <span>{{ scope.row.venueId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="场次名称" min-width="100px">
        <template slot-scope="{row}">
          <span>{{ row.venueName }}</span>
          <!-- <span class="link-type" @click="handleUpdate(row)">{{ row.venueName }}</span> -->
        </template>
      </el-table-column>
      <el-table-column label="保证金" prop="money" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.money }}</span>
        </template>
      </el-table-column>
      <el-table-column label="保证金状态" min-width="100px">
        <template slot-scope="{row}">
          <span>{{ row.status | statusFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="保证金订单" min-width="120px">
        <template slot-scope="{row}">
          <span>{{ row.orderNo }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="150px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.createTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
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
  </div>
</template>

<script>
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination'
export default {
  name: 'AccountList',
  components: { Pagination },
  filters: {
    statusFilter(status) {
      const statusMap = {
        0: '未支付',
        1: '已支付',
        2: '已退款'
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
      }
    }
  },
  created() {
    this.initData()
  },
  methods: {
    parseTime,
    initData() {
      this.getList()
    },
    getList() {
      this.listLoading = true
      this.$ajax('/manager/moneyVenue/getList', 'post', {
        pageNum: this.listQuery.page,
        pageSize: this.listQuery.limit
      }).then(response => {
        this.list = response.data;
        this.total = response.total || response.data.length;
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
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

<style>

</style>
