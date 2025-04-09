import Mock from 'mockjs'

// get请求从config.url获取参数，post从config.body中获取参数
function param2Obj(url) {
  const search = url.split('?')[1]
  if (!search) {
    return {}
  }
  return JSON.parse(
    '{"' +
    decodeURIComponent(search)
      .replace(/"/g, '\\"')
      .replace(/&/g, '","')
      .replace(/=/g, '":"') +
    '"}'
  )
}

// 生成商品列表数据
let List = []
const count = 200

for (let i = 0; i < count; i++) {
  List.push(
    Mock.mock({
      id: Mock.Random.guid(),
      name: Mock.Random.ctitle(3, 10),
      category: Mock.Random.pick(['手机', '电脑', '相机', '平板', '智能手表', '智能家居', '配件', '其他']),
      brand: Mock.Random.pick(['苹果', '小米', '华为', '三星', 'OPPO', 'vivo', '联想', '索尼', '佳能']),
      'price|100-9999': 1,
      'stock|10-200': 1,
      status: Mock.Random.pick([0, 1]), // 0: 下架, 1: 上架
      image: Mock.Random.image('100x100', '#4A7BF7', 'img'),
      createTime: Mock.Random.datetime(),
      updateTime: Mock.Random.datetime(),
      'sales|0-1000': 1,
      description: Mock.Random.cparagraph(1, 3)
    })
  )
}

// 商品类别数据
const categories = [
  { id: 1, name: '手机', count: 56 },
  { id: 2, name: '电脑', count: 45 },
  { id: 3, name: '相机', count: 32 },
  { id: 4, name: '平板', count: 28 },
  { id: 5, name: '智能手表', count: 15 },
  { id: 6, name: '智能家居', count: 24 },
  { id: 7, name: '配件', count: 67 },
  { id: 8, name: '其他', count: 30 }
]

// 品牌数据
const brands = [
  { id: 1, name: '苹果', count: 42 },
  { id: 2, name: '小米', count: 38 },
  { id: 3, name: '华为', count: 35 },
  { id: 4, name: '三星', count: 30 },
  { id: 5, name: 'OPPO', count: 25 },
  { id: 6, name: 'vivo', count: 23 },
  { id: 7, name: '联想', count: 20 },
  { id: 8, name: '索尼', count: 15 },
  { id: 9, name: '佳能', count: 12 }
]

export default {
  /**
   * 获取商品列表
   * 要带参数 name, page, pageSize, category, brand, status
   * @param name, page, pageSize, category, brand, status
   * @return {{code: number, count: number, data: *[]}}
   */
  getMallList: config => {
    const { name, page = 1, pageSize = 15, category, brand, status } = param2Obj(config.url)

    const mockList = List.filter(item => {
      if (name && item.name.indexOf(name) === -1) return false
      if (category && item.category !== category) return false
      if (brand && item.brand !== brand) return false
      if (status !== undefined && status !== '' && parseInt(item.status) !== parseInt(status)) return false
      return true
    })

    const pageList = mockList.filter((item, index) => index < pageSize * page && index >= pageSize * (page - 1))

    return {
      code: 200,
      data: {
        list: pageList,
        count: mockList.length,
      }
    }
  },

  /**
   * 获取商品类别列表
   * @return {{code: number, data: array}}
   */
  getCategories: () => {
    return {
      code: 200,
      data: categories
    }
  },

  /**
   * 获取品牌列表
   * @return {{code: number, data: array}}
   */
  getBrands: () => {
    return {
      code: 200,
      data: brands
    }
  },

  /**
   * 删除商品
   * @param id
   * @return {*}
   */
  deleteMall: config => {
    const { id } = param2Obj(config.url)
    if (!id) {
      return {
        code: -999,
        message: '参数不正确'
      }
    } else {
      List = List.filter(u => u.id !== id)
      return {
        code: 200,
        data:{
          message: '删除成功'

        }
      }
    }
  },

  /**
   * 批量删除商品
   * @param ids
   * @return {*}
   */
  batchDelete: config => {
    const { ids } = JSON.parse(config.body)
    if (!ids || ids.length === 0) {
      return {
        code: -999,
        message: '参数不正确'
      }
    } else {
      List = List.filter(u => !ids.includes(u.id))
      return {
        code: 200,
        data:{
          message: `成功删除${ids.length}条数据`

        }
      }
    }
  },

  /**
   * 添加商品
   * @param name, category, brand, price, stock, status, image, description
   * @return {{code: number, data: {message: string}}}
   */
  createMall: config => {
    const { name, category, brand, price, stock, status, image, description } = JSON.parse(config.body)
    List.unshift({
      id: Mock.Random.guid(),
      name,
      category,
      brand,
      price,
      stock,
      status,
      image: image || Mock.Random.image('100x100', '#4A7BF7', 'img'),
      createTime: Mock.Random.now('yyyy-MM-dd HH:mm:ss'),
      updateTime: Mock.Random.now('yyyy-MM-dd HH:mm:ss'),
      sales: 0,
      description
    })
    return {
      code: 200,
      data:{
        message: '添加成功'
      }
    }
  },

  /**
   * 修改商品
   * @param id, name, category, brand, price, stock, status, image, description
   * @return {{code: number, data: {message: string}}}
   */
  updateMall: config => {
    const { id, name, category, brand, price, stock, status, image, description } = JSON.parse(config.body)
    List.some(u => {
      if (u.id === id) {
        u.name = name
        u.category = category
        u.brand = brand
        u.price = price
        u.stock = stock
        u.status = status
        u.image = image || u.image
        u.updateTime = Mock.Random.now('yyyy-MM-dd HH:mm:ss')
        u.description = description
        return true
      }
    })
    return {
      code: 200,
      data:{
        message: '编辑成功'
      }
    }
  },

  /**
   * 修改商品状态（上架/下架）
   * @param id, status
   * @return {{code: number, data: {message: string}}}
   */
  updateStatus: config => {
    const { id, status } = JSON.parse(config.body)
    List.some(u => {
      if (u.id === id) {
        u.status = status
        u.updateTime = Mock.Random.now('yyyy-MM-dd HH:mm:ss')
        return true
      }
    })
    return {
      code: 200,
      data:{
        message: status === 1 ? '上架成功' : '下架成功'

      }
    }
  }
} 