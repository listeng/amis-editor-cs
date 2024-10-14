import {types, getEnv, applySnapshot, getSnapshot, flow} from 'mobx-state-tree';
import {PageStore} from './Page';
import {when, reaction} from 'mobx';
import { boolean } from 'mobx-state-tree/dist/internal';
let pagIndex = 1;
const baseUrl = 'http://127.0.0.1:8090/pb-proxy'; //'/pb-proxy';//'http://127.0.0.1:8090/pb-proxy';

async function authenticatedFetch(
  url: string,
  options: RequestInit & {
    headers?: HeadersInit;
    method?: string;
    body?: any;
  } = {}
) {
  const authData = localStorage.getItem('pb_admin_auth');
  let token = '';
  if (authData) {
    try {
      const parsedData = JSON.parse(authData);
      token = parsedData.token;
    } catch (e) {
      alert('没有登录');
    }
  }

  const headers = new Headers(options.headers || {});
  headers.set('Authorization', token);

  // 如果是 POST 请求，默认设置 Content-Type 为 application/json
  if (options.method === 'POST' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const fetchOptions: RequestInit = {
    ...options,
    headers: headers,
    method: options.method || 'GET' // 默认为 GET
  };

  // 如果有 body 且是对象，将其转换为 JSON 字符串
  if (options.body && typeof options.body === 'object') {
    fetchOptions.body = JSON.stringify(options.body);
  }

  return fetch(url, fetchOptions);
}

export const MainStore = types
  .model('MainStore', {
    pages: types.optional(types.array(PageStore), []),
    theme: 'cxd',
    asideFixed: true,
    asideFolded: false,
    offScreen: false,
    addPageIsOpen: false,
    preview: false,
    isMobile: false,
    isFirstLoad: false,
    isModified: false,
    schema: types.frozen()
  })
  .views(self => ({
    get fetcher() {
      return getEnv(self).fetcher;
    },
    get notify() {
      return getEnv(self).notify;
    },
    get alert() {
      return getEnv(self).alert;
    },
    get copy() {
      return getEnv(self).copy;
    },
    get responseAdaptor() {
      return getEnv(self).responseAdaptor;
    }
  }))
  .actions(self => {
    function toggleAsideFolded() {
      self.asideFolded = !self.asideFolded;
    }

    function toggleAsideFixed() {
      self.asideFixed = !self.asideFixed;
    }

    function toggleOffScreen() {
      self.offScreen = !self.offScreen;
    }

    function setAddPageIsOpen(isOpened: boolean) {
      self.addPageIsOpen = isOpened;
    }

    const updatePageSchemaAt = flow(function* (id: string) {
      if (self.pages[0].id === id) {
        const data = self.pages[0];

        try {
          const response = yield authenticatedFetch(
            baseUrl + '/api/collections/Page/records/' + data.id,
            {
              headers: {'Content-Type': 'application/json'},
              method: 'PATCH',
              body: JSON.stringify({
                remark: data.label,
                name: data.path,
                show: data.show,
                ctype: 'page',
                config: JSON.stringify(data.schema)
              })
            }
          );

          const result = yield response.json();
          if (result.id === id) {
            localStorage.removeItem(data.id + '-schema-dirty');
            return true;
          } else {
            return false;
          }
        } catch (error) {
          console.error('Failed to fetch data', error);
          return false;
        }
      } else {
        return false;
      }
    });

    const getPageById = flow(function* (id: string, isForce: boolean) {
      if (isForce) {
        localStorage.removeItem(id + '-schema');
        localStorage.removeItem(id + '-schema-dirty');
      }

      let dataLocal = localStorage.getItem(id + '-schema');
      let dataLocalDirty = localStorage.getItem(id + '-schema-dirty');
      if (dataLocal != null && dataLocalDirty == '1') {

        const result = JSON.parse(dataLocal);

        self.pages.clear();
        self.pages.push(PageStore.create(result));

        self.isFirstLoad = true;
        document.title = result.label;
        self.schema = result.schema;

        return 'dirty';
      } else {
        try {
          const response = yield authenticatedFetch(
            baseUrl + '/api/collections/Page/records/' + id,
            {
              method: 'GET'
            }
          );

          const result = yield response.json();

          self.pages.clear();
          self.pages.push(
            PageStore.create({
              label: result.remark,
              path: result.name,
              schema: result.config,
              show: result.show,
              dirty: '',
              id: result.id
            })
          );

          self.isFirstLoad = true;
          document.title = result.remark;
          self.schema = result.config;

          return 'loaded';
        } catch (error) {
          console.error('Failed to fetch data', error);

          self.pages.clear();
          self.pages.push(
            PageStore.create({
              label: '没有找到页面',
              schema: {},
              show: false,
              dirty: '',
              id: '-'
            })
          );

          document.title = '没有找到页面';
          self.schema = {type: 'page', body: '没有找到页面'};

          return '404';
        }
      }
    });

    function updateSchema(id: any, value: any) {
      if (self.isFirstLoad) {
        self.isFirstLoad = false;
        console.log('first load: ' + self.isFirstLoad);
      } else {
        if (id === self.pages[0].id) {
          console.log('id: ' + id);
          self.schema = value;
          self.pages[0].updateSchema(value);
          localStorage.setItem(id + '-schema', JSON.stringify(self.pages[0]));
          localStorage.setItem(id + '-schema-dirty', '1');
        }
      }
    }

    function setPreview(value: boolean) {
      self.preview = value;
    }

    function setIsMobile(value: boolean) {
      self.isMobile = value;
    }

    function setIsModified(value: boolean) {
      self.isModified = value;
    }

    return {
      toggleAsideFolded,
      toggleAsideFixed,
      toggleOffScreen,
      setAddPageIsOpen,
      updatePageSchemaAt,
      updateSchema,
      setPreview,
      setIsMobile,
      getPageById,
      setIsModified
    };
  });

export type IMainStore = typeof MainStore.Type;
