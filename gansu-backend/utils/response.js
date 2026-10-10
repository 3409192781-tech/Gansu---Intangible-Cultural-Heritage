const success = (data, message = '操作成功') => {
  return {
    code: 200,
    message,
    data
  };
};

const error = (message = '操作失败', code = 500) => {
  return {
    code,
    message,
    data: null
  };
};

const unauthorized = (message = '未授权') => {
  return {
    code: 401,
    message,
    data: null
  };
};

const pagination = (list, total, page, pageSize) => {
  return {
    list,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize)
  };
};

module.exports = {
  success,
  error,
  unauthorized,
  pagination
};