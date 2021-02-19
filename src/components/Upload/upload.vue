<template>
  <div>
    <el-upload
      name="images"
      :multiple="true"
      action="/manager/product/uploadImg"
      list-type="picture-card"
      :headers="myHeader"
      :on-success="handleImageSuccess"
      :on-remove="handleImageRemove"
      :file-list="imgList"
    >
      <i slot="default" class="el-icon-plus" />
      <div slot="file" slot-scope="{file}">
        <img
          class="el-upload-list__item-thumbnail"
          :src="file.url"
          alt=""
        >
        <span class="el-upload-list__item-actions">
          <span
            class="el-upload-list__item-preview"
            @click="handlePictureCardPreview(file)"
          >
            <i class="el-icon-zoom-in" />
          </span>
          <span
            v-if="!disabled"
            class="el-upload-list__item-delete"
            @click="handleDownload(file)"
          >
            <i class="el-icon-download" />
          </span>
          <span
            v-if="!disabled"
            class="el-upload-list__item-delete"
            @click="handleRemove(file)"
          >
            <i class="el-icon-delete" />
          </span>
        </span>
      </div>
    </el-upload>
    <el-dialog :visible.sync="dialogVisible">
      <img width="100%" :src="dialogImageUrl" alt="">
    </el-dialog>
  </div>
</template>
<script>
import { getToken } from '@/utils/auth' // get token from cookie
import store from '@/store'
export default {
  props: {
    value: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      dialogImageUrl: '',
      dialogVisible: false,
      disabled: false,
      imgList: []
      // host: '/api/'
    }
  },
  computed: {
    // imgList: {
    //   get() {
    //     return this.value
    //   },
    //   set(v) {
    //     this.$emit('input', v)
    //   }
    // },
    myHeader() {
      return {
        'token': getToken()
      }
    }
  },
  watch: {
    'value': {
      handler(newVal, oldVal) {
        this.imgList = newVal
      },
      immediate: true
    }
  },
  methods: {
    handleRemove(file) {
      console.log(file)
    },
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url
      this.dialogVisible = true
    },
    handleDownload(file) {
      console.log(file)
    },
    handleImageRemove(file, fileList) {
      console.log('file, fileList', file, fileList)
      this.imgList = fileList
      console.log(this.imgList)
      this.$emit('on-change', fileList)
    },
    handleImageSuccess(response, file, fileList) {
      if (response.resCode === '10002') {
        // 登陆超时
        this.$alert('', response.resMsg, {
          confirmButtonText: '确定',
          callback: action => {
            store.dispatch('user/resetToken').then(() => {
              location.reload()
            })
          }
        })
      } else {
        console.log('response, file, fileList', response, file, fileList)
        const url = '/' + response.data[0]
        const len = this.imgList.length
        this.imgList.push({
          uid: len,
          url
        })
        this.$emit('on-change', this.imgList)
      }
    }
  }
}
</script>
