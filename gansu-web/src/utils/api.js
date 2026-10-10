const BASE_URL = 'https://gansu-culture.xyz/api'

async function request(url, method = 'GET', data = null) {
  const headers = { 'Content-Type': 'application/json' }
  const opts = { method, headers }
  if (data) opts.body = JSON.stringify(data)
  const res = await fetch(BASE_URL + url, opts)
  const json = await res.json()
  if (json.code !== 200) throw new Error(json.message || '请求失败')
  return json.data
}

export const api = {
  home: {
    get: () => request('/home')
  },
  cultures: {
    list: (page = 1, pageSize = 10) => request(`/cultures?page=${page}&pageSize=${pageSize}`),
    detail: (id) => request(`/cultures/${id}`)
  },
  spots: {
    list: (page = 1, pageSize = 10) => request(`/spots?page=${page}&pageSize=${pageSize}`),
    detail: (id) => request(`/spots/${id}`)
  },
  foods: {
    list: (page = 1, pageSize = 10) => request(`/foods?page=${page}&pageSize=${pageSize}`),
    detail: (id) => request(`/foods/${id}`)
  },
  products: {
    list: (page = 1, pageSize = 10, filters = {}) => {
      let url = `/products?page=${page}&pageSize=${pageSize}`
      if (filters.category) url += `&category=${filters.category}`
      if (filters.keyword) url += `&keyword=${encodeURIComponent(filters.keyword)}`
      return request(url)
    },
    detail: (id) => request(`/products/${id}`),
    categories: () => request('/products/categories'),
    hot: () => request('/products/hot')
  },
  guides: {
    list: (page = 1, pageSize = 20, filters = {}) => {
      let url = `/guides?page=${page}&pageSize=${pageSize}`
      if (filters.category) url += `&category=${filters.category}`
      if (filters.type) url += `&type=${filters.type}`
      if (filters.keyword) url += `&keyword=${encodeURIComponent(filters.keyword)}`
      return request(url)
    },
    detail: (id) => request(`/guides/${id}`)
  },
  events: {
    list: () => request('/events')
  },
  search: {
    do: (keyword) => request('/search?keyword=' + encodeURIComponent(keyword))
  },
  cities: {
    list: () => request('/cities'),
    detail: (name) => request(`/cities/${name}`)
  },
  settings: {
    get: () => request('/settings')
  },
  ai: {
    chat: (messages) => request('/ai/chat', 'POST', { messages }),
    tripPlan: (data) => request('/ai/trip-plan', 'POST', data)
  }
}
