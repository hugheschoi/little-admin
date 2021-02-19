<template>
  <el-container style="height:calc(100vh - 88px)">
    <el-aside width="200px">
      <el-button
        class="filter-item"
        style="margin: 10px"
        type="primary"
        icon="el-icon-edit"
        @click="handleCreate"
        >添加帮助</el-button
      >
      <el-menu :default-active="'0'" @select="handleSelect">
        <el-menu-item
          v-for="(help, index) in totalData"
          :key="index"
          :index="index + ''"
        >
          <span slot="title">{{ help.groupName }}</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-main>
      <div class="app-container">
        <div class="filter-container">
          <!-- <el-input v-model="listQuery.title" placeholder="请输入关键词搜索" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
          <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
            搜索
          </el-button>-->
          <!-- <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
            添加
          </el-button>-->
          <el-button round icon="el-icon-refresh" @click="initData"
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
          <el-table-column label="条目分组" min-width="150px">
            <template slot-scope="{ row }">
              <span>{{ row.groupName }}</span>
            </template>
          </el-table-column>
          <el-table-column label="标题" min-width="150px">
            <template slot-scope="{ row }">
              <span class="link-type" @click="handleUpdate(row)">{{
                row.title
              }}</span>
            </template>
          </el-table-column>
          <el-table-column label="文本内容" min-width="220px">
            <template slot-scope="{ row }">
              <span class="text-overflow">{{ row.content }}</span>
            </template>
          </el-table-column>
          <el-table-column label="创建时间" width="150px" align="center">
            <template slot-scope="scope">
              <span>{{
                scope.row.createTime | parseTime("{y}-{m}-{d} {h}:{i}")
              }}</span>
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
              <el-button
                v-if="row.status != 'deleted'"
                size="mini"
                type="danger"
                @click="handleDelete(row)"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>
        <el-dialog
          :title="textMap[dialogStatus]"
          :visible.sync="dialogFormVisible"
        >
          <el-form
            ref="dataForm"
            :rules="rules"
            :model="temp"
            label-position="left"
            label-width="100px"
            style="width:800px; margin-left:50px;"
          >
            <el-form-item label="条目分组" prop="groupName">
              <el-input v-model="temp.groupName" placeholder="请输入条目分组" />
            </el-form-item>
            <el-form-item label="标题" prop="title">
              <el-input v-model="temp.title" placeholder="请输入标题" />
            </el-form-item>
            <el-form-item label="文本内容" prop="content">
              <Tinymce
                ref="editor"
                v-if="dialogFormVisible"
                v-model="temp.content"
                :height="400"
              />
            </el-form-item>
            <!-- <el-form-item label="文本内容" prop="content">
              <markdown-editor
                ref="markdownEditor"
                v-model="temp.content"
                language="zh_CN"
                height="500px"
              />
            </el-form-item> -->
            <!-- <el-form-item label="文本内容" prop="content">
              <el-input v-model="temp.content" :autosize="{ minRows: 2, maxRows: 5}" type="textarea" placeholder="请输入文本内容" />
            </el-form-item>-->
            <el-form-item label="图片" prop="img" style="margin-bottom: 30px;">
              <Upload v-model="temp.img" />
            </el-form-item>
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
    </el-main>
  </el-container>
</template>

<script>
import Tinymce from "@/components/Tinymce";
import MarkdownEditor from "@/components/MarkdownEditor";
import Upload from "@/components/Upload/upload";
import { parseTime } from "@/utils";
// import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: "ComplexTable",
  components: { Upload, MarkdownEditor, Tinymce },
  // components: { Pagination, Upload },
  data() {
    return {
      tableKey: 0,
      totalData: [],
      currentIndex: 0,
      list: null,
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
        title: "",
        content: "",
        img: [],
      },
      textMap: {
        update: "编辑帮助",
        add: "新增帮助",
      },
      dialogFormVisible: false,
      dialogStatus: "",
      dialogPvVisible: false,
      pvData: [],
      rules: {
        groupName: [{ required: true, message: "不能为空", trigger: "blur" }],
        title: [{ required: true, message: "不能为空", trigger: "blur" }],
        content: [{ required: false, message: "不能为空", trigger: "blur" }],
        img: [{ required: false, message: "不能为空", trigger: "change" }],
      },
      downloadLoading: false,
    };
  },
  created() {
    this.initData();
  },
  methods: {
    handleSelect(index) {
      this.currentIndex = Number(index);
      this.list = this.totalData[Number(index)].list;
    },
    initData() {
      this.getList();
    },
    getList() {
      this.listLoading = true;
      this.$ajax("/manager/helpEntry/findAll", "post", {
        recData: null,
      }).then((response) => {
        this.totalData = response.data;
        this.list = this.totalData.length
          ? this.totalData[this.currentIndex || 0].list
          : [];
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
      this.$ajax(`/manager/helpEntry/delete`, "post", {
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
        title: "",
        content: "",
        img: [],
      };
    },
    handleCreate() {
      this.resetTemp();
      this.dialogStatus = "add";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    createData() {
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {
          this.$ajax("/manager/helpEntry/add", "post", {
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
      // console.log(this.temp)
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
          this.$ajax("/manager/helpEntry/edit", "post", {
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
  white-space: nowrap;
}
</style>
