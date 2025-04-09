<script setup>
import * as echarts from "echarts";
import { ref, getCurrentInstance, onMounted, reactive,computed } from 'vue';
import { useAllDataStore } from "../stores";
const store = useAllDataStore()
//observer 接收观察器实例对象
const observer = ref(null)
//通过 getCurrentInstance 获取当前组件实例，并解构出 proxy，用于访问全局属性（例如 $api）
const { proxy } = getCurrentInstance();
const getImageUrl = (user) => {
    return new URL(`../assets/images/${user}.png`, import.meta.url).href
}
const tableData = ref([])
const countData = ref([])
const tableLabel = ref({
    name: "课程",
    todayBuy: "今日购买",
    monthBuy: "本月购买",
    totalBuy: "总购买",
})
// 计算用户头像，优先使用自定义头像，没有则使用默认头像
const userAvatar = computed(() => {
    return store.state.userData?.avatar || getImageUrl('user');
});
//折线图公共配置
const xOptions = reactive({
    // 图例文字颜色
    textStyle: {
        color: "#333",
    },
    legend: {},
    grid: {
        left: '5%',
        right: '4%',
        bottom: '10%',
    },
    // 提示框
    tooltip: {
        trigger: "axis",
    },
    xAxis: {
        type: "category", // 类目轴
        data: [],
        axisLine: {
            lineStyle: {
                color: "#17b3a3",
            },
        },
        axisLabel: {
            interval: 0,
            color: "#333",
        },
    },
    yAxis: [
        {
            type: "value",
            axisLine: {
                lineStyle: {
                    color: "#17b3a3",
                },
            },
        },
    ],
    color: ["#2ec7c9", "#b6a2de", "#5ab1ef", "#ffb980", "#d87a80", "#8d98b3"],
    series: [],
})
//bar图公共配置
const BarOptions = reactive({
    // 图例文字颜色
    textStyle: {
        color: "#333",
    },
    legend: {},
    grid: {
        left: '5%',
        right: '4%',
        bottom: '10%',
    },
    // 提示框
    tooltip: {
        trigger: "axis",
        axisPointer: {
            type: 'shadow'
        }
    },
    xAxis: {
        type: "category", // 类目轴
        data: [],
        axisLine: {
            lineStyle: {
                color: "#17b3a3",
            },
        },
        axisLabel: {
            interval: 0,
            color: "#333",
        },
    },
    yAxis: [
        {
            type: "value",
            axisLine: {
                lineStyle: {
                    color: "#17b3a3",
                },
            },
        },
    ],
    color: ["#2ec7c9", "#b6a2de", "#5ab1ef", "#ffb980", "#d87a80", "#8d98b3"],
    series: [],
})
//饼图公共配置
const pieOptions = reactive({
    tooltip: {
        trigger: "item",
    },

    grid: {
        left: '5%',
        right: '4%',
        bottom: '10%',
    },
    series: [{
        type: 'pie',
        radius: [25, 110],
        center: ['50%', '50%'],
        roseType: 'area',
        itemStyle: {
            borderRadius: 8
        },
        data: [],
    },

    ]
})
const getTableData = async () => {
    const data = await proxy.$api.getTableData();
    // console.log(data);
    tableData.value = data.tableData;
}
const getCountData = async () => {
    const data = await proxy.$api.getCountData();
    // console.log(data);
    countData.value = data;
}
const getChartData = async () => {
    const { orderData, userData, videoData } = await proxy.$api.getChartData();
    //折线图
    xOptions.xAxis.data = orderData.date;
    xOptions.series = Object.keys(orderData.data[0]).map(val => ({
        name: val,
        type: 'line',
        data: orderData.data.map(item => item[val]),
    }))
    const oneChart = echarts.init(proxy.$refs.oneChart);
    oneChart.setOption(xOptions);
    //bar图
    BarOptions.xAxis.data = userData.map(item => item.date);
    BarOptions.legend.data = ['新增用户', '活跃用户']
    BarOptions.series = [
        {
            name: '新增用户',
            type: 'bar',
            data: userData.map(item => item.new),
            emphasis: {
                focus: 'series'
            },
        },
        {
            name: '活跃用户',
            type: 'bar',
            data: userData.map(item => item.active),
            emphasis: {
                focus: 'series'
            },
        }
    ]
    const userEchart = echarts.init(proxy.$refs.userEchart);
    userEchart.setOption(BarOptions);
    //饼图
    pieOptions.series[0].data = videoData.map(item => ({
        value: item.value,
        name: item.name
    }))
    const videoEchart = echarts.init(proxy.$refs.videoEchart);
    videoEchart.setOption(pieOptions);
    //监听图表大小变化
    //ResizeObserver 如果监视的容器大小变化，如果改变会执行传递的回调
    observer.value = new ResizeObserver(entries => {
        oneChart.resize()
        userEchart.resize()
        videoEchart.resize()
    })
    //如果这个容器存在
    if (proxy.$refs['userEchart']) {
        //则调用监视器的observe方法，监视这个容器的大小
        observer.value.observe(proxy.$refs.userEchart);
    }
}



