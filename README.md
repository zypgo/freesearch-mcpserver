# FreeSearch MCP Server

FreeSearch MCP Server 是一个模型上下文协议（MCP）服务器，通过 DuckDuckGo 的 API 提供免费的网络搜索功能。它还包含智能摘要功能，利用 MCP 客户端内置的语言模型。

## 项目目的

本项目提供一个 JSON-RPC 2.0 服务器，具有以下功能：
- **免费网络搜索**：无需 API 密钥 - 使用 DuckDuckGo 的公共 API
- **智能摘要**：利用 MCP 客户端的语言模型进行搜索结果摘要
- **可定制提示词**：轻松修改提示模板以实现不同的摘要风格
- **零成本**：完全免费使用，无需任何 API 订阅

## 功能特性
- **JSON-RPC 端点**: `/rpc` - 客户端通过 JSON-RPC 协议调用服务器功能
- **健康检查端点**: `/ping` - 用于服务器健康状态检测
- **搜索工具**: `search` - 通过 DuckDuckGo 进行免费网络搜索
- **摘要工具**: `summarize` - 使用 MCP 客户端的语言模型生成搜索结果摘要

## 技术栈
- **Node.js & Express.js**: 作为服务器框架。
- **jsonrpc-lite**: 用于解析和构建 JSON-RPC 请求和响应。
- **dotenv**: 管理和加载环境变量配置。

## 安装步骤

### 系统需求
- **Node.js** (>= 14.x) 和 **npm**
- 本地安装 **@modelcontextprotocol/sdk**

### 项目安装
1. 克隆代码仓库:
   ```bash
   git clone https://your-repo-url.git
   cd freesearch-mcpserver
   ```

2. 安装项目依赖:
   ```bash
   npm install
   ```

3. 配置环境变量 (可选):
   - 复制 `.env.example` 为 `.env` 文件，配置端口号。
   ```plaintext
   PORT=3000
   # OpenAI API key 当前不需要，已预留给未来扩展
   # OPENAI_KEY=your-openai-api-key
   ```

4. 编译项目:
   ```bash
   npm run build
   ```

5. 启动服务器:
   ```bash
   npm start
   ```
   服务器将运行在你配置的端口上 (默认 3000)。

6. 运行测试来验证功能:
   ```bash
   npm run test:rpc
   ```

## 一键配置示例
你可以使用以下示例代码实例化和配置 MCP 服务器：

```typescript
import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import jsonrpc from 'jsonrpc-lite';
import dotenv from 'dotenv';

const { McpServer } = require('@modelcontextprotocol/sdk');

// 加载环境变量
dotenv.config();

const app = express();
app.use(bodyParser.json());

// 健康检查
app.get('/ping', (_req: Request, res: Response) =e {
    res.status(200).send('PONG');
});

// JSON-RPC 端点
app.post('/rpc', async (req: Request, res: Response) =e {
    try {
        const rpcRequest = jsonrpc.parseObject(req.body);
        if (rpcRequest.type === 'request' && rpcRequest.payload) {
            const response = await server.handle(rpcRequest.payload);
            res.json(jsonrpc.success(rpcRequest.payload.id, response));
        } else {
            res.status(400).send('Invalid RPC request');
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// 启动服务器
const port = process.env.PORT || 3000;
app.listen(port, () =e {
    console.log(`Server started on port ${port}`);
});
```

此代码片段适合用于快速配置在类似 Cursor 这样的客户端中使用的 MCP 服务器。

## 在 Cursor 中配置 MCP 服务器

1. 前往 Cursor 设置 -> MCP -> 添加新 MCP 服务器。
2. 以你喜欢的名称命名。
3. 使用命令类型配置如下：
   ```json
   {
     "mcpServers": {
       "freesearch": {
         "command": "npx",
         "args": [
           "freesearch-mcpserver@latest"
         ]
       }
     }
   }
   ```
4. 通过点击 "Edit" 验证配置或添加命令参数。

