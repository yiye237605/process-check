# 工序检验移动端应用 - Code Wiki

## 1. 项目概述

### 1.1 基本信息

| 属性 | 值 |
|------|-----|
| **项目名称** | process-check |
| **项目版本** | 1.0.0 |
| **项目类型** | 移动端Web应用 |
| **项目用途** | 生产线工序质量检验 |
| **开发框架** | Vue 3 + Vite 5 |
| **编程范式** | Options API |

### 1.2 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| **Vue.js** | ^3.0.0 | 前端框架 |
| **Vite** | ^5.0.0 | 构建工具 |
| **@vitejs/plugin-vue** | ^5.0.0 | Vue插件 |
| **Fetch API** | - | HTTP请求 |

---

## 2. 项目架构

### 2.1 整体架构

```
┌─────────────────────────────────────────────┐
│              Vue 3 Application               │
├─────────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐     │
│  │           App.vue (Root)            │     │
│  └─────────────────────────────────────┘     │
│                    ↓                         │
│  ┌─────────────────────────────────────┐     │
│  │      ProcessCheck.vue (Main)        │     │
│  │  ┌─────────┬─────────┬─────────┐    │     │
│  │  │  Modal  │  Modal  │  Modal  │    │     │
│  │  │ (Add)   │ (Edit)  │(Delete) │    │     │
│  │  └─────────┴─────────┴─────────┘    │     │
│  └─────────────────────────────────────┘     │
│                    ↓                         │
│  ┌─────────────────────────────────────┐     │
│  │       Remote API (REST)             │     │
│  │  https://wh.tsinsoft.com:10008     │     │
│  └─────────────────────────────────────┘     │
└─────────────────────────────────────────────┘
```

### 2.2 目录结构

```
工序检验/
├── src/                          # 源代码目录
│   ├── main.js                   # Vue应用入口
│   ├── App.vue                   # 根组件
│   └── components/               # 组件目录
│       └── ProcessCheck.vue      # 工序检验主组件
├── dist/                         # 构建输出目录
│   ├── index.html               # 构建入口HTML
│   └── assets/                   # 静态资源
├── package.json                  # 项目依赖配置
├── vite.config.js               # Vite配置
├── index.html                    # 开发入口HTML
├── CLAUDE.md                     # Claude AI指导文件
└── CODE_WIKI.md                 # 本文档
```

### 2.3 模块依赖关系

```
index.html
    ↓
main.js (createApp)
    ↓
App.vue (根组件)
    ↓
ProcessCheck.vue (主业务组件)
    ↓
Remote API (数据交互)
```

---

## 3. 核心模块详解

### 3.1 入口文件 - main.js

**文件路径**: `src/main.js`

**职责**: Vue应用的初始化和挂载

**核心功能**:
- 导入Vue和根组件
- 创建Vue应用实例
- 挂载到DOM元素

**关键代码**:

```javascript
import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
```

**说明**: 这是Vue 3的标准入口模式，使用`createApp`工厂函数创建应用实例。

---

### 3.2 根组件 - App.vue

**文件路径**: `src/App.vue`

**职责**: 应用根容器，引入主组件

**核心功能**:
- 作为应用的最外层容器
- 引入并注册`ProcessCheck`组件

**关键代码**:

```vue
<template>
  <ProcessCheck />
</template>

<script>
import ProcessCheck from './components/ProcessCheck.vue'

export default {
  name: 'App',
  components: {
    ProcessCheck
  }
}
</script>
```

**说明**: 采用组件化结构，根组件仅作为容器使用。

---

### 3.3 工序检验主组件 - ProcessCheck.vue

**文件路径**: `src/components/ProcessCheck.vue`

**职责**: 核心业务组件，处理工序检验的全部逻辑

**代码规模**: 619行（包含模板、逻辑和样式）

#### 3.3.1 组件状态 (data)

