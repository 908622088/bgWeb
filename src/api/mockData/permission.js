import Mock from 'mockjs'

// 安全的base64编码函数，可以处理Unicode字符
function safeBase64Encode(str) {
  // 将字符串转换为UTF-8编码，然后再进行base64编码
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
    return String.fromCharCode('0x' + p1);
  }));
}

// 安全的base64解码函数，可以处理Unicode字符
function safeBase64Decode(str) {
  // 将base64解码，然后处理UTF-8编码
  return decodeURIComponent(
    atob(str)
      .split('')
      .map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join('')
  );
}

// 生成JWT格式的token
const generateToken = (user, expiresIn = 1800) => {
  // 实际项目中这里应该包含用户ID、角色等信息并进行签名
  // 这里我们只是模拟一个JWT格式的token
  const header = safeBase64Encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = safeBase64Encode(JSON.stringify({
    sub: user.username,
    role: user.status,
    exp: Math.floor(Date.now() / 1000) + expiresIn,
    iat: Math.floor(Date.now() / 1000),
    jti: Mock.Random.guid()
  }));
  const signature = safeBase64Encode(Mock.Random.guid()); // 模拟签名
  
  return `${header}.${payload}.${signature}`;
}

export default {
  getMenu: config => {
    const { username, password } = JSON.parse(config.body)
    // 先判断用户是否存在
    // 判断账号和密码是否对应
    //menuList用于后面做权限分配，也就是用户可以展示的菜单
    if (username === 'admin' && password === 'admin') {
      // 生成access token (10秒有效)
      const token = generateToken({ username, status: '超级管理员' }, 10);
      // 生成refresh token (7天有效)
      const refreshToken = generateToken({ username, status: '超级管理员' }, 7 * 24 * 60 * 60);
      
      return {
        code: 200,
        data: {
          menuList: [
            {
              path: '/home',
              name: 'home',
              label: '首页',
              icon: 'house',
              url: 'Home'
            },
            {
              path: '/mall',
              name: 'mall',
              label: '商品管理',
              icon: 'video-play',
              url: 'Mall'
            },
            {
              path: '/user',
              name: 'user',
              label: '用户管理',
              icon: 'user',
              url: 'User'
            },
            {
              path: '/TestDemo',
              name: 'TestDemo',
              label: '测试页面',
              icon: 'list',
              url: 'TestDemo'
            },
            {
              path: '/other',
              label: '其他',
              icon: 'location',
              children: [
                {
                  path: '/page1',
                  name: 'page1',
                  label: '页面1',
                  icon: 'setting',
                  url: 'Page1'
                },
                {
                  path: '/page2',
                  name: 'page2',
                  label: '页面2',
                  icon: 'setting',
                  url: 'Page2'
                }
              ]
            }
          ],
          token: token,
          refreshToken: refreshToken,
          expiresIn: 10, // 过期时间改为10秒
          userData:{
            username:username,
            password:password,
            phone:'15812341234',
            status:'超级管理员',
            email:'123456122@qq.com',
            avatar: ''
          },
          message: '获取成功'
        }
      }
    
    } else if (username === 'user' && password === 'user') {
      // 生成access token (10秒有效)
      const token = generateToken({ username, status: '管理员' }, 10);
      // 生成refresh token (7天有效)
      const refreshToken = generateToken({ username, status: '管理员' }, 7 * 24 * 60 * 60);
      
      return {
        code: 200,
        data: {
          menuList: [
            {
              path: '/home',
              name: 'home',
              label: '首页',
              icon: 'house',
              url: 'Home'
            },
            {
              path: '/user',
              name: 'user',
              label: '用户管理',
              icon: 'user',
              url: 'User'
            },
            {
              path: '/TestDemo',
              name: 'TestDemo',
              label: '测试页面',
              icon: 'list',
              url: 'TestDemo'
            }
          ],
          token: token,
          refreshToken: refreshToken,
          expiresIn: 10, // 过期时间改为10秒
          userData:{
            username:username,
            password:password,
            phone:'16912341234',
            status:'管理员',
            email:'789456123@qq.com',
            avatar: ''
          },
          message: '获取成功'
        }
      }
    } else {
        
      return {
        code: -999,
        data: {
          message: '密码错误'
        }
      }
        
    }
  },
  
  // 刷新token接口
  refreshToken: config => {
    try {
      const { refreshToken } = JSON.parse(config.body);
      
      // 解析refreshToken (在实际项目中会验证签名和过期时间)
      const parts = refreshToken.split('.');
      if (parts.length !== 3) {
        return { 
          code: 401, 
          message: 'Invalid refresh token' 
        };
      }
      
      // 解析payload
      try {
        const payload = JSON.parse(safeBase64Decode(parts[1]));
        
        // 检查是否过期
        if (payload.exp < Math.floor(Date.now() / 1000)) {
          return { 
            code: 401, 
            message: 'Refresh token expired' 
          };
        }
        
        // 生成新的access token，继续使用10秒有效期（便于测试）
        const newToken = generateToken({ username: payload.sub, status: payload.role }, 10);
        // 生成新的refresh token (实现refresh token轮换)
        const newRefreshToken = generateToken({ username: payload.sub, status: payload.role }, 7 * 24 * 60 * 60);
        
        
        return {
          code: 200,
          data: {
            token: newToken,
            refreshToken: newRefreshToken,
            expiresIn: 10
          },
          message: 'Token refreshed successfully'
        };
      } catch (decodeError) {
        console.error('Token decode error:', decodeError);
        return { 
          code: 401, 
          message: 'Invalid token format' 
        };
      }
    } catch (error) {
      console.error('Refresh token error:', error);
      return {
        code: 401,
        message: 'Invalid refresh token'
      };
    }
  }
}