onMounted(() => {
    getTableData();
    getCountData();
    getChartData();
})

</script>

<template>
    <el-row class="home" :gutter="20">
        <!-- 左侧 -->
        <el-col :span="8">
            <div class="left-info">
                <!-- 用户卡片 -->
                <el-card shadow="hover">
                    <div class="user">
                        <img :src="userAvatar">
                        <div class="user-info">
                            <p class="user-admin">{{ store.state.userData.username }}</p>
                            <p class="user-admin-info">{{ store.state.userData.status }}</p>
                        </div>
                    </div>
                    <div class="login-info">
                        <p>上次登录时间:<span>2025-3-23</span></p>
                        <p>上次登陆地点:<span>北京</span></p>
                    </div>
                </el-card>
                <!-- 表格卡片 -->
                <el-card shadow="hover" class="user-table">
                    <el-table :data="tableData">
                        <el-table-column v-for="(val, key) in tableLabel" :key="key" :prop="key" :label="val" />
                    </el-table>
                </el-card>
            </div>
        </el-col>
        <!-- 右侧 -->
        <el-col :span="16">
            <div class="right-info">
                <el-card :body-style="{ display: 'flex', padding: 0 }" v-for="item in countData" :key="item.name" class="right-info">
                    <component :is="item.icon" class="icons" :style="{ background: item.color }" />
                    <div class="detail">
                        <p class="num">￥{{ item.value }}</p>
                        <p class="txt">￥{{ item.name }}</p>
                    </div>
                </el-card>
            </div>
            <!-- 图表 -->
            <el-card class="top-echart">
                <div ref="oneChart" style="height: 280px;"></div>
            </el-card>
            <div class="graph">
                <el-card>
                    <div ref="userEchart" style="height: 270px;"></div>
                </el-card>
                <el-card>
                    <div ref="videoEchart" style="height: 270px;"></div>
                </el-card>
            </div>
        </el-col>
    </el-row>
</template>

<style scoped lang="less">
.home {
    height: 100%;
    overflow: hidden; 
    display: flex;
    flex-wrap: nowrap;
    justify-content: center;

    .left-info {
        margin-right: 10px;

        .user {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
            border-bottom: 1px solid #ccc;

            img {
                width: 150px;
                height: 150px;
                border-radius: 50%;
                margin-right: 40px;
                margin-bottom: 20px;
            }

            .user-info {
                p {
                    line-height: 40px;
                    margin-right: 90px;
                }

                .user-admin {
                    font-size: 35px;
                }

                .user-admin-info {
                    color: #999;
                }
            }
        }

        .login-info {
            p {
                color: #999;
                line-height: 30px;
                font-size: 14px;
            }

            span {
                color: #303133;
                margin-left: 60px;
            }
        }

        .user-table {
            margin-top: 20px;
        }
    }

    .right-info {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        margin-right: 20px;
        margin-bottom: 10px;

        .el-card {
            margin-bottom: 20px;
        }

        .icons {
            width: 80px;
            height: 80px;
            font-size: 30px;
            line-height: 80px;
            text-align: center;
            color: #fff;
        }

        .detail {
            display: flex;
            flex-direction: column;
            justify-content: center;
            margin-left: 15px;

            .num {
                font-size: 30px;
                margin-bottom: 10px;
            }

            .txt {
                font-size: 15px;
                text-align: center;
                color: #999;
                white-space: nowrap;
            }
        }
    }

    .graph {
        display: flex;
        justify-content: space-between;
        margin-top: 20px;

        .el-card {
            width: 48%;
        }
    }
}
</style>
