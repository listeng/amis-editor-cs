import {types, getEnv, applySnapshot, getSnapshot, flow} from 'mobx-state-tree';
import {PageStore} from './Page';
import {when, reaction} from 'mobx';
let pagIndex = 1;
const baseUrl = '..';//'http://127.0.0.1:8090/pb-proxy';

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

    const addPage = flow(function* (data: {
      label: string;
      path: string;
      icon?: string;
      schema?: any;
    }) {
      try {
        const response = yield authenticatedFetch(
          baseUrl + '/api/collections/Page/records',
          {
            method: 'POST',
            body: JSON.stringify({
              remark: data.label,
              name: data.path,
              ctype: 'page',
              config: data.schema
            })
          }
        );

        loadPages();
      } catch (error) {
        console.error('Failed to fetch data', error);
      }
    });

    const removePageAt = flow(function* (index: number) {
      try {
        const response = yield authenticatedFetch(
          baseUrl + '/api/collections/Page/records/' + self.pages[index].id,
          {
            method: 'DELETE'
          }
        );

        loadPages();
      } catch (error) {
        console.error('Failed to fetch data', error);
      }
    });

    const updatePageSchemaAt = flow(function* (index: number) {
      self.pages[index].updateSchema(self.schema);

      const data = self.pages[index];

      try {
        const response = yield authenticatedFetch(
          baseUrl + '/api/collections/Page/records/' + data.id,
          {
            headers: { 'Content-Type': 'application/json' },
            method: 'PATCH',
            body: JSON.stringify({
              remark: data.label,
              name: data.path,
              show: data.show,
              ctype: 'page',
              config: JSON.stringify(self.schema)
            })
          }
        );

        loadPages();
      } catch (error) {
        console.error('Failed to fetch data', error);
      }
    });

    const getPageById = flow(function* (id: string) {
      try {
        const response = yield authenticatedFetch(
          baseUrl + '/api/collections/Page/records/' + id,
          {
            method: 'GET'
          }
        );

        const result = yield response.json();

        console.log(result);

        self.pages.clear();
        self.pages.push(
          PageStore.create({
            label: result.remark,
            path: result.name,
            schema: result.config,
            show: result.show,
            id: result.id
          })
        );

        updateSchema(result.config);

      } catch (error) {
        console.error('Failed to fetch data', error);
      }
    });

    function updateSchema(value: any) {
      self.schema = value;
    }

    function setPreview(value: boolean) {
      self.preview = value;
    }

    function setIsMobile(value: boolean) {
      self.isMobile = value;
    }

    const loadPages = flow(function* () {
      try {
        const response = yield authenticatedFetch(
          baseUrl + '/api/collections/Page/records?filter=ctype="page"'
        );
        const data = yield response.json();

        self.pages.clear();
        if (data.items && data.items.length > 0) {
          for (let i = 0; i < data.items.length; i++) {
            self.pages.push(
              PageStore.create({
                label: data.items[i].remark,
                path: data.items[i].name,
                schema: data.items[i].config,
                show: data.items[i].show,
                id: data.items[i].id
              })
            );
          }
        }
      } catch (error) {
        console.error('Failed to fetch data', error);
      }
    });

    return {
      toggleAsideFolded,
      toggleAsideFixed,
      toggleOffScreen,
      setAddPageIsOpen,
      addPage,
      removePageAt,
      updatePageSchemaAt,
      updateSchema,
      setPreview,
      setIsMobile,
      loadPages,
      getPageById
    };
  });

export type IMainStore = typeof MainStore.Type;
