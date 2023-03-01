<template>
  <h2>Hi</h2>
  <md-block>
    ```JS
    function foo () {
      return bar;
    }
    ```
  </md-block>
</template>

<script>
  export default {
    name: "DocumentationView.vue",
    mounted() {
      let mdblockScript = document.createElement('script')
      mdblockScript.setAttribute('type', 'module');
      mdblockScript.setAttribute('src', 'https://md-block.verou.me/md-block.js');
      document.head.appendChild(mdblockScript)
    }
  }
</script>

<style>

</style>