| 状态名 | 类型 | 说明 |
|--------|------|------|
| `userno` | String | 用户编号（从URL参数获取） |
| `processList` | Array | 工序列表 |
| `categoryList` | Array | 分类列表 |
| `selectedCategory` | String | 当前选中的分类 |
| `selectedIdHide` | String | 当前分类ID |
| `showDropdown` | Boolean | 下拉菜单显示状态 |
| `showAddModal` | Boolean | 添加弹窗显示状态 |
| `showEditModal` | Boolean | 编辑弹窗显示状态 |
| `showDeleteModal` | Boolean | 删除确认弹窗显示状态 |
| `addForm` | Object | 添加表单数据 |
| `editForm` | Object | 编辑表单数据 |
| `deleteItemId` | String | 待删除项ID |
| `touchStartX` | Number | 触摸起始X坐标 |
| `touchCurrentX` | Number | 触摸当前X坐标 |
| `loading` | Boolean | 加载状态 |
| `error` | String/null | 错误信息 |
| `toast` | Object | 提示信息配置 |

#### 3.3.2 生命周期钩子

**created()**:
```javascript
created() {
  this.getUrlParams()
  this.fetchCategoryList()
}
```

**执行流程**:
1. 解析URL参数获取`userno`
2. 获取分类列表数据

#### 3.3.3 核心方法列表

##### 3.3.3.1 URL参数处理

| 方法名 | 参数 | 返回值 | 功能 |
|--------|------|--------|------|
| `getUrlParams()` | 无 | void | 解析URL参数 |

**实现**:
```javascript
getUrlParams() {
  const urlParams = new URLSearchParams(window.location.search)
  this.userno = urlParams.get('userno') || ''
}
```

##### 3.3.3.2 数据获取方法

| 方法名 | 功能 |
|--------|------|
| `fetchCategoryList()` | 获取分类列表 |
| `fetchProcessList()` | 获取工序列表 |
| `fetchGybz(item)` | 获取工艺标准详情 |

**API端点**: `https://wh.tsinsoft.com:10008/rest/db/storedproc`

**请求参数结构**:
```javascript
{
  db_name: '锐凯电子',
  proc_name: '存储过程名',
  method: 'open_proc',
  params: [
    { name: '@参数名', value: '参数值' }
  ]
}
```

**存储过程映射**:

| 功能 | 存储过程名 |
|------|-----------|
| 获取分类 | `WeiXin_ZLXJBT_select` |
| 获取工序列表 | `WeiXin_ZLXJ_select` |
| 添加工序 | `WeiXin_zl_xjgx_list_insert` |
| 更新工序 | `WeiXin_zl_xjgx_list_update` |
| 删除工序 | `WeiXin_zl_xjgx_list_delete` |
| 获取工艺标准 | `WeiXin_zl_xjgx_gybz_select` |
| 提交检验 | `WeiXin_ZLXJ_insert` |

##### 3.3.3.3 CRUD操作方法

| 方法名 | 功能 |
|--------|------|
| `submitAdd()` | 添加工序 |
| `submitEdit()` | 更新工序 |
| `confirmDelete()` | 删除工序 |
| `submitDetail()` | 提交检验详情 |

**数据验证**:
- `submitAdd()`: 验证工序(gx)、质量等级(zldj)、标准要求(bzyq)
- `submitEdit()`: 同添加验证
- `submitDetail()`: 验证产品型号(productModel)和判定(judgment)

##### 3.3.3.4 UI交互方法

| 方法名 | 功能 |
|--------|------|
| `selectCategory(cat)` | 选择分类 |
| `openEditModal(item)` | 打开编辑弹窗 |
| `openDeleteConfirm(item)` | 打开删除确认弹窗 |
| `toggleExpand(id)` | 展开/收起详情面板 |
| `closeAllSlides()` | 关闭所有滑动项 |
| `showToast(message, type)` | 显示提示信息 |

**Toast类型**: `info`, `success`, `error`

##### 3.3.3.5 触摸滑动操作

| 方法名 | 功能 |
|--------|------|
| `touchStart(e, item)` | 触摸开始 |
| `touchMove(e, item)` | 触摸移动 |
| `touchEnd(item)` | 触摸结束 |

**滑动配置**:
- 滑动方向: 左滑
- 最大滑动距离: 120px
- 触发阈值: 60px

##### 3.3.3.6 工具方法

| 方法名 | 功能 |
|--------|------|
| `getCurrentTime()` | 获取当前时间（格式：YYYY-MM-DD HH:mm:ss） |

