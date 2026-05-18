# 修复 SyntaxError: Invalid left-hand side in assignment

## 问题分析

错误发生在 `v-model="currentProductItem?.productModel"` 这行代码。

**原因**：Vue 3 的 v-model 不完全支持可选链操作符 `?.`，这在某些情况下会导致解析错误。

## 解决方案

将 v-model 中的可选链改为直接绑定，并在输入事件中手动更新。

### 修改模板

```html
<!-- 替换当前代码（第168行） -->
<!-- 原: v-model="currentProductItem?.productModel" -->
<input
  type="text"
  :value="currentProductItem?.productModel || ''"
  @input="e => currentProductItem && (currentProductItem.productModel = e.target.value)"
  placeholder="输入或选择产品型号"
  @input="onProductSearch"
  @focus="onProductFocus"
  @blur="onProductBlur"
>
```

### 或者更简洁的方式

在data中添加 `productModelInput` 字段，然后在 `selectProduct` 和 `toggleExpand` 中同步这个字段。

```javascript
// 添加到data
productModelInput: '',

// 修改toggleExpand
if (item.expanded) {
  this.currentProductItem = item
  this.productModelInput = item.productModel || ''
}

// 修改selectProduct
this.currentProductItem.productModel = p.V1
this.productModelInput = p.V1

// 修改onProductSearch
async onProductSearch() {
  if (this.productTimer) clearTimeout(this.productTimer)
  this.productTimer = setTimeout(async () => {
    this.productModelInput = this.currentProductItem?.productModel || ''
    await this.fetchProductList(this.productModelInput)
  }, 300)
}
```

### 推荐方案

使用 `:value` + `@input` 组合，这样可以直接解决问题，不需要添加额外的数据字段。

## 验证步骤

1. 刷新页面，无SyntaxError
2. 点击展开工序详情
3. 点击产品型号输入框，下拉显示
4. 选择产品型号，正常填充