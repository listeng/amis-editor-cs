import React, {useEffect, useRef} from 'react';
import {inject, observer} from 'mobx-react';
import {RouteComponentProps} from 'react-router-dom';
import {IMainStore} from '../store';
import AMISRenderer from '../component/AMISRenderer';

export default inject('store')(
  observer(function ({
    store,
    location,
    history,
    match
  }: {store: IMainStore} & RouteComponentProps<{id: string}>) {
    useEffect(() => {
      store.getPageById(match.params.id, true);
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