**实现**:
```javascript
getCurrentTime() {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const hh = String(now.getHours()).padStart(2, '0')
  const mi = String(now.getMinutes()).padStart(2, '0')
  const ss = String(now.getSeconds()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`
}
```

#### 3.3.4 数据结构

##### 工序项结构 (processList)

```javascript
{
  id: String,           // 工序ID
  va1: String,          // 工序名称
  va2: String,          // 质量等级
  va3: String,          // 检验标准
  expanded: Boolean,    // 是否展开
  sliding: Boolean,     // 是否滑动
  slideOffset: Number,  // 滑动偏移量
  gybzLoaded: Boolean, // 工艺标准是否已加载
  checkTime: String,   // 检查时间
  productModel: String, // 产品型号
  operator: String,     // 操作人
  standard1: String,   // 工艺标准I
  standard2: String,   // 工艺标准II
  standard3: String,   // 工艺标准III
  checkCount: Number,  // 检查数
  defectCount: Number, // 不良数
  suggestion: String,  // 处理意见
  judgment: String,    // 判定 (OK/NG)
  submitted: Boolean   // 是否已提交
}
```

##### 分类项结构 (categoryList)

```javascript
{
  cj: String,      // 分类名称
  ID_HIDE: String  // 分类ID
}
```

---

## 4. 依赖关系

### 4.1 项目依赖

```json
{
  "dependencies": {
    "vue": "^3.0.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "@vitejs/plugin-vue": "^5.0.0"
  }
}
```

### 4.2 外部API依赖

| API端点 | 认证方式 | 数据库 |
|--------|---------|--------|
| `https://wh.tsinsoft.com:10008/rest/db/storedproc` | Token: `INDUSFO123` | `锐凯电子` |

### 4.3 数据映射关系

**远程数据** → **本地数据结构**:

```
VA1 → va1 (工序名称)
VA2 → va2 (质量等级)
VA3 → va3 (检验标准)
ID  → id  (工序ID)
V1  → standard1 (工艺标准I)
V2  → standard2 (工艺标准II)
V3  → standard3 (工艺标准III)
```

---

## 5. API通信协议

### 5.1 请求格式

**方法**: `GET`

**URL结构**:
```
https://wh.tsinsoft.com:10008/rest/db/storedproc?token={token}&format=json&data={params}
```

**参数编码**: URL编码的JSON字符串

### 5.2 响应格式

```json
{
  "status": 0,        // 状态码：0=成功，非0=失败
  "message": "消息",  // 响应消息
  "data": [...]       // 数据数组
}
```

### 5.3 存储过程调用参数

#### 5.3.1 查询类 (SELECT)

```javascript
{
  db_name: '锐凯电子',
  proc_name: '存储过程名',
  method: 'open_proc',
  params: []  // 查询通常无参数
}
```

#### 5.3.2 增删改类 (INSERT/UPDATE/DELETE)

```javascript
{
  db_name: '锐凯电子',
  proc_name: '存储过程名',
  method: 'open_proc',
  params: [
    { name: '@参数名1', value: '值1' },
    { name: '@参数名2', value: '值2' }
  ]
}
```

---

## 6. 响应式设计

### 6.1 断点配置

| 设备类型 | 屏幕宽度 | 布局 | 导航栏高度 |
|---------|---------|------|-----------|
| **手机** | ≤768px | 单列 | 44px |
| **平板** | 769px+ | 双列 | 52px |
| **桌面** | 1200px+ | 三列 | 52px |

### 6.2 响应式CSS

```css
/* 手机端 */
@media (max-width: 768px) {
  .process-list {
    grid-template-columns: 1fr;
  }
}

/* 平板/桌面端 */
@media (min-width: 769px) {
  .container {
    max-width: 800px;
    margin: 0 auto;
    padding-top: 64px;
  }
  .process-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 大屏幕 */
@media (min-width: 1200px) {
  .process-list {
    grid-template-columns: repeat(3, 1fr);
    max-width: 1200px;
    margin: 0 auto;
  }
}
```

---

## 7. 用户界面组件

### 7.1 导航栏 (Navbar)

**位置**: 页面顶部，固定定位

**元素**:
- 分类选择器（下拉菜单）
- 添加按钮

**样式**:
- 背景色: `#1890ff`
- 高度: 44px/52px
- 阴影: `0 2px 8px rgba(24, 144, 255, 0.3)`

### 7.2 工序卡片 (Process Card)

**展开状态**:
- 显示基本信息
- 可展开查看详情

**展开内容**:
- 检查时间
- 产品型号（必填）
- 操作人
- 工艺标准I/II/III
- 检查数/不良数
- 处理意见
- 判定选择（必填）
- 提交按钮

