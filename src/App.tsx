import React from 'react';
import {Provider} from 'mobx-react';
import {toast, alert, confirm} from 'amis';
import axios from 'axios';
import {MainStore} from './store/index';
import RootRoute from './route/index';
import copy from 'copy-to-clipboard';

export default function (): JSX.Element {
  const store = ((window as any).store = MainStore.create(
    {},
    {
      fetcher: ({url, method, data, config, headers}: any) => {
        config = config || {};
        config.headers = config.headers || headers || {};
        // config.withCredentials = true;

        // @ts-ignore
        config.headers['Authorization'] = getAuthToken();

        let resp = null;

        if (method !== 'post' && method !== 'put' && method !== 'patch') {
          if (data) {
            config.params = data;
          }

          resp = (axios as any)[method](url, config);
        } else {
          if (data && data instanceof FormData) {
            config.headers['Content-Type'] = 'multipart/form-data';
          } else if (
            data &&
            typeof data !== 'string' &&
            !(data instanceof Blob) &&
            !(data instanceof ArrayBuffer)
          ) {
            data = JSON.stringify(data);
            config.headers['Content-Type'] = 'application/json';
          }

          resp = (axios as any)[method](url, data, config);
        }

        if (resp) {
          return resp
            .then((response: any) => {
              if (response.status === 204) {
                return {
                  code: 0,
                  messages: '操作成功'
                };
              }
              return response.data;
            })
            .then((payload: any) => {
              if (url.indexOf('auth-with-password') > 0) {
                return {data: payload};
              } else {
                const result: any = {
                  status: payload.code || 0,
                  msg: payload.messages || '操作成功'
                };

                if (payload.items !== undefined) {
                  result.data = {
                    items: payload.items,
                    total: payload.totalItems
                  };
                } else {
                  result.data = {};
                }

                return {data: result};
              }
            });
        }
      },
      isCancel: (e: any) => axios.isCancel(e),
      notify: (type: 'success' | 'error' | 'info', msg: string) => {
        toast[type]
          ? toast[type](msg, type === 'error' ? '系统错误' : '系统消息')
          : console.warn('[Notify]', type, msg);
        console.log('[notify]', type, msg);
      },
      alert,
      confirm,
      copy: (contents: string, options: any = {}) => {
        const ret = copy(contents, options);
        ret &&
          (!options || options.shutup !== true) &&
          toast.info('内容已拷贝到剪切板');
        return ret;
      }
    }
  ));

  return (
    <Provider store={store}>
      <RootRoute store={store} />
    </Provider>
  );
}
