# NPM 发布指南

## 发布前准备

1. **更新 package.json**
   ```bash
   # 添加必要字段
   ```

2. **确保构建成功**
   ```bash
   npm run build
   npm test
   ```

3. **创建 .npmignore 文件**（如果需要）

## 发布步骤

1. **注册/登录 npm**
   ```bash
   # 如果没有账号，先注册
   npm adduser
   
   # 如果已有账号，登录
   npm login
   ```

2. **发布包**
   ```bash
   # 首次发布
   npm publish
   
   # 如果包含敏感信息，使用
   npm publish --access public
   ```

3. **更新版本**
   ```bash
   # 更新补丁版本 (1.0.0 -> 1.0.1)
   npm version patch
   
   # 更新次版本 (1.0.0 -> 1.1.0)
   npm version minor
   
   # 更新主版本 (1.0.0 -> 2.0.0)
   npm version major
   
   # 发布新版本
   npm publish
   ```

## 发布后在 Cursor 中使用

1. **安装包**
   ```bash
   npm install freesearch-mcpserver
   ```

2. **使用示例**
   ```javascript
   const { startServer } = require('freesearch-mcpserver');
   
   // 启动服务器
   startServer();
   ```