### 7.3 滑动操作

**左滑效果**:
- 暴露编辑和删除按钮
- 滑动距离: 120px
- 触发阈值: 60px

### 7.4 弹窗组件

| 类型 | 用途 | 按钮 |
|------|------|------|
| 添加弹窗 | 添加工序 | 取消、确定 |
| 编辑弹窗 | 修改工序 | 取消、确定 |
| 删除确认 | 确认删除 | 否、是 |

### 7.5 Toast提示

| 类型 | 颜色 | 用途 |
|------|------|------|
| info | `#1890ff` | 一般信息 |
| success | `#52c41a` | 操作成功 |
| error | `#ff4d4f` | 操作失败 |

---

## 8. 项目运行

### 8.1 环境要求

- Node.js: ^14.0.0
- npm: ^6.0.0

### 8.2 安装依赖

```bash
npm install
```

### 8.3 开发环境

```bash
npm run dev
```

**启动后**: 在浏览器访问 `http://localhost:5173`

### 8.4 生产构建

```bash
npm run build
```

**构建输出**: `dist/` 目录

### 8.5 预览构建

```bash
npm run preview
```

---

## 9. 构建配置

### 9.1 Vite配置 - vite.config.js

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: './'
})
```

**配置说明**:

| 配置项 | 值 | 说明 |
|--------|-----|------|
| `plugins` | `[vue()]` | Vue插件 |
| `base` | `'./'` | 相对路径模式（适配移动端） |

---

## 10. 数据流向

### 10.1 初始化流程

```
应用启动
    ↓
created() 生命周期
    ↓
getUrlParams() → 解析URL参数获取 userno
    ↓
fetchCategoryList() → 获取分类列表
    ↓
默认选中第一个分类
    ↓
fetchProcessList() → 获取工序列表
```

### 10.2 添加工序流程

```
点击"添加"按钮
    ↓
显示添加弹窗
    ↓
填写表单（工序、质量等级、标准要求）
    ↓
点击"保存"
    ↓
submitAdd() → 调用存储过程
    ↓
成功后关闭弹窗、刷新列表、显示成功提示
```

### 10.3 提交检验流程

```
点击工序卡片展开
    ↓
展开详情面板
    ↓
fetchGybz() → 加载工艺标准
    ↓
填写检验信息
    ↓
选择判定（OK/NG）
    ↓
点击"提交"
    ↓
submitDetail() → 调用存储过程
    ↓
标记submitted=true、显示成功提示
```

---

## 11. 样式设计系统

### 11.1 颜色体系

| 用途 | 颜色值 | 说明 |
|------|--------|------|
| 主色 | `#1890ff` | 导航栏、主按钮 |
| 成功 | `#52c41a` | 成功提示、已提交标签 |
| 错误 | `#ff4d4f` | 错误提示、删除按钮 |
| 背景 | `#f5f5f5` | 页面背景 |
| 文字主色 | `#333` | 标题 |
| 文字副色 | `#666` | 标签、说明文字 |
| 边框 | `#ddd` | 输入框边框 |

### 11.2 字体系统

**字体栈**:
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
```

**字号**:
| 元素 | 字号 |
|------|------|
| 导航标题 | 17px/18px |
| 工序名称 | 15px |
| 标签文字 | 13px/14px |
| 辅助文字 | 12px |

### 11.3 间距系统

| 元素 | 间距 |
|------|------|
| 页面边距 | 12px/16px |
| 卡片内边距 | 14px |
| 表单项间距 | 10px/16px |
| 网格间隙 | 12px/16px |

### 11.4 阴影

| 用途 | 阴影值 |
|------|--------|
| 导航栏 | `0 2px 8px rgba(24, 144, 255, 0.3)` |
| 卡片 | `0 2px 8px rgba(0, 0, 0, 0.06)` |
| 下拉菜单 | `0 4px 12px rgba(0, 0, 0, 0.15)` |

---

## 12. 事件处理

### 12.1 触摸事件

**滑动列表项事件**:
```javascript
@touchstart="touchStart($event, item)"
@touchmove="touchMove($event, item)"
@touchend="touchEnd(item)"
@click="handleItemClick(item)"
```

**事件流程**:
1. `touchStart`: 记录起始坐标
2. `touchMove`: 计算滑动方向和距离，更新UI
3. `touchEnd`: 根据阈值决定是否完全展开
4. `handleItemClick`: 点击时关闭滑动

### 12.2 阻止冒泡

**场景**: 弹窗和详情面板内部点击不触发父级关闭

**方法**: `@click.stop`

```vue
<div class="dropdown-menu" @click.stop>
<div class="detail-panel" @click.stop>
<div class="modal-content" @click.stop>
```

---

## 13. 错误处理

### 13.1 网络请求错误

```javascript
try {
  // fetch请求
} catch (e) {
  console.error('请求失败:', e)
  this.error = '网络请求失败'
  this.showToast('网络请求失败', 'error')
}
```

### 13.2 业务逻辑错误

**状态码非0时**:
```javascript
if (result.status !== 0) {
  this.showToast('操作失败：' + (result.message || '未知错误'), 'error')
}
```

### 13.3 表单验证

**必填字段**:
- 添加/编辑: `gx`, `zldj`, `bzyq`
- 检验提交: `productModel`, `judgment`

---

## 14. 性能优化

### 14.1 延迟加载

**工艺标准按需加载**:
```javascript
async toggleExpand(id) {
  const item = this.processList.find(i => i.id === id)
  if (item) {
    item.expanded = !item.expanded
    if (item.expanded && !item.gybzLoaded) {
      await this.fetchGybz(item)
      item.gybzLoaded = true
    }
  }
}
```

### 14.2 乐观更新

**编辑后本地更新**:
```javascript
// 乐观更新：只更新这一条数据
const item = this.processList.find(i => i.id === this.editForm.id)
if (item) {
  item.va1 = this.editForm.gx
  item.va2 = this.editForm.zldj
  item.va3 = this.editForm.bzyq
}
```

### 14.3 组件卸载清理

- Toast自动2秒后消失
- 无需手动清理的定时器

---

## 15. 安全考虑

### 15.1 API认证

- Token: `INDUSFO123`
- 硬编码在客户端（建议迁移到后端代理）

### 15.2 用户标识

- 通过URL参数传递用户编号
- 建议增加签名验证

### 15.3 数据校验

- 前端必填字段校验
- 输入类型限制（数字字段）

---

## 16. 浏览器兼容性

### 16.1 支持版本

| 浏览器 | 最低版本 |
|--------|---------|
| Chrome | 60+ |
| Safari | 11+ |
| Firefox | 55+ |
| Edge | 79+ |
| iOS Safari | 11+ |
| Android Browser | 7+ |

### 16.2 移动端适配

- 使用Viewport元标签
- 触摸事件支持
- 固定定位导航栏

---

## 17. 文件清单

### 17.1 源代码文件

| 文件 | 行数 | 说明 |
|------|------|------|
| `src/main.js` | 4 | 应用入口 |
| `src/App.vue` | 13 | 根组件 |
| `src/components/ProcessCheck.vue` | 1146 | 主业务组件 |

### 17.2 配置文件

| 文件 | 说明 |
|------|------|
| `package.json` | 项目依赖配置 |
| `vite.config.js` | Vite构建配置 |
| `index.html` | 开发环境入口 |
| `dist/index.html` | 生产构建入口 |

---

## 18. 版本信息

- **文档版本**: 1.0
- **最后更新**: 2024年
- **维护者**: 项目开发团队

---

## 附录

### A. 常用命令速查

| 命令 | 用途 |
|------|------|
| `npm install` | 安装依赖 |
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run preview` | 预览生产构建 |

### B. API端点速查

| 端点 | URL |
|------|-----|
| 基础URL | `https://wh.tsinsoft.com:10008/rest/db/storedproc` |
| 认证Token | `INDUSFO123` |

### C. 存储过程速查

| 操作 | 存储过程 |
|------|---------|
| 获取分类 | `WeiXin_ZLXJBT_select` |
| 获取工序 | `WeiXin_ZLXJ_select` |
| 添加工序 | `WeiXin_zl_xjgx_list_insert` |
| 更新工序 | `WeiXin_zl_xjgx_list_update` |
| 删除工序 | `WeiXin_zl_xjgx_list_delete` |
| 获取工艺标准 | `WeiXin_zl_xjgx_gybz_select` |
| 提交检验 | `WeiXin_ZLXJ_insert` |
