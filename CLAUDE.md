# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

工序检验移动端应用（Process Inspection），基于 Vue 3 + Vite 构建，用于生产线工序质量检验。

## 开发命令

```bash
npm run dev      # 启动开发服务器
npm run build    # 构建生产版本
npm run preview  # 预览生产构建
```

## 架构说明

### 技术栈
- **Vue 3** (Options API)
- **Vite 5** (构建工具)
- **原生 Fetch API** (数据请求)

### 目录结构
```
src/
├── main.js           # Vue 应用入口
├── App.vue           # 根组件
└── components/
    └── ProcessCheck.vue  # 工序检验主组件
```

### 数据流
1. `ProcessCheck.vue` 组件创建时通过 `fetchProcessList()` 调用远程存储过程获取工序列表
2. 远程 API：`https://wh.tsinsoft.com:10008/rest/db/storedproc` (Token: INDUSFO123)
3. 数据结构：`{ db_name: '锐凯电子', proc_name: 'WeiXin_ZLXJ_select', method: 'open_proc', params: [...] }`
4. 返回数据映射：`VA1/VA2/VA3` → `va1/va2/va3`（工序名称、质量等级、检验标准）
5. 用户选择 OK/NG 后，点击保存按钮提交（提交接口待实现）

### 响应式设计
- 移动端优先（最大宽度 768px）
- 平板端双列布局（769px+）
- 桌面端三列布局（1200px+）
- 固定导航栏，高度 44px/52px
