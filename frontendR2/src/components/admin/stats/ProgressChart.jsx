import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

const ProgressChart = ({ data, type = 'pie', height = 300 }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!data || !chartRef.current) return;

    const chart = echarts.init(chartRef.current);
    
    let option;
    
    if (type === 'pie') {
      option = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          right: 10,
          top: 'center',
          data: data.map(item => item.name)
        },
        series: [
          {
            name: 'Tâches',
            type: 'pie',
            radius: ['50%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '18',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: data.map(item => ({
              value: item.value,
              name: item.name,
              itemStyle: {
                color: getColorForStatus(item.name)
              }
            }))
          }
        ]
      };
    } else if (type === 'bar') {
      option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        xAxis: {
          type: 'category',
          data: data.map(item => item.month),
          axisLabel: {
            interval: 0,
            rotate: 45
          }
        },
        yAxis: {
          type: 'value',
          max: 100,
          axisLabel: {
            formatter: '{value}%'
          }
        },
        series: [
          {
            data: data.map(item => ({
              value: item.value,
              itemStyle: {
                color: item.value >= 80 ? '#06d6a0' : item.value >= 50 ? '#ffd166' : '#e63946'
              }
            })),
            type: 'bar',
            showBackground: true,
            backgroundStyle: {
              color: 'rgba(180, 180, 180, 0.2)'
            },
            label: {
              show: true,
              position: 'top',
              formatter: '{c}%'
            }
          }
        ]
      };
    } else if (type === 'line' || type === 'area') {
      option = {
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          boundaryGap: type === 'area' ? false : true,
          data: data.map(item => item.date ? item.date.split('-')[2] : '')
        },
        yAxis: {
          type: 'value',
          max: 100,
          axisLabel: {
            formatter: '{value}%'
          }
        },
        series: [
          {
            data: data.map(item => item.value || item.pourcentage),
            type: type === 'area' ? 'line' : type,
            areaStyle: type === 'area' ? {} : undefined,
            smooth: true,
            symbol: 'circle',
            symbolSize: 8,
            itemStyle: {
              color: '#457b9d'
            },
            lineStyle: {
              width: 3
            },
            label: {
              show: true,
              formatter: '{c}%'
            }
          }
        ]
      };
    }

    chart.setOption(option);

    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, [data, type]);

  const getColorForStatus = (status) => {
    switch (status) {
      case 'Terminées':
        return '#06d6a0';
      case 'En cours':
        return '#ffd166';
      case 'En retard':
        return '#e63946';
      case 'En attente':
        return '#a8dadc';
      default:
        return '#457b9d';
    }
  };

  return <div ref={chartRef} style={{ width: '100%', height: `${height}px` }} />;
};

export default ProgressChart;