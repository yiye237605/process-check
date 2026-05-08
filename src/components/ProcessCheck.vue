<template>
  <div class="process-check-page">
    <header class="navbar">
      <div class="select-wrapper" @click.stop="showDropdown = !showDropdown">
        <span class="select-value">{{ selectedCategory || categoryList[0]?.cj || '请选择' }}</span>
        <span class="select-arrow" :class="{ open: showDropdown }">▼</span>
        <div v-if="showDropdown" class="dropdown-menu">
          <div
            v-for="cat in categoryList"
            :key="cat.cj"
            class="dropdown-item"
            :class="{ active: selectedCategory === cat.cj }"
            @click.stop="selectCategory(cat)"
          >{{ cat.cj }}</div>
        </div>
      </div>
      <button class="btn-add" @click="showAddModal = true">+ 添加</button>
    </header>

    <!-- 添加弹窗 -->
    <div v-if="showAddModal" class="modal-overlay" @click="hideDropdowns">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <span>添加工序</span>
          <span class="modal-close" @click="showAddModal = false">×</span>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <label><span class="required">*</span>工序：</label>
            <div class="search-select-wrapper">
              <input 
                type="text" 
                v-model="addForm.gx" 
                placeholder="搜索或选择工序"
                @input="onAddGxSearch"
                @focus="onAddGxFocus"
                @blur="onAddGxBlur"
              >
              <div v-if="showAddGxDropdown && addGxList.length > 0" class="search-dropdown">
                <div 
                  v-for="item in addGxList" 
                  :key="item.pro_code"
                  class="search-dropdown-item"
                  @click="selectAddGx(item)"
                >
                  {{ item.pro_name }}
                </div>
              </div>
            </div>
          </div>
          <div class="form-row">
            <label>质量等级：</label>
            <input type="text" v-model="addForm.zldj" placeholder="请输入">
          </div>
          <div class="form-row">
            <label>标准要求：</label>
            <input type="text" v-model="addForm.bzyq" placeholder="请输入">
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="showAddModal = false">取消</button>
          <button class="btn-confirm" @click="submitAdd">保存</button>
        </div>
      </div>
    </div>

    <!-- 编辑弹窗 -->
    <div v-if="showEditModal" class="modal-overlay" @click="hideDropdowns">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <span>编辑工序</span>
          <span class="modal-close" @click="showEditModal = false">×</span>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <label><span class="required">*</span>工序：</label>
            <div class="search-select-wrapper">
              <input 
                type="text" 
                v-model="editForm.gx" 
                placeholder="搜索或选择工序"
                @input="onEditGxSearch"
                @focus="onEditGxFocus"
                @blur="onEditGxBlur"
              >
              <div v-if="showEditGxDropdown && editGxList.length > 0" class="search-dropdown">
                <div 
                  v-for="item in editGxList" 
                  :key="item.pro_code"
                  class="search-dropdown-item"
                  @click="selectEditGx(item)"
                >
                  {{ item.pro_name }}
                </div>
              </div>
            </div>
          </div>
          <div class="form-row">
            <label>质量等级：</label>
            <input type="text" v-model="editForm.zldj" placeholder="请输入">
          </div>
          <div class="form-row">
            <label>标准要求：</label>
            <input type="text" v-model="editForm.bzyq" placeholder="请输入">
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="showEditModal = false">取消</button>
          <button class="btn-confirm" @click="submitEdit">保存</button>
        </div>
      </div>
    </div>

    <!-- 删除确认弹窗 -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <span>确认删除</span>
          <span class="modal-close" @click="showDeleteModal = false">×</span>
        </div>
        <div class="modal-body">
          <p class="delete-tip">是否删除该工序？</p>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="showDeleteModal = false">否</button>
          <button class="btn-confirm delete-btn" @click="confirmDelete">是</button>
        </div>
      </div>
    </div>

    <!-- Toast 提示 -->
    <div v-if="toast.show" class="toast" :class="toast.type">{{ toast.message }}</div>

    <main class="container">
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else-if="processList.length === 0" class="empty">暂无数据</div>
      <div v-else class="process-list">
        <div
          v-for="item in processList"
          :key="item.id"
          class="process-item-wrapper"
        >
          <div class="process-item" :class="{ expanded: item.expanded }" @click="toggleExpand(item.id)">
            <div class="process-header">
              <span class="process-name">{{ item.va1 }}</span>
              <div class="header-right">
                <span v-if="item.submitted" class="submitted-tag">已提交</span>
                <span class="quality-level">{{ item.va2 }}</span>
                <button class="btn-action edit" @click.stop="openEditModal(item)">编辑</button>
                <button class="btn-action delete" @click.stop="openDeleteConfirm(item)">删除</button>
                <span class="expand-icon" :class="{ expanded: item.expanded }">▼</span>
              </div>
            </div>
            <div class="process-standard" @click="showFullStandard(item.va3)">{{ truncateText(item.va3, 25) }}</div>

            <!-- 展开的详情面板 -->
            <div v-if="item.expanded" class="detail-panel" @click.stop>
              <div class="detail-row">
                <label>检查时间：</label>
                <span class="time-value">{{ item.checkTime }}</span>
              </div>
              <div class="detail-row">
                <label><span class="required">*</span>产品型号：</label>
                <input type="text" v-model="item.productModel" placeholder="请输入" @blur="onProductModelBlur(item)">
              </div>
              <div class="detail-row">
                <label>操作人：</label>
                <input type="text" v-model="item.operator" placeholder="请输入">
              </div>
              <div class="detail-row">
                <label>工艺标准Ⅰ：</label>
                <input type="text" v-model="item.standard1" placeholder="请输入">
              </div>
              <div class="detail-row">
                <label>工艺标准Ⅱ：</label>
                <input type="text" v-model="item.standard2" placeholder="请输入">
              </div>
              <div class="detail-row">
                <label>工艺标准Ⅲ：</label>
                <input type="text" v-model="item.standard3" placeholder="请输入">
              </div>
              <div class="detail-row">
                <label>检查数：</label>
                <input type="number" v-model="item.checkCount" placeholder="请输入数字" min="0">
              </div>
              <div class="detail-row">
                <label>不良数：</label>
                <input type="number" v-model="item.defectCount" placeholder="请输入数字" min="0">
              </div>
              <div class="detail-row">
                <label>处理意见：</label>
                <input type="text" v-model="item.suggestion" placeholder="请输入">
              </div>
              <div class="detail-row">
                <label><span class="required">*</span>判定：</label>
                <select v-model="item.judgment" class="select-judgment">
                  <option value="">请选择</option>
                  <option value="OK">OK</option>
                  <option value="NG">NG</option>
                </select>
              </div>
              <button class="btn-submit" @click.stop="submitDetail(item)">提交</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { categoryApi, processApi, inspectionApi } from '../api/index.js'

export default {
  name: 'ProcessCheck',

  data() {
    return {
      userno: '',
      processList: [],
      categoryList: [],
      selectedCategory: '',
      selectedIdHide: '',
      showDropdown: false,
      showAddModal: false,
      addForm: {
        gx: '',
        pro_code: '',
        zldj: '',
        bzyq: ''
      },
      addGxList: [],
      showAddGxDropdown: false,
      addGxTimer: null,
      showEditModal: false,
      editForm: {
        id: '',
        gx: '',
        pro_code: '',
        zldj: '',
        bzyq: ''
      },
      editGxList: [],
      showEditGxDropdown: false,
      editGxTimer: null,
      showDeleteModal: false,
      deleteItemId: '',
      loading: false,
      error: null,
      toast: {
        show: false,
        message: '',
        type: 'info'
      }
    }
  },

  created() {
    this.getUrlParams()
    this.fetchCategoryList()
  },

  methods: {
    hideDropdowns() {
      this.showAddGxDropdown = false
      this.showEditGxDropdown = false
    },

    closeAllDropdowns() {
      this.showAddGxDropdown = false
      this.showEditGxDropdown = false
      this.showAddModal = false
      this.showEditModal = false
    },

    getUrlParams() {
      const urlParams = new URLSearchParams(window.location.search)
      this.userno = urlParams.get('userno') || ''
    },

    async fetchCategoryList() {
      try {
        const data = await categoryApi.getCategoryList()
        this.categoryList = data
        if (this.categoryList.length > 0) {
          this.selectedCategory = this.categoryList[0].cj
          this.selectedIdHide = this.categoryList[0].ID_HIDE
          this.fetchProcessList()
        }
      } catch (e) {
        console.error('获取分类失败:', e)
      }
    },

    selectCategory(cat) {
      this.selectedCategory = cat.cj
      this.selectedIdHide = cat.ID_HIDE
      this.showDropdown = false
      this.fetchProcessList()
    },

    async submitAdd() {
      if (!this.addForm.gx) {
        this.showToast('请输入工序', 'error')
        return
      }
      if (!this.addForm.zldj) {
        this.showToast('请输入质量等级', 'error')
        return
      }
      if (!this.addForm.bzyq) {
        this.showToast('请输入标准要求', 'error')
        return
      }

      try {
        const result = await processApi.addProcess({
          userno: this.userno,
          id: this.selectedIdHide,
          gx: this.addForm.gx,
          pro_code: this.addForm.pro_code,
          zldj: this.addForm.zldj,
          bzyq: this.addForm.bzyq
        })

        this.showAddModal = false
        this.addForm = { gx: '', pro_code: '', zldj: '', bzyq: '' }
        this.addGxList = []
        const msg = result?.[0]?.success || '保存成功'
        this.showToast(msg, 'success')
        this.fetchProcessList()
      } catch (e) {
        console.error('保存失败:', e)
        this.showToast('网络请求失败', 'error')
      }
    },

    openEditModal(item) {
      this.editForm = {
        id: item.id,
        gx: item.va1,
        pro_code: item.pro_code || '',
        zldj: item.va2,
        bzyq: item.va3
      }
      this.showEditModal = true
    },

    openDeleteConfirm(item) {
      this.deleteItemId = item.id
      this.showDeleteModal = true
    },

    async submitEdit() {
      if (!this.editForm.gx) {
        this.showToast('请输入工序', 'error')
        return
      }
      if (!this.editForm.zldj) {
        this.showToast('请输入质量等级', 'error')
        return
      }
      if (!this.editForm.bzyq) {
        this.showToast('请输入标准要求', 'error')
        return
      }

      try {
        const result = await processApi.updateProcess({
          id: this.editForm.id,
          gx: this.editForm.gx,
          pro_code: this.editForm.pro_code,
          zldj: this.editForm.zldj,
          bzyq: this.editForm.bzyq
        })

        this.showEditModal = false
        this.editGxList = []
        const msg = result?.[0]?.success || '保存成功'
        this.showToast(msg, 'success')
        const item = this.processList.find(i => i.id === this.editForm.id)
        if (item) {
          item.va1 = this.editForm.gx
          item.pro_code = this.editForm.pro_code
          item.va2 = this.editForm.zldj
          item.va3 = this.editForm.bzyq
        }
      } catch (e) {
        console.error('保存失败:', e)
        this.showToast('网络请求失败', 'error')
      }
    },

    async confirmDelete() {
      try {
        const result = await processApi.deleteProcess(this.deleteItemId)

        this.showDeleteModal = false
        const msg = result?.[0]?.success || '删除成功'
        this.showToast(msg, 'success')
        const index = this.processList.findIndex(i => i.id === this.deleteItemId)
        if (index !== -1) {
          this.processList.splice(index, 1)
        }
      } catch (e) {
        console.error('删除失败:', e)
        this.showToast('网络请求失败', 'error')
      }
    },

    showFullStandard(text) {
      this.showToast(text, 'info')
    },

    truncateText(text, maxLength) {
      if (!text) return ''
      if (text.length <= maxLength) return text
      return text.substring(0, maxLength) + '...'
    },

    async onAddGxSearch() {
      if (this.addGxTimer) {
        clearTimeout(this.addGxTimer)
      }
      this.addGxTimer = setTimeout(async () => {
        await this.fetchAddGxList(this.addForm.gx || '')
      }, 300)
    },

    async fetchAddGxList(like) {
      try {
        const list = await processApi.getProcessNameList(like)
        this.addGxList = list
        this.showAddGxDropdown = true
      } catch (e) {
        console.error('获取工序列表失败:', e)
      }
    },

    selectAddGx(item) {
      this.addForm.gx = item.pro_name
      this.addForm.pro_code = item.pro_code
      this.showAddGxDropdown = false
      this.addGxList = []
    },

    async onAddGxFocus() {
      await this.fetchAddGxList('')
    },

    onAddGxBlur() {
      setTimeout(() => {
        this.showAddGxDropdown = false
      }, 200)
    },

    async onEditGxSearch() {
      if (this.editGxTimer) {
        clearTimeout(this.editGxTimer)
      }
      this.editGxTimer = setTimeout(async () => {
        await this.fetchEditGxList(this.editForm.gx || '')
      }, 300)
    },

    async fetchEditGxList(like) {
      try {
        const list = await processApi.getProcessNameList(like)
        this.editGxList = list
        this.showEditGxDropdown = true
      } catch (e) {
        console.error('获取工序列表失败:', e)
      }
    },

    selectEditGx(item) {
      this.editForm.gx = item.pro_name
      this.editForm.pro_code = item.pro_code
      this.showEditGxDropdown = false
      this.editGxList = []
    },

    async onEditGxFocus() {
      await this.fetchEditGxList('')
    },

    onEditGxBlur() {
      setTimeout(() => {
        this.showEditGxDropdown = false
      }, 200)
    },

    getCurrentTime() {
      const now = new Date()
      const yyyy = now.getFullYear()
      const mm = String(now.getMonth() + 1).padStart(2, '0')
      const dd = String(now.getDate()).padStart(2, '0')
      const hh = String(now.getHours()).padStart(2, '0')
      const mi = String(now.getMinutes()).padStart(2, '0')
      const ss = String(now.getSeconds()).padStart(2, '0')
      return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`
    },

    async toggleExpand(id) {
      const item = this.processList.find(i => i.id === id)
      if (item) {
        item.expanded = !item.expanded
        if (item.expanded && !item.gybzLoaded) {
          await this.fetchGybz(item)
          item.gybzLoaded = true
        }
      }
    },

    async fetchGybz(item) {
      try {
        const gybzData = await processApi.getGybz(item.id, item.productModel)
        if (gybzData) {
          item.operator = gybzData.V3 || ''
          item.standard1 = gybzData.V5 || ''
          item.standard2 = gybzData.V7 || ''
          item.standard3 = gybzData.V9 || ''
          item.checkCount = gybzData.V11 || null
          item.defectCount = gybzData.V13 || null
          item.suggestion = gybzData.V15 || ''
          item.judgment = gybzData.V17 || ''
        }
      } catch (e) {
        console.error('获取工艺标准失败:', e)
      }
    },

    async onProductModelBlur(item) {
      item.operator = ''
      item.standard1 = ''
      item.standard2 = ''
      item.standard3 = ''
      item.checkCount = null
      item.defectCount = null
      item.suggestion = ''
      item.judgment = ''
      
      if (item.productModel && item.productModel.length > 0) {
        await this.fetchGybz(item)
      }
    },

    showToast(message, type = 'info') {
      this.toast.show = true
      this.toast.message = message
      this.toast.type = type
      setTimeout(() => {
        this.toast.show = false
      }, 2000)
    },

    async submitDetail(item) {
      if (!item.productModel) {
        this.showToast('请输入产品型号', 'error')
        return
      }
      if (!item.judgment) {
        this.showToast('请选择判定', 'error')
        return
      }

      try {
        const result = await inspectionApi.submitInspection({
          userno: this.userno,
          ID: item.id,
          jcdate: item.checkTime,
          cpxh: item.productModel,
          czr: item.operator,
          gxbzy: item.standard1,
          gxbze: item.standard2,
          gxbzs: item.standard3,
          jcs: item.checkCount,
          bls: item.defectCount,
          clyj: item.suggestion,
          pd: item.judgment
        })

        item.submitted = true
        const msg = result?.[0]?.success || '提交成功'
        this.showToast(msg, 'success')
      } catch (e) {
        console.error('提交失败:', e)
        this.showToast('网络请求失败', 'error')
      }
    },

    async fetchProcessList() {
      this.loading = true
      this.error = null

      try {
        const data = await processApi.getProcessList(this.selectedCategory)

        this.processList = data.map(item => ({
          id: item.ID,
          idHide: item.ID_HIDE,
          va1: item.VA1 || '',
          va2: item.VA2 || '',
          va3: item.VA3 || '',
          expanded: false,
          gybzLoaded: false,
          checkTime: this.getCurrentTime(),
          productModel: '',
          operator: '',
          standard1: '',
          standard2: '',
          standard3: '',
          checkCount: null,
          defectCount: null,
          suggestion: '',
          judgment: '',
          submitted: false
        }))
      } catch (e) {
        console.error('请求失败:', e)
        this.error = '网络请求失败'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.process-check-page {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: #f5f5f5;
  min-height: 100vh;
}

.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 44px;
  background: #1890ff;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.3);
}

.title {
  font-size: 17px;
  font-weight: 500;
}

.select-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 4px;
  transition: background 0.2s;
}

.select-wrapper:hover {
  background: rgba(255, 255, 255, 0.1);
}

.btn-add {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.4);
  padding: 5px 12px;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-add:hover {
  background: rgba(255, 255, 255, 0.3);
}

.select-value {
  font-size: 15px;
  color: #fff;
  margin-right: 6px;
}

.select-arrow {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.7);
  transition: transform 0.2s;
}

.select-arrow.open {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 6px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  z-index: 1000;
  min-width: 120px;
}

.dropdown-item {
  padding: 10px 16px;
  font-size: 14px;
  color: #333;
  transition: background 0.2s;
}

.dropdown-item:hover {
  background: #f5f5f5;
}

.dropdown-item.active {
  color: #1890ff;
  background: #e6f7ff;
}

.container {
  padding-top: 54px;
  padding-bottom: 20px;
  min-height: 100vh;
}

.process-list {
  padding: 12px;
  display: block;
  width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
}

.loading,
.error,
.empty {
  text-align: center;
  padding: 40px 20px;
  color: #999;
  font-size: 14px;
}

.error {
  color: #ff4d4f;
}

.process-item {
  background: #fff;
  border-radius: 8px;
  padding: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  box-sizing: border-box;
  width: 100%;
  margin-bottom: 12px;
}

.process-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.process-name {
  font-size: 15px;
  font-weight: 500;
  color: #333;
  flex-shrink: 0;
  margin-right: 8px;
}

.quality-level {
  font-size: 12px;
  color: #1890ff;
  background: #e6f7ff;
  padding: 2px 8px;
  border-radius: 3px;
  flex-shrink: 0;
}

.submitted-tag {
  font-size: 12px;
  color: #52c41a;
  background: #f6ffed;
  padding: 2px 8px;
  border-radius: 3px;
  border: 1px solid #b7eb8f;
  flex-shrink: 0;
}

.process-standard {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
  margin-bottom: 12px;
  max-width: 100%;
  width: 100%;
  display: block;
}

.process-standard:hover {
  color: #1890ff;
}

.btn-action {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  flex-shrink: 0;
}

.btn-action.edit {
  background: #f3e8ff;
  color: #8250df;
}

.btn-action.edit:hover {
  background: #e9d5ff;
}

.btn-action.delete {
  background: #fff2f0;
  color: #ff4d4f;
}

.btn-action.delete:hover {
  background: #ffccc7;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.expand-icon {
  font-size: 16px;
  color: #999;
  transition: transform 0.2s;
  flex-shrink: 0;
}

.expand-icon.expanded {
  transform: rotate(180deg);
}

.detail-panel {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid #eee;
}

.detail-row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  position: relative;
}

.detail-row label {
  width: 100px;
  font-size: 13px;
  color: #666;
  flex-shrink: 0;
}

.required {
  color: #ff4d4f;
  margin-right: 2px;
}

.select-judgment {
  flex: 1;
  height: 32px;
  padding: 0 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
  background-color: #fff;
}

.select-judgment:focus {
  outline: none;
  border-color: #1890ff;
}

.detail-row input {
  flex: 1;
  height: 32px;
  padding: 0 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
}

.detail-row input:focus {
  outline: none;
  border-color: #1890ff;
}

.time-value {
  font-size: 13px;
  color: #333;
}

.search-select-wrapper {
  position: relative;
  flex: 1;
}

.search-select-wrapper input {
  width: 100%;
  height: 36px;
  padding: 0 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
  box-sizing: border-box;
}

.search-select-wrapper input:focus {
  outline: none;
  border-color: #1890ff;
}

.search-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  max-height: 200px;
  overflow-y: auto;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  margin-top: 4px;
}

.search-dropdown-item {
  padding: 10px 12px;
  font-size: 13px;
  color: #333;
  cursor: pointer;
  transition: background 0.2s;
}

.search-dropdown-item:hover {
  background: #f5f5f5;
}

.btn-submit {
  width: 100%;
  height: 36px;
  background: #1890ff;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  margin-top: 6px;
}

.btn-submit:active {
  opacity: 0.8;
}

.number-error {
  position: absolute;
  right: 10px;
  font-size: 12px;
  color: #ff4d4f;
  background: #fff2f0;
  padding: 2px 8px;
  border-radius: 3px;
  white-space: nowrap;
}

.toast {
  position: fixed;
  top: 60px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 20px;
  border-radius: 4px;
  font-size: 14px;
  z-index: 1000;
  animation: fadeIn 0.3s;
}

.toast.info {
  background: #1890ff;
  color: #fff;
}

.toast.success {
  background: #52c41a;
  color: #fff;
}

.toast.error {
  background: #ff4d4f;
  color: #fff;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f5f5f5;
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.modal-close {
  font-size: 24px;
  color: #999;
  cursor: pointer;
}

.modal-close:hover {
  color: #333;
}

.modal-body {
  padding: 20px 16px;
}

.form-row {
  margin-bottom: 16px;
}

.form-row:last-child {
  margin-bottom: 0;
}

.form-row label {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 6px;
}

.form-row input {
  width: 100%;
  height: 40px;
  padding: 0 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-row input:focus {
  outline: none;
  border-color: #1890ff;
}

.modal-footer {
  display: flex;
  border-top: 1px solid #eee;
}

.modal-footer button {
  flex: 1;
  height: 48px;
  border: none;
  font-size: 15px;
  cursor: pointer;
}

.btn-cancel {
  background: #fff;
  color: #666;
  border-right: 1px solid #eee;
}

.btn-confirm {
  background: #1890ff;
  color: #fff;
}

.btn-confirm:hover {
  background: #40a9ff;
}

.delete-btn {
  background: #ff4d4f;
}

.delete-btn:hover {
  background: #ff7875;
}

.delete-tip {
  text-align: center;
  font-size: 15px;
  color: #333;
  padding: 20px 0;
}

.process-item-wrapper {
  position: relative;
}

.process-item {
  transition: transform 0.2s;
}

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

  .navbar {
    height: 52px;
  }

  .title {
    font-size: 18px;
  }

  .process-list {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    padding: 16px;
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
</style>
