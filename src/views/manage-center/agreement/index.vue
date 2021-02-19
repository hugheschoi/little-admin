<template>
  <div class="app-container">
    <div class="filter-container">
      <!-- <el-input v-model="listQuery.title" placeholder="请输入关键词搜索" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>-->
      <el-button
        class="filter-item"
        style="margin-left: 10px;"
        type="primary"
        icon="el-icon-edit"
        @click="handleCreate"
        >添加</el-button
      >
      <el-button
        style="float:right"
        round
        icon="el-icon-refresh"
        @click="initData"
        >刷新</el-button
      >
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
      <el-table-column label="协议名称" min-width="150px">
        <template slot-scope="{ row }">
          <span class="link-type" @click="handleUpdate(row)">
            {{ row.name }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="协议内容" width="100">
        <template slot-scope="{ row }">
          <span class="text-overflow">{{ row.content }}</span>
        </template>
      </el-table-column>
      <!--<el-table-column label="协议内容链接" min-width="200px">-->
        <!--<template slot-scope="{ row }">-->
          <!--<a class="link-type" :href="row.contentLink" target="_blank">查看</a>-->
        <!--</template>-->
      <!--</el-table-column>-->
      <el-table-column label="协议类型" min-width="100px">
        <template slot-scope="{ row }">
          <span>{{ row.type | typeFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="150px" align="center">
        <template slot-scope="scope">
          <span>
            {{ scope.row.createTime | parseTime("{y}-{m}-{d} {h}:{i}") }}
          </span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="230"
        class-name="small-padding fixed-width"
        fixed="right"
      >
        <template slot-scope="{ row }">
          <el-button type="primary" size="mini" @click="handleUpdate(row)"
            >编辑</el-button
          >
          <!-- <el-popconfirm
            @onConfirm="handleDelete(row)"
            title="确定删除吗？"
          >
            <el-button slot="reference" size="mini" type="danger">删除</el-button>
          </el-popconfirm>-->
          <el-button size="mini" type="danger" @click="handleDelete(row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="100px"
        style="width:800px; margin-left:50px;"
      >
        <el-form-item label="协议名称" prop="name">
          <el-input v-model="temp.name" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="协议内容链接" prop="contentLink">
          <el-input v-model="temp.contentLink" placeholder="请输入内容链接" />
        </el-form-item>
        <el-form-item label="协议类型" prop="type">
          <el-select v-model="temp.type" placeholder="请选择协议类型">
            <el-option label="用户协议" value="user" />
            <el-option label="隐私协议" value="privacy" />
            <el-option label="拍卖协议" value="auction" />
            <el-option label="保证金规则" value="deposit" />
            <el-option label="信用额度协议" value="credit" />
          </el-select>
        </el-form-item>
        <el-form-item label="文本内容" prop="content">
          <Tinymce
            v-if="dialogFormVisible"
            ref="editor"
            v-model="temp.content"
            :height="400"
          />
        </el-form-item>
        <!-- <el-form-item label="协议内容" prop="content">
          <markdown-editor
            ref="markdownEditor"
            v-model="temp.content"
            language="zh_CN"
            height="500px"
          />
        </el-form-item> -->
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click="dialogStatus === 'add' ? createData() : updateData()"
          >确定</el-button
        >
      </div>
    </el-dialog>

    <el-dialog :visible.sync="dialogPvVisible" title="Reading statistics">
      <el-table
        :data="pvData"
        border
        fit
        highlight-current-row
        style="width: 100%"
      >
        <el-table-column prop="key" label="Channel" />
        <el-table-column prop="pv" label="Pv" />
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPvVisible = false"
          >Confirm</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import Tinymce from "@/components/Tinymce";
import MarkdownEditor from "@/components/MarkdownEditor";
// import Upload from '@/components/Upload/SingleImage2'
import { parseTime } from "@/utils";
import Pagination from "@/components/Pagination"; // secondary package based on el-pagination

export default {
  name: "ComplexTable",
  components: { Pagination, MarkdownEditor, Tinymce },
  filters: {
    typeFilter(type) {
      const typeMap = {
        user: "用户协议",
        privacy: "隐私协议",
        auction: "拍卖协议",
        deposit: "保证金规则",
        credit: "信用额度协议",
      };
      return typeMap[type];
    },
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
        sort: "+id",
      },
      importanceOptions: [1, 2, 3],
      typeList: [],
      sortOptions: [
        { label: "ID Ascending", key: "+id" },
        { label: "ID Descending", key: "-id" },
      ],
      statusOptions: ["published", "draft", "deleted"],
      showReviewer: false,
      temp: {
        id: undefined,
        name: "",
        content: "",
        contentLink: "",
        type: "",
      },
      textMap: {
        update: "编辑协议",
        add: "新增协议",
      },
      dialogFormVisible: false,
      dialogStatus: "",
      dialogPvVisible: false,
      pvData: [],
      rules: {
        name: [{ required: true, message: "不能为空", trigger: "blur" }],
        type: [{ required: true, message: "不能为空", trigger: "change" }],
      },
      downloadLoading: false,
    };
  },
  created() {
    this.initData();
  },
  methods: {
    initData() {
      this.getList();
    },
    getList() {
      this.listLoading = true;
      this.$ajax("/manager/agreement/findAll", "post", {
        pageNum: this.listQuery.page,
        pageSize: this.listQuery.limit,
        recData: null,
      }).then((response) => {
        this.total = response.data.length || 0;
        this.list = response.data;
        setTimeout(() => {
          this.listLoading = false;
        }, 1.5 * 1000);
      });
    },
    findkeyItem(type) {
      const result = this.typeList.filter((item) => item.type === type);
      if (result.length) {
        return result[0].typeName;
      }
      return null;
    },
    handleFilter() {
      this.listQuery.page = 1;
      this.getList();
    },
    handleDelete(row) {
      this.$ajax(`/manager/agreement/delete`, "post", {
        recData: {
          id: row.id,
        },
      }).then((response) => {
        this.$message({
          showClose: true,
          message: "删除成功",
          type: "success",
        });
        this.getList();
      });
    },
    sortChange(data) {
      const { prop, order } = data;
      if (prop === "id") {
        this.sortByID(order);
      }
    },
    sortByID(order) {
      if (order === "ascending") {
        this.listQuery.sort = "+id";
      } else {
        this.listQuery.sort = "-id";
      }
      this.handleFilter();
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        name: "",
        content: "",
        contentLink: "",
        type: "",
      };
    },
    handleCreate() {
      this.resetTemp();
      console.log(this.temp);
      this.dialogStatus = "add";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    createData() {
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {
          this.$ajax("/manager/agreement/add", "post", {
            recData: this.temp,
          })
            .then((res) => {
              this.$message({
                showClose: true,
                message: "添加成功",
                type: "success",
              });
              this.dialogFormVisible = false;
              this.getList();
            })
            .catch((err) => {
              this.$message({
                showClose: true,
                message: err,
                type: "error",
              });
            });
        }
      });
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row); // copy obj
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    updateData() {
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp);
          if (tempData.titileUrl) {
            const index = tempData.titileUrl.search("images/");
            tempData.titileUrl = tempData.titileUrl.slice(index);
          }
          this.$ajax("/manager/agreement/edit", "post", {
            recData: tempData,
          })
            .then((res) => {
              this.$message({
                showClose: true,
                message: "编辑成功",
                type: "success",
              });
              this.dialogFormVisible = false;
              this.getList();
            })
            .catch((err) => {
              this.$message({
                showClose: true,
                message: err,
                type: "error",
              });
            });
        }
      });
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map((v) =>
        filterVal.map((j) => {
          if (j === "timestamp") {
            return parseTime(v[j]);
          } else {
            return v[j];
          }
        })
      );
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort;
      return sort === `+${key}`
        ? "ascending"
        : sort === `-${key}`
        ? "descending"
        : "";
    },
  },
};
</script>
<style>
.text-overflow {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
</style>
