<template>
  <div class="metrics-chart">
    <v-chart
      ref="chartRef"
      :option="chartOption"
      :autoresize="true"
      style="height: 300px"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LineChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from 'echarts/components';
import type { MetricsHistoryPoint } from '@/api/types';

use([
  CanvasRenderer,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
]);

const props = withDefaults(
  defineProps<{
    data: MetricsHistoryPoint[];
    loading?: boolean;
  }>(),
  {
    loading: false,
  }
);

const chartRef = ref();

const chartOption = computed(() => {
  const times = props.data.map((d) => {
    const date = new Date(d.timestamp);
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  });

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
      },
    },
    legend: {
      data: ['CPU使用率', '内存使用率'],
      bottom: 0,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: times,
      axisLabel: {
        rotate: 45,
        fontSize: 10,
      },
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLabel: {
        formatter: '{value}%',
      },
    },
    series: [
      {
        name: 'CPU使用率',
        type: 'line',
        smooth: true,
        symbol: 'none',
        data: props.data.map((d) => d.cpu),
        lineStyle: {
          color: '#409eff',
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
              { offset: 1, color: 'rgba(64, 158, 255, 0)' },
            ],
          },
        },
      },
      {
        name: '内存使用率',
        type: 'line',
        smooth: true,
        symbol: 'none',
        data: props.data.map((d) => d.memory),
        lineStyle: {
          color: '#67c23a',
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(103, 194, 58, 0.3)' },
              { offset: 1, color: 'rgba(103, 194, 58, 0)' },
            ],
          },
        },
      },
    ],
  };
});
</script>

<style scoped lang="scss">
.metrics-chart {
  width: 100%;
}
</style>
