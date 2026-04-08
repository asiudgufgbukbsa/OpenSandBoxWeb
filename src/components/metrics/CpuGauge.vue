<template>
  <div class="cpu-gauge">
    <v-chart
      ref="chartRef"
      :option="chartOption"
      :autoresize="true"
      style="height: 200px"
    />
    <div class="gauge-info">
      <div class="cores">{{ cores }} 核</div>
      <div class="usage">{{ value.toFixed(1) }}%</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { GaugeChart } from 'echarts/charts';

use([CanvasRenderer, GaugeChart]);

const props = withDefaults(
  defineProps<{
    value: number;
    cores?: number;
  }>(),
  {
    cores: 1,
  }
);

const chartRef = ref();

const chartOption = computed(() => ({
  series: [
    {
      type: 'gauge',
      startAngle: 200,
      endAngle: -20,
      min: 0,
      max: 100,
      splitNumber: 10,
      itemStyle: {
        color: props.value > 80 ? '#f56c6c' : props.value > 60 ? '#e6a23c' : '#67c23a',
      },
      progress: {
        show: true,
        width: 20,
      },
      pointer: {
        show: false,
      },
      axisLine: {
        lineStyle: {
          width: 20,
          color: [[1, '#e5e5e5']],
        },
      },
      axisTick: {
        show: false,
      },
      splitLine: {
        show: false,
      },
      axisLabel: {
        show: false,
      },
      anchor: {
        show: false,
      },
      title: {
        show: false,
      },
      detail: {
        show: false,
      },
      data: [
        {
          value: props.value,
        },
      ],
    },
  ],
}));
</script>

<style scoped lang="scss">
.cpu-gauge {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;

  .gauge-info {
    text-align: center;
    margin-top: -40px;

    .cores {
      font-size: 12px;
      color: #909399;
    }

    .usage {
      font-size: 24px;
      font-weight: 600;
      color: #303133;
    }
  }
}
</style>
