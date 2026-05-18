# 提交接口添加 @bzyq 参数

## 需求

提交接口添加 `@bzyq` 参数，传递标准要求字段。

## 实施计划

### 1. 修改 `src/api/index.js`

在 `submitInspection` 函数中添加参数：

```javascript
submitInspection: async ({
  userno,
  ID,
  jcdate,
  cpxh,
  czr,
  gxbzy,
  gxbze,
  gxbzs,
  jcs,
  bls,
  clyj,
  pd,
  bzyq  // 新增
}) => {
  const result = await request('WeiXin_ZLXJ_insert', [
    // ... 现有参数
    { name: '@bzyq', value: bzyq }  // 新增
  ])
}
```

### 2. 修改 `src/components/ProcessCheck.vue`

在 `submitDetail` 方法中传递 `standardReq`：

```javascript
const result = await inspectionApi.submitInspection({
  // ... 现有参数
  bzyq: item.standardReq  // 新增
})
```

## 验证步骤

1. 填写标准要求
2. 提交后检查数据库是否保存了标准要求