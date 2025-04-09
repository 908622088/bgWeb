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

let List = []
const count = 300
//模拟300条用户数据
for (let i = 0; i < count; i++) {
  List.push(
    Mock.mock({
      id: Mock.Random.guid(),
      name: Mock.Random.cname(),
      addr: Mock.mock('@county(true)'),
      'age|18-60': 1,
      birth: Mock.Random.date(),
      sex: Mock.Random.integer(0, 1)
    })
  )
}


export default {
  /**
   * 获取列表
   * 要带参数 name, page, limt; name可以不填, page,limit有默认值。
   * @param name, page, limit
   * @return {{code: number, count: number, data: *[]}}
   */
  getUserList: config => {
    //limit默认是10，因为分页器默认也是一页15个
    const { name, page = 1, limit = 15 } = param2Obj(config.url)

    const mockList = List.filter(user => {
      //如果name存在会，根据name筛选数据
      if (name && user.name.indexOf(name) === -1) return false
      return true
    })
    //分页
    const pageList = mockList.filter((item, index) => index < limit * page && index >= limit * (page - 1))
    return {
      code: 200,
      data: {
        list: pageList,
        count: mockList.length, //数据总条数需要返回
      }
    }
  },
  /**
  * 删除用户
  * @param id
  * @return {*}
  */
  deleteUser: config => {
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
        message: '删除成功'
      }
    }
  },
  /**
   * 增加用户
   * @param name, addr, age, birth, sex
   * @return {{code: number, data: {message: string}}}
   */
  createUser: config => {
    const { name, addr, age, birth, sex } = JSON.parse(config.body)
    List.unshift({
      id: Mock.Random.guid(),
      name: name,
      addr: addr,
      age: age,
      birth: birth,
      sex: sex
    })
    return {
      code: 200,
      data: {
        message: '添加成功'
      }
    }
  },
  /**
   * 修改用户
   * @param id, name, addr, age, birth, sex
   * @return {{code: number, data: {message: string}}}
   */
  updateUser: config => {
    const { id, name, addr, age, birth, sex } = JSON.parse(config.body)
    const sex_num = parseInt(sex)
    List.some(u => {
      if (u.id === id) {
        u.name = name
        u.addr = addr
        u.age = age
        u.birth = birth
        u.sex = sex_num
        return true
      }
    })
    return {
      code: 200,
      data: {
        message: '编辑成功'
      }
    }
  },
  /**
   * 更新用户个人资料
   * @param username, realname, phone, email, position
   * @return {{code: number, data: {message: string}}}
   */
  updateProfile: config => {
    const { username, realname, phone, email, position } = JSON.parse(config.body)
    return {
      code: 200,
      message: '更新个人资料成功'
    }
  },
  /**
   * 修改密码
   * @param oldPassword, newPassword
   * @return {{code: number, data: {message: string}}}
   */
  changePassword: config => {
    const { oldPassword, newPassword } = JSON.parse(config.body)
    // 简单判断原密码是否为admin
    if (oldPassword !== 'admin') {
      return {
        code: -999,
        message: '原密码不正确'
      }
    }
    return {
      code: 200,
      message: '密码修改成功'
    }
  },
  /**
   * 获取登录日志
   * @return {{code: number, data: Array}}
   */
  getLoginLogs: () => {
    return {
      code: 200,
      data: [
        {
          time: '2023-04-01 08:30:45',
          ip: '192.168.1.1',
          location: '北京',
          device: 'Chrome / Windows 10'
        },
        {
          time: '2023-03-30 16:45:12',
          ip: '192.168.1.1',
          location: '北京',
          device: 'Chrome / Windows 10'
        },
        {
          time: '2023-03-28 09:12:36',
          ip: '115.168.45.65',
          location: '上海',
          device: 'Firefox / MacOS'
        }
      ]
    }
  },
  /**
   * 上传用户头像
   * @param FormData - 包含avatar文件
   * @return {{code: number, avatarUrl: string, message: string}}
   */
  uploadAvatar: config => {
    try {
      console.log('接收到头像上传请求');
      
      // 可以选择使用随机头像URL或生成本地头像
      const useRandomAvatar = true; // 设置为false则使用生成的SVG头像
      
      let avatarUrl;
      if (useRandomAvatar) {
        // 随机选择一个预设头像URL
        const randomAvatar = [
          'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
          'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
          'https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg',
          'https://img2.baidu.com/it/u=260211041,3935181676&fm=253&fmt=auto&app=120&f=JPEG?w=500&h=500'
        ];
        avatarUrl = randomAvatar[Math.floor(Math.random() * randomAvatar.length)];
      } else {
        // 创建一个简单的SVG头像作为本地头像
        const colors = ['9b59b6', 'e74c3c', '2ecc71', '3498db', 'f1c40f', 'e67e22'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
        
        const svg = `
          <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
            <rect width="200" height="200" fill="#${color}" />
            <text x="50%" y="50%" font-family="Arial" font-size="100" text-anchor="middle" dy=".35em" fill="#ffffff">${letter}</text>
          </svg>
        `.trim();
        
        // 转换为Base64
        avatarUrl = `data:image/svg+xml;base64,${btoa(svg)}`;
      }
      
      console.log('生成头像URL:', avatarUrl.substring(0, 50) + '...');
      
      return {
        code: 200,
        avatarUrl: avatarUrl,
        message: '头像上传成功'
      };
    } catch (error) {
      console.error('Mock上传头像失败:', error);
      return {
        code: 500,
        message: '头像上传失败，' + error.message
      };
    }
  }
}