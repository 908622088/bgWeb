// 模拟大文件上传的处理
// 模拟存储分片信息的对象
const chunkStorage = {};

// 模拟网络延迟
const simulateNetworkDelay = (min = 200, max = 800) => {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
};

export default {
  /**
   * 上传文件分片
   * @param {Object} config - 请求配置
   * @return {Object} 上传结果
   */
  uploadChunk: async config => {
    try {
      // 模拟网络延迟
      await simulateNetworkDelay();
      
      // 从FormData中解析信息
      const body = config.body || '';
      
      // 尝试多种方式提取FormData值
      let fileId = getFormDataValue(body, 'fileId');
      let chunkIndex = getFormDataValue(body, 'chunkIndex');
      let chunkCount = getFormDataValue(body, 'chunkCount');
      let filename = getFormDataValue(body, 'filename');
      let fileSize = getFormDataValue(body, 'fileSize');
      
      console.log(`接收到文件分片请求: fileId=${fileId}, 分片索引=${chunkIndex}`);
      
      // 确保数值类型
      chunkIndex = parseInt(chunkIndex) || 0;
      chunkCount = parseInt(chunkCount) || 1;
      fileSize = parseInt(fileSize) || 0;
      
      // 提供默认值，确保即使数据不完整也能正常工作
      if (!fileId) {
        console.warn('文件ID缺失，使用默认ID');
        fileId = 'default-' + Date.now();
      }
      
      if (!filename) {
        filename = 'unknown-' + Date.now() + '.bin';
      }
      
      // 初始化文件存储空间
      if (!chunkStorage[fileId]) {
        chunkStorage[fileId] = {
          chunks: Array(chunkCount).fill(null),
          filename: filename,
          fileSize: fileSize,
          uploadedChunks: 0,
          lastUpdated: Date.now()
        };
        
        console.log(`创建新的文件上传记录: ${fileId}, 文件名: ${filename}, 共${chunkCount}个分片`);
      }
      
      // 检查分片是否已上传
      if (chunkStorage[fileId].chunks[chunkIndex]) {
        console.log(`分片 ${chunkIndex + 1}/${chunkCount} 已存在，跳过`);
        
        // 更新时间戳
        chunkStorage[fileId].lastUpdated = Date.now();
        
        return {
          code: 200,
          data: {
            chunkIndex,
            received: true,
            progress: Math.floor((chunkStorage[fileId].uploadedChunks / chunkCount) * 100),
            alreadyUploaded: true,
            success: true
          },
          msg: `分片 ${chunkIndex + 1}/${chunkCount} 已上传过`
        };
      }
      
      // 存储分片（模拟，实际不存储内容）
      chunkStorage[fileId].chunks[chunkIndex] = true;
      chunkStorage[fileId].uploadedChunks++;
      chunkStorage[fileId].lastUpdated = Date.now();
      
      // 计算上传进度
      const progress = Math.floor((chunkStorage[fileId].uploadedChunks / chunkCount) * 100);
      console.log(`文件 ${fileId} 当前进度: ${progress}%`);
      
      return {
        code: 200,
        data: {
          chunkIndex,
          received: true,
          progress,
          totalChunks: chunkCount,
          uploadedChunks: chunkStorage[fileId].uploadedChunks,
          success: true
        },
        msg: `分片 ${chunkIndex + 1}/${chunkCount} 上传成功`
      };
    } catch (error) {
      console.error('Mock上传分片失败:', error);
      // 即使发生错误，也返回成功响应，避免前端受到影响
      return {
        code: 200,
        data: {
          success: true,
          received: true,
          errorHandled: true,
          error: error.message
        },
        msg: '分片已处理(模拟成功)'
      };
    }
  },
  
  /**
   * 合并文件分片
   * @param {Object} config - 请求配置
   * @return {Object} 合并结果
   */
  mergeChunks: async config => {
    try {
      // 模拟合并需要的时间
      await simulateNetworkDelay(800, 2000);
      
      let body;
      try {
        body = config.body ? JSON.parse(config.body) : {};
      } catch (e) {
        // 尝试解析FormData
        body = {
          fileId: getFormDataValue(config.body || '', 'fileId'),
          filename: getFormDataValue(config.body || '', 'filename'),
          chunkCount: parseInt(getFormDataValue(config.body || '', 'chunkCount')) || 1,
          fileSize: parseInt(getFormDataValue(config.body || '', 'fileSize')) || 0
        };
      }
      
      const { fileId = 'unknown-' + Date.now(), filename = 'unknown.file', chunkCount = 1 } = body;
      
      console.log(`请求合并文件分片: ${fileId}, ${chunkCount}个分片`);
      
      // 生成模拟文件信息，即使没有找到分片信息也能正常工作
      const fileType = filename.split('.').pop() || '';
      const fileUrl = `https://example.com/uploads/${encodeURIComponent(filename)}?id=${fileId}`;
      const fileSize = (chunkStorage[fileId]?.fileSize) || 0;
      const formattedSize = formatFileSize(fileSize);
      
      // 如果找不到分片信息，也模拟合并成功
      if (!chunkStorage[fileId]) {
        console.warn(`找不到文件分片信息: ${fileId}，但仍返回成功响应`);
        return {
          code: 200,
          data: {
            fileUrl,
            filename,
            fileSize: formattedSize,
            fileType,
            uploadTime: new Date().toISOString(),
            success: true,
            warning: '找不到分片信息,但模拟成功'
          },
          msg: '文件合并成功（模拟）'
        };
      }
      
      // 清理临时存储
      setTimeout(() => {
        delete chunkStorage[fileId];
        console.log(`清理临时文件: ${fileId}`);
      }, 60000); // 保留1分钟，以防用户刷新页面后继续上传
      
      return {
        code: 200,
        data: {
          fileUrl,
          filename,
          fileSize: formattedSize,
          fileType,
          uploadTime: new Date().toISOString(),
          success: true
        },
        msg: '文件合并成功'
      };
    } catch (error) {
      console.error('Mock合并分片失败:', error);
      // 即使发生错误，也返回模拟的成功响应
      return {
        code: 200,
        data: {
          success: true,
          filename: 'error-handled-file.bin',
          fileUrl: 'https://example.com/uploads/error-handled-file.bin',
          fileSize: '0 B',
          fileType: 'bin',
          uploadTime: new Date().toISOString(),
          errorHandled: true,
          error: error.message
        },
        msg: '文件合并操作已处理(模拟成功)'
      };
    }
  }
};

/**
 * 从FormData中提取值的辅助函数
 * @param {string} formData - FormData字符串
 * @param {string} key - 要提取的键
 * @return {string} 提取的值
 */
function getFormDataValue(formData, key) {
  if (!formData) return '';
  
  // 尝试多种可能的格式
  const patterns = [
    // 标准格式
    new RegExp(`name="${key}"\\r\\n\\r\\n([^\\r]*)`, 'i'),
    // 替代格式1
    new RegExp(`name=${key}\\r\\n\\r\\n([^\\r]*)`, 'i'),
    // 替代格式2 (用于文件类型)
    new RegExp(`name="${key}"[^\\n]*\\r\\n\\r\\n([^\\r]*)`, 'i'),
    // JSON格式
    new RegExp(`"${key}"\\s*:\\s*"?([^",\\}]*)"?`, 'i')
  ];
  
  for (const regex of patterns) {
    const match = formData.match(regex);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  // 尝试解析为JSON
  try {
    const jsonMatch = formData.match(/(\{.*\})/);
    if (jsonMatch) {
      const json = JSON.parse(jsonMatch[1]);
      if (json[key] !== undefined) {
        return json[key];
      }
    }
  } catch (e) {
    // JSON解析失败，继续
  }
  
  return '';
}

/**
 * 格式化文件大小
 * @param {number} bytes - 文件大小（字节）
 * @return {string} 格式化后的大小
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + units[i];
} 