如果你还需要有关如何在特定平台（例如 Windows、Linux）上进行配置的具体说明或需要进一步帮助，请随时告知我！

## 快速开始

### 安装

```bash
npm install
```

### 开发

```bash
npm run dev    # 监视模式
npm run build  # 构建项目
```

## 代码质量

```bash
npm run lint        # 运行 ESLint
npm run lint:fix    # 修复 ESLint 问题
npm run format      # 使用 Prettier 格式化
npm run format:check # 检查格式
npm run type-check  # 类型检查（不构建）
```

## JSON-RPC 请求示例

### 搜索

```json
{
  "jsonrpc": "2.0",
  "method": "search",
  "params": {
    "query": "人工智能"
  },
  "id": 1
}
```

### 摘要

```json
{
  "jsonrpc": "2.0",
  "method": "summarize",
  "params": {
    "query": "最新技术",
    "results": [
      {
        "title": "AI 及其影响",
        "url": "https://example.com/ai",
        "snippet": "AI 正在改变各个行业..."
      }
    ]
  },
  "id": 2
}
```

## 如何自定义提示模板

您可以通过修改 `src/config/prompts.yml` 文件来自定义提示模板：

```yaml
# 提示词配置
summarize: |
  请用要点形式总结以下关于"{{query}}"的搜索结果：
  {{#each results}}
  - {{this.title}}: {{this.snippet}}
  {{/each}}
```

也可以通过命令行参数指定自定义提示文件：

```bash
npm run dev -- --prompt-file /path/to/your/prompts.yml
```

## 搜索场景限制

### DuckDuckGo API 限制
- **请求频率**：DuckDuckGo API 对请求频率有限制，建议控制调用频率，避免过度频繁的搜索请求
- **搜索结果数量**：单次搜索返回的结果数量有限，通常包含即时答案、摘要、定义和相关主题
- **搜索内容类型**：主要支持文本搜索，对于特殊格式（如图片、视频）的搜索结果支持有限

### 技术限制
- **网络依赖**：需要稳定的互联网连接才能正常工作
- **重试机制**：内置最多3次重试机制，使用指数退避策略处理网络错误
- **响应时间**：搜索响应时间取决于网络状况和 DuckDuckGo 服务器响应速度

### 使用建议
- **合理控制频率**：建议在应用中实现适当的请求间隔，避免触发 API 限制
- **错误处理**：务必在代码中实现完善的错误处理机制，处理网络超时、API 错误等情况
- **结果验证**：搜索结果的准确性和时效性依赖于 DuckDuckGo，建议对重要信息进行验证
- **缓存策略**：对于相同的搜索查询，建议实现本地缓存以减少重复请求

## OpenAPI 风格文档片段

### 搜索端点

```yaml
paths:
  /rpc:
    post:
      summary: "执行 JSON-RPC 命令"
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                jsonrpc:
                  type: string
                  example: "2.0"
                method:
                  type: string
                  example: "search"
                params:
                  type: object
                  properties:
                    query:
                      type: string
                      example: "人工智能"
                id:
                  type: integer
                  example: 1
```

### 摘要端点

```yaml
paths:
  /rpc:
    post:
      summary: "执行 JSON-RPC 命令"
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                jsonrpc:
                  type: string
                  example: "2.0"
                method:
                  type: string
                  example: "summarize"
                params:
                  type: object
                  properties:
                    query:
                      type: string
                      example: "最新技术"
                    results:
                      type: array
                      items:
                        type: object
                        properties:
                          title:
                            type: string
                            example: "AI 及其影响"
                          url:
                            type: string
                            example: "https://example.com/ai"
                          snippet:
                            type: string
                            example: "AI 正在改变各个行业..."
                id:
                  type: integer
                  example: 2
```

## 项目结构

```
freesearch-mcpserver/
├── src/                # 源代码文件
├── dist/               # 编译输出
├── package.json        # 项目配置
├── tsconfig.json       # TypeScript 配置
├── .eslintrc.json      # ESLint 配置
└── .prettierrc.json    # Prettier 配置
```
