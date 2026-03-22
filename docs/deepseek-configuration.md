# DeepSeek大模型配置说明

## 功能概述

为大模型节点添加了DeepSeek专属配置选项，支持配置接口地址和API密钥等必要参数。

## 配置项说明

### DeepSeek专属配置

当选中DeepSeek作为Provider时，会显示以下配置项：

#### 1. 接口地址 (baseUrl)
- **说明**：DeepSeek API的基础URL地址
- **默认值**：`https://api.deepseek.com`
- **用途**：指定API请求的端点地址
- **示例**：
  - 官方地址：`https://api.deepseek.com`
  - 自定义代理：`https://your-proxy.com`

#### 2. API密钥 (apiKey)
- **说明**：您的DeepSeek API密钥
- **格式**：以`sk-`开头的字符串
- **安全性**：输入框为密码类型，隐藏显示
- **获取方式**：从DeepSeek官网获取

#### 3. Model名称
- **说明**：要使用的模型名称
- **推荐选项**：
  - `deepseek-chat`：通用对话模型
  - `deepseek-coder`：代码专用模型
- **自定义**：支持输入其他模型名称

#### 4. Temperature
- **说明**：控制输出的随机性
- **范围**：0.0 - 2.0
- **默认值**：0.7
- **建议**：
  - 创意任务：0.8-1.2
  - 精确任务：0.3-0.7
  - 代码生成：0.5-0.8

## 使用方法

### 配置步骤

1. **选择Provider**
   - 在大模型节点配置面板中
   - 从下拉菜单选择"DeepSeek"

2. **配置接口地址**
   - 输入DeepSeek API的基础URL
   - 使用官方地址或自定义代理地址

3. **输入API密钥**
   - 在API密钥输入框中输入您的密钥
   - 密钥会以密码形式隐藏显示

4. **选择模型**
   - 输入模型名称，如`deepseek-chat`
   - 或根据需要选择其他模型

5. **调整Temperature**
   - 滑动滑块调整温度值
   - 根据任务类型选择合适的值

### 配置示例

```
Provider: DeepSeek
接口地址: https://api.deepseek.com
API密钥: sk-xxxxxxxxxxxxxxxx
Model: deepseek-chat
Temperature: 0.7
```

## 界面展示

### DeepSeek配置界面

```
┌─────────────────────────────────────┐
│ 大模型配置                          │
├─────────────────────────────────────┤
│ Provider                            │
│ [DeepSeek ▼]                        │
│                                     │
│ 接口地址                            │
│ ┌─────────────────────────────────┐ │
│ │ https://api.deepseek.com        │ │
│ └─────────────────────────────────┘ │
│ DeepSeek API的基础URL地址          │
│                                     │
│ API 密钥                            │
│ ┌─────────────────────────────────┐ │
│ │ ••••••••••••••••••••           │ │
│ └─────────────────────────────────┘ │
│ 您的DeepSeek API密钥               │
│                                     │
│ Model                               │
│ ┌─────────────────────────────────┐ │
│ │ deepseek-chat                   │ │
│ └─────────────────────────────────┘ │
│ 推荐: deepseek-chat 或 deepseek-coder │
│                                     │
│ Temperature: 0.7                    │
│ [━━━━━━━●━━━━━━━━━━━━━━━]           │
│ 控制输出的随机性，值越高输出越随机  │
└─────────────────────────────────────┘
```

## 技术实现

### 类型定义扩展

```typescript
export interface NodeConfig {
  provider?: string;
  model?: string;
  systemPrompt?: string;
  temperature?: number;
  // 新增字段
  apiKey?: string;
  baseUrl?: string;
  // ...
}
```

### 条件渲染

```typescript
const provider = config.provider || 'openai';

// 仅在选择DeepSeek时显示
{provider === 'deepseek' && (
  <>
    <label>接口地址...</label>
    <label>API密钥...</label>
  </>
)}
```

### 输入框类型

- **接口地址**：`type="text"` - 明文显示
- **API密钥**：`type="password"` - 密码隐藏
- **Model**：`type="text"` - 明文显示

## 配置文件更新

**修改的文件：**
- `frontend/src/types/workflow.ts` - 添加apiKey和baseUrl字段
- `frontend/src/components/panels/LLMConfigPanel.tsx` - 添加DeepSeek专属配置UI

## 安全性考虑

### API密钥保护
- 使用`type="password"`隐藏输入内容
- 密钥存储在工作流配置中
- 建议使用环境变量或密钥管理服务

### 最佳实践
1. 不要在代码中硬编码API密钥
2. 定期轮换API密钥
3. 使用最小权限原则
4. 监控API使用情况

## 其他Provider

### OpenAI配置
- Model：gpt-4o, gpt-3.5-turbo等
- System Prompt
- Temperature

### 通义千问配置
- Model：qwen-max, qwen-plus等
- System Prompt
- Temperature

## 使用建议

### 模型选择
- **deepseek-chat**：适合一般对话、问答、文本生成
- **deepseek-coder**：适合代码生成、代码补全、技术问答

### Temperature设置
- **0.3-0.5**：事实性回答、代码生成
- **0.6-0.8**：平衡创造性和准确性
- **0.9-1.2**：创意写作、头脑风暴

### 接口地址
- 使用官方地址获得最佳性能
- 如需代理，确保代理服务稳定可靠
- 注意不同地区的访问限制