const env = import.meta.env.MODE || "prod";
const EnvConfig = {
    development:{
        baseApi:"/api",
        mockApi:"https://m1.apifoxmock.com/m1/6079576-5769979-default/api",
    },
    test:{
        baseApi:"//test.future.com/api",
        mockApi:"https://m1.apifoxmock.com/m1/6079576-5769979-default/api",
    },
    prod:{
        baseApi:"//future.com/api",
        mockApi:"https://m1.apifoxmock.com/m1/6079576-5769979-default/api",
    },
}
export default {
    env,
    ...EnvConfig[env],
    //mock
    mock: true,
}