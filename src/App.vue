<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style lang="scss">
.el-dialog {
  margin-top: 10vh !important;
}
.el-dialog__body {
  height: 700px;
  overflow-y: auto;
}
.text-over-flow {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
