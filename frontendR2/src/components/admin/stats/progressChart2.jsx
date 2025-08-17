// ProgressChart.js
import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import dayjs from 'dayjs';

const ProgressChart = ({ data, type = 'pie', height = 300 }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!data || !chartRef.current || data.length === 0) return;

    const chart = echarts.init(chartRef.current);
    
    const option = {
      tooltip: {
        trigger: 'axis',
        formatter: (params) => {
          const date = params[0].axisValue;
          const value = params[0].data;
          return `Jour ${date}<br/>Complétion: ${value}%`;
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: data.map(item => dayjs(item.date).format('DD')),
        axisLabel: {
          interval: 0
        }
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 100,
        axisLabel: {
          formatter: '{value}%'
        }
      },
      series: [
        {
          name: 'Taux de complétion',
          type: 'line',
          data: data.map(item => item.value),
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(69, 123, 157, 0.8)' },
              { offset: 1, color: 'rgba(69, 123, 157, 0.1)' }
            ])
          },
          itemStyle: {
            color: '#457b9d'
          },
          lineStyle: {
            width: 3
          },
          symbol: 'circle',
          symbolSize: 8,
          smooth: true
        }
      ]
    };

    chart.setOption(option);

    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, [data, type]);

  return <div ref={chartRef} style={{ width: '100%', height: `${height}px` }} />;
};

export default ProgressChart;