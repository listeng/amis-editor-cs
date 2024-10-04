import React, {useEffect, useRef} from 'react';
import {inject, observer} from 'mobx-react';
import {RouteComponentProps} from 'react-router-dom';
import {toast, Select} from 'amis';
import {currentLocale} from 'i18n-runtime';
import {Icon} from '../icons/index';
import {IMainStore} from '../store';
import AMISRenderer from '../component/AMISRenderer';

const editorLanguages = [
  {
    label: '简体中文',
    value: 'zh-CN'
  },
  {
    label: 'English',
    value: 'en-US'
  }
];

export default inject('store')(
  observer(function ({
    store,
    location,
    history,
    match
  }: {store: IMainStore} & RouteComponentProps<{id: string}>) {
    useEffect(() => {
      store.getPageById(match.params.id);
    }, [store]);

    return (
      <AMISRenderer
      schema={store.schema}
      amisEnv={{
        fetcher: store.fetcher,
        notify: store.notify,
        alert: store.alert,
        copy: store.copy
      }}
      />
    );
  })
);
