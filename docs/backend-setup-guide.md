# 后端服务启动指南

## 问题诊断

调试功能卡在"开始执行工作流"步骤是因为后端服务未运行。

## 启动后端服务

### 方法一：使用Maven Wrapper（推荐）

```bash
cd backend
./mvnw spring-boot:run
```

Windows用户：
```cmd
cd backend
mvnw.cmd spring-boot:run
```

### 方法二：使用Java直接运行

如果已有编译好的jar包：
```bash
cd backend
java -jar target/*.jar
```

### 方法三：IDE启动

在IntelliJ IDEA或VS Code中：
1. 打开`backend`目录
2. 找到`Application.java`主类
3. 右键选择"Run Application"

## 验证服务状态

启动成功后，服务将在端口8080运行。可以通过以下方式验证：

```bash
# 检查服务是否响应
curl http://localhost:8080/api/workflows

# 或者在浏览器中访问
http://localhost:8080/api/workflows
```

## 常见问题

### 1. 端口被占用
如果8080端口已被占用，可以在`application.properties`中修改端口：
```properties
server.port=8081
```

### 2. Maven依赖下载失败
如果是网络问题导致依赖下载失败：
- 检查网络连接
- 配置Maven镜像源
- 或使用公司内部仓库

### 3. Java版本问题
确保使用Java 17或更高版本：
```bash
java -version
```

## 调试面板状态指示

改进后的调试面板会显示后端连接状态：
- 🟢 **已连接** - 后端服务正常运行
- 🔴 **后端未连接** - 后端服务未运行
- ⚠️ **黄色警告条** - 提醒用户启动后端服务

## 测试执行流程

启动后端服务后：
1. 在前端保存一个工作流
2. 打开调试面板
3. 输入测试文本
4. 点击"运行"按钮
5. 观察三个选项卡的变化：
   - 执行状态：显示节点执行进度
   - 执行日志：显示详细执行日志
   - 数据流转：显示数据在节点间的传递