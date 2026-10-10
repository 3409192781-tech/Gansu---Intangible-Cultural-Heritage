const BASE_URL = 'https://gansu-culture.xyz/api';

const request = (url: string, method: string = 'GET', data: any = null): Promise<any> => {
  return new Promise((resolve, reject) => {
    const header: any = {
      'Content-Type': 'application/json',
    };
    const token = uni.getStorageSync('token') as string;
    if (token) {
      header['Authorization'] = 'Bearer ' + token;
    }
    uni.request({
      url: BASE_URL + url,
      method: method,
      data: data,
      header: header,
      success: (res) => {
        if (res.data && res.data.code === 200) {
          resolve(res.data.data);
        } else {
          reject(res.data || res);
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
};

export const api = {
  auth: {
    wechatLogin: (code: string, nickName?: string, avatarUrl?: string) =>
      request('/auth/wechat-login', 'POST', { code, nickName, avatarUrl })
  },
  home: {
    get: () => request('/home')
  },
  cultures: {
    list: (page: number = 1, pageSize: number = 10) => 
      request(`/cultures?page=${page}&pageSize=${pageSize}`),
    detail: (id: string) => request(`/cultures/${id}`)
  },
  spots: {
    list: (page: number = 1, pageSize: number = 10) => 
      request(`/spots?page=${page}&pageSize=${pageSize}`),
    detail: (id: string) => request(`/spots/${id}`)
  },
  foods: {
    list: (page: number = 1, pageSize: number = 10) =>
      request(`/foods?page=${page}&pageSize=${pageSize}`),
    detail: (id: string) => request(`/foods/${id}`)
  },
  guides: {
    list: (page: number = 1, pageSize: number = 20, filters: any = {}) => {
      let url = `/guides?page=${page}&pageSize=${pageSize}`;
      if (filters.category) url += `&category=${filters.category}`;
      if (filters.type) url += `&type=${filters.type}`;
      if (filters.keyword) url += `&keyword=${encodeURIComponent(filters.keyword)}`;
      return request(url);
    },
    detail: (id: string) => request(`/guides/${id}`)
  },
  events: {
    list: () => request('/events')
  },
  search: {
    do: (keyword: string) => request('/search?keyword=' + encodeURIComponent(keyword))
  },
  banners: {
    list: () => request('/banners')
  },
  cities: {
    list: () => request('/cities'),
    detail: (name: string) => request(`/cities/${name}`)
  },
  products: {
    list: (page: number = 1, pageSize: number = 10, filters: any = {}) => {
      let url = `/products?page=${page}&pageSize=${pageSize}`;
      if (filters.category) url += `&category=${filters.category}`;
      if (filters.keyword) url += `&keyword=${encodeURIComponent(filters.keyword)}`;
      if (filters.isHot) url += `&isHot=true`;
      if (filters.isNew) url += `&isNew=true`;
      return request(url);
    },
    detail: (id: string) => request(`/products/${id}`),
    categories: () => request('/products/categories'),
    hot: () => request('/products/hot')
  },
  favorites: {
    get: (deviceId: string) => request('/favorites/' + deviceId),
    toggle: (deviceId: string, itemId: string) => request('/favorites/' + deviceId + '/toggle', 'POST', { itemId }),
    check: (deviceId: string, itemId: string) => request('/favorites/' + deviceId + '/check/' + itemId)
  },
  payment: {
    prePay: (orderNo: string, code: string) =>
      request('/payment/prepay', 'POST', { orderNo, code })
  },
  orders: {
    create: (data: {
      productId: string, productName: string, productImage: string,
      price: number, customerName: string, customerPhone: string, customerAddress: string,
      deviceId: string
    }) => request('/orders', 'POST', data),
    my: (deviceId: string, page: number = 1, status?: string) => {
      var url = '/orders/my?deviceId=' + deviceId + '&page=' + page + '&pageSize=20';
      if (status && status !== 'all') url += '&status=' + status;
      return request(url);
    },
    cancel: (orderNo: string, deviceId: string) =>
      request('/orders/' + orderNo + '/cancel', 'PUT', { deviceId }),
    confirm: (orderNo: string, deviceId: string) =>
      request('/orders/' + orderNo + '/confirm', 'PUT', { deviceId }),
    refund: (orderNo: string, deviceId: string, reason: string) =>
      request('/orders/' + orderNo + '/refund', 'PUT', { deviceId, reason })
  },
  ai: {
    chat: (messages: {role: string, content: string}[]): Promise<{content: string}> => {
      return request('/ai/chat', 'POST', { messages })
    }
  }
};

export default api;