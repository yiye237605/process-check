# 质量巡检系统

> 更新日期：2026-05-15

---

## 项目概述

质量巡检系统是一个用于工厂生产线工序检验的Web应用，支持工艺标准管理、检验记录提交、数据查询等功能。

**GitHub仓库**：https://github.com/yiye237605/process-check

---

## 技术栈

| 分类 | 技术 | 版本 |
|------|------|------|
| 前端框架 | Vue | ^3.0.0 |
| 构建工具 | Vite | ^5.0.0 |
| Vue插件 | @vitejs/plugin-vue | ^5.0.0 |
| 编程语言 | JavaScript (ES6+) | - |
| 样式 | 原生 CSS | - |
| API | REST API (Stored Procedure) | - |
| 版本控制 | Git | - |

---

## 项目结构

```
process-check/
├── index.html              # 入口HTML
├── package.json            # 项目配置
├── vite.config.js          # Vite配置
├── .env                    # 环境变量（本地）
├── .env.example            # 环境变量模板
├── .gitignore              # Git忽略配置
├── dist/                   # 打包输出目录
└── src/
    ├── main.js             # Vue入口
    ├── App.vue             # 根组件
    ├── api/
    │   └── index.js        # API接口封装
    └── components/
        └── ProcessCheck.vue # 主组件
```

---

## 功能模块

### 1. 产品分类选择
- 下拉选择产品分类
- 自动加载对应工序列表

### 2. 工序管理
- 查看工序列表
- 添加新工序
- 编辑工序信息
- 删除工序
- **工序下拉搜索**：支持模糊搜索选择（点击弹出列表，输入搜索匹配）

### 3. 检验记录
- 填写检验数量
- 填写不良数量
- 选择判定结果（OK/NG）
- 提交检验记录

### 4. 工艺标准展示
- 显示工艺标准1/2/3
- 操作人信息
- 处理意见

---

## 环境变量配置

### .env 文件（本地创建）

```env
# API地址
VITE_API_BASE_URL=https://wh.tsinsoft.com:10008/rest/db/storedproc

# API Token
VITE_API_TOKEN=你的API代币
```

### .env.example 模板

```env
# API地址
VITE_API_BASE_URL=https://wh.tsinsoft.com:10008/rest/db/storedproc

# API Token（必填）
VITE_API_TOKEN=你的API代币
```

---

## 安装步骤

### 1. 克隆项目

```bash
git clone https://github.com/yiye237605/process-check.git
cd process-check
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

```bash
# 复制模板文件
copy .env.example .env

# 编辑 .env 文件，填入实际的API地址和Token
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173/

---

## 部署

### 1. 创建生产环境配置文件（可选）

如果需要不同的API配置，创建 `.env.production` 文件：

```env
VITE_API_BASE_URL=https://你的生产API地址
VITE_API_TOKEN=你的生产Token
```

### 2. 打包

```bash
npm run build
```

输出目录：`dist/`

### 3. 部署到服务器

将 `dist` 文件夹内容部署到Web服务器（如 Nginx、Apache）。

**注意**：
- 不需要上传 `.env` 文件
- 环境变量在打包时已嵌入代码

---

## API接口

### 存储过程列表

| 接口名称 | 功能 |
|---------|------|
| WeiXin_ZLXJBT_select | 获取产品分类列表 |
| WeiXin_ZLXJ_select | 获取工序列表 |
| WeiXin_zl_gxxl_select | 工序模糊搜索 |
| WeiXin_zl_xjgx_list_insert | 添加工序 |
| WeiXin_zl_xjgx_list_update | 更新工序 |
| WeiXin_zl_xjgx_list_delete | 删除工序 |
| WeiXin_zl_xjgx_gybz_select | 获取工艺标准 |
| WeiXin_ZLXJ_insert | 提交检验记录 |

---

## 遇到的问题和解决方法

### 1. 敏感信息泄露到GitHub

**问题**：API Token和地址直接写在代码中被上传到GitHub

**解决**：
- 创建 `.env` 文件存储敏感信息
- 创建 `.env.example` 作为模板上传GitHub
- 将 `.env` 添加到 `.gitignore`
- 代码中使用 `import.meta.env.VITE_xxx` 读取环境变量
- 部署时环境变量已嵌入打包后的代码

```javascript
// 修改前（不安全）
const TOKEN = 'INDUSFO123'

// 修改后（安全）
const TOKEN = import.meta.env.VITE_API_TOKEN || ''
```

### 2. Git历史中包含敏感信息

**问题**：首次提交时将敏感信息上传到GitHub

**解决**：
```bash
git filter-branch --force --index-filter "git rm --cached --ignore-unmatch src/api/index.js" --prune-empty --tag-name-filter cat -- --all
git push origin main --force
```

### 3. 工序下拉搜索交互问题

**问题**：
- 点击输入框时下拉列表不弹出
- 输入时无法搜索匹配结果
- 点击其他区域下拉列表不收起

**解决**：
- 添加 `@focus` 事件触发下拉列表显示
- 添加 `@input` 事件带防抖调用搜索API
- 添加 `@blur` 事件延迟关闭下拉列表
- 模态框遮罩点击改为只关闭下拉列表而非整个弹窗

### 4. 编辑弹窗打开时自动弹出下拉列表

**问题**：打开编辑弹窗时工序下拉列表自动弹出，干扰操作

**解决**：删除 `openEditModal` 方法中调用 `fetchEditGxList('')` 的代码

### 5. API返回错误信息未显示

**问题**：接口返回 `{error: "工序已存在"}` 时没有显示给用户

**解决**：在API请求函数中检查data中的error字段

```javascript
if (result.data && result.data.length > 0 && result.data[0].error) {
  throw new Error(result.data[0].error)
}
```

### 6. Git未识别问题

**问题**：终端无法识别git命令

**解决**：
```powershell
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
git --version
```

### 7. 工序必填验证

**问题**：需要添加工序必填标识

**解决**：在label中添加红色星号
```html
<label><span class="required">*</span>工序：</label>
```

---

## 开发指南

### 添加新API接口

打开 `src/api/index.js`，在对应的API对象中添加新方法：

```javascript
export const yourApi = {
  yourMethod: async (params) => {
    const result = await request('Your_Stored_Procedure', [
      { name: '@param1', value: params.value1 }
    ])
    return result.data || []
  }
}
```

### 常用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 生产打包 |
| `npm run preview` | 预览打包结果 |

---

## 安全说明

- `.env` 文件包含敏感信息（API地址和Token）
- `.env` 文件已添加到 `.gitignore`，不会被提交到GitHub
- 敏感信息只存在于本地环境
- 部署时不需要上传 `.env` 文件
- Git历史中的敏感信息已通过filter-branch删除

---

## 更新日志

### v1.0.0 (2026-05-15)
- 完成基础功能开发
- 工序下拉搜索功能
- 添加/编辑/删除工序
- 检验记录提交
- 错误提示优化
- 敏感信息安全管理
- 项目文档整理

---

## 联系方式

- GitHub: https://github.com/yiye237605
- 项目地址: https://github.com/yiye237605/process-check