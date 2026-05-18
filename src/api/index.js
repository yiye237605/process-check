const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://wh.tsinsoft.com:10008/rest/db/storedproc'
const TOKEN = import.meta.env.VITE_API_TOKEN || ''
const DB_NAME = '锐凯电子'

const request = async (procName, params = []) => {
  const requestData = {
    db_name: DB_NAME,
    proc_name: procName,
    method: 'open_proc',
    params
  }

  const url = `${BASE_URL}?token=${TOKEN}&format=json&data=${encodeURIComponent(JSON.stringify(requestData))}`

  const response = await fetch(url)
  const result = await response.json()

  if (result.status !== 0) {
    throw new Error(result.message || '请求失败')
  }

  if (result.data && result.data.length > 0 && result.data[0].error) {
    throw new Error(result.data[0].error)
  }

  return result
}

export const productApi = {
  getProductList: async (like = '') => {
    const result = await request('WeiXin_zl_cpxl_select', [
      { name: '@like', value: like }
    ])
    return result.data || []
  }
}

export const categoryApi = {
  getCategoryList: async () => {
    const result = await request('WeiXin_ZLXJBT_select', [])
    return result.data || []
  }
}

export const processApi = {
  getProcessList: async (type) => {
    const result = await request('WeiXin_ZLXJ_select', [
      { name: '@TYPE', value: type }
    ])
    return result.data || []
  },

  getProcessNameList: async (like) => {
    const result = await request('WeiXin_zl_gxxl_select', [
      { name: '@like', value: like }
    ])
    return result.data || []
  },

  addProcess: async ({ userno, id, gx, pro_code, zldj, bzyq }) => {
    const result = await request('WeiXin_zl_xjgx_list_insert', [
      { name: '@userno', value: userno },
      { name: '@id', value: id },
      { name: '@gx', value: gx },
      { name: '@pro_code', value: pro_code },
      { name: '@zldj', value: zldj },
      { name: '@bzyq', value: bzyq }
    ])
    return result.data
  },

  updateProcess: async ({ id, gx, pro_code, zldj, bzyq }) => {
    const result = await request('WeiXin_zl_xjgx_list_update', [
      { name: '@id', value: id },
      { name: '@gx', value: gx },
      { name: '@pro_code', value: pro_code },
      { name: '@zldj', value: zldj },
      { name: '@bzyq', value: bzyq }
    ])
    return result.data
  },

  deleteProcess: async (id) => {
    const result = await request('WeiXin_zl_xjgx_list_delete', [
      { name: '@id', value: id }
    ])
    return result.data
  },

  getGybz: async (id, gxtype) => {
    const result = await request('WeiXin_zl_xjgx_gybz_select', [
      { name: '@id', value: id },
      { name: '@gxtype', value: gxtype }
    ])
    return result.data?.[0] || null
  }
}

export const inspectionApi = {
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
    pd
  }) => {
    const result = await request('WeiXin_ZLXJ_insert', [
      { name: '@userno', value: userno },
      { name: '@ID', value: ID },
      { name: '@jcdate', value: jcdate },
      { name: '@cpxh', value: cpxh },
      { name: '@czr', value: czr },
      { name: '@gxbzy', value: gxbzy },
      { name: '@gxbze', value: gxbze },
      { name: '@gxbzs', value: gxbzs },
      { name: '@jcs', value: jcs },
      { name: '@bls', value: bls },
      { name: '@clyj', value: clyj },
      { name: '@pd', value: pd }
    ])
    return result.data
  }
}

export default {
  category: categoryApi,
  process: processApi,
  inspection: inspectionApi,
  product: productApi
}
