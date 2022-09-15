<template>
  <div class="container">
    <canvas ref="bjsCanvas" />
  </div>
</template>

<script>
import { ref, onMounted } from "@vue/runtime-core";
import createScene from "./Scene";

export default {
  name: "Scene",
  setup() {
    const bjsCanvas = ref(null);

    onMounted(() => {
      if (bjsCanvas.value) {
        createScene(bjsCanvas.value);
      }
    });

    return {
      bjsCanvas,
    };
  },
};
</script>