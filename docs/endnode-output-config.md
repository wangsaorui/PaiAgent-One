# EndNode 输出配置功能说明

## 功能概述

为EndNode节点添加了输出配置功能，允许用户：
1. 配置输出参数（支持手动输入和引用其他节点输出）
2. 配置回答内容模板，可以引用输出参数

## 使用方法

### 1. 输出参数配置
当选择EndNode节点时，在右侧配置面板中会出现"输出配置"部分：

#### 添加输出参数
- 点击"添加"按钮添加新的输出参数行
- 每个参数包含以下配置项：
  - **参数名**: 参数的标识名称
  - **参数类型**: 
    - `输入`: 手动输入固定值
    - `引用`: 引用其他节点的输出
  - **值/引用配置**:
    - 类型为"输入"时：直接输入值
    - 类型为"引用"时：选择要引用的节点和输出键

#### 删除参数
- 每个参数行都有"删除"按钮，可以移除不需要的参数

### 2. 回答内容配置
在输出参数下方是回答内容配置区域：

#### 模板编写
- 可以直接在文本框中编写回答模板
- 支持使用 `{{参数名}}` 语法引用已定义的输出参数

#### 快速插入参数
- 在回答内容标题旁边会显示所有已定义参数的按钮
- 点击参数按钮可以快速将 `{{参数名}}` 插入到光标位置
- 插入后光标会自动定位到参数引用之后

## 数据结构

### OutputParam 接口
```typescript
interface OutputParam {
  name: string;           // 参数名
  type: 'input' | 'reference';  // 参数类型
  value: string;          // 输入类型的值
  referenceNodeId?: string;     // 引用的节点ID
  referenceOutputKey?: string;  // 引用的输出键名
}
```

### NodeConfig 扩展
```typescript
interface NodeConfig {
  // ... 其他配置项
  outputParams?: OutputParam[];  // 输出参数数组
  responseTemplate?: string;     // 回答内容模板
}
```

## 示例配置

### 场景：播客生成工作流
假设工作流包含以下节点：
- `node-1`: 用户输入节点
- `node-2`: LLM节点（生成播客内容）
- `node-3`: TTS节点（生成音频）
- `node-4`: EndNode（输出结果）

EndNode配置示例：
```json
{
  "outputParams": [
    {
      "name": "podcast_content",
      "type": "reference",
      "referenceNodeId": "node-2",
      "referenceOutputKey": "output"
    },
    {
      "name": "audio_file",
      "type": "reference",
      "referenceNodeId": "node-3",
      "referenceOutputKey": "audio_url"
    },
    {
      "name": "status",
      "type": "input",
      "value": "success"
    }
  ],
  "responseTemplate": "播客生成完成！\n内容：{{podcast_content}}\n音频：{{audio_file}}\n状态：{{status}}"
}
```

最终输出结果：
```
播客生成完成！
内容：这里是生成的播客内容...
音频：http://example.com/audio.mp3
状态：success
```

## 技术实现

### 组件结构
- `EndNodeConfigPanel.tsx`: 主配置面板组件
- 在 `NodeSidebar.tsx` 中集成显示逻辑
- 类型定义在 `workflow.ts` 中扩展

### 核心功能
1. **动态表单管理**: 支持添加/删除输出参数行
2. **类型切换**: 在输入和引用类型间切换时自动清理无关字段
3. **智能引用**: 自动过滤掉不可引用的节点（当前节点和其它EndNode）
4. **模板插入**: 支持在光标位置精确插入参数引用
5. **实时预览**: 参数按钮提供直观的模板构建体验

## 注意事项

1. 引用的节点必须在当前工作流中存在
2. 引用的输出键需要与被引用节点的实际输出结构匹配
3. 参数名应保持唯一性以避免引用冲突
4. 模板中的未定义参数引用将保持原样显示