import React from 'react';
import {ToastComponent, AlertComponent, Spinner} from 'amis';
/**
 * BrowserRouter: history 路由模式
 * HashRouter: hash 路由模式
 */
import {Route, Switch, Redirect, HashRouter as Router} from 'react-router-dom';
import {observer} from 'mobx-react';
import {IMainStore} from '../store/index';
import '../renderer/MyRenderer';
const Editor = React.lazy(() => import('./Editor'));
const Page = React.lazy(() => import('./Page'));
const NotFound = React.lazy(() => import('./NotFound'));

export default observer(function ({store}: {store: IMainStore}) {
  return (
    <Router>
      <div className="routes-wrapper">
        <ToastComponent key="toast" position={'top-right'} />
        <AlertComponent key="alert" />
        <React.Suspense
          fallback={<Spinner overlay className="m-t-lg" size="lg" />}
        >
          <Switch>
            <Route path="/page/:id" component={Page} />
            <Route path="/edit/:id" component={Editor} />
            <Route component={NotFound} />
          </Switch>
        </React.Suspense>
      </div>
    </Router>
  );
});
