import React, {useEffect, useRef} from 'react';
import {Editor, ShortcutKey} from 'amis-editor';
import {inject, observer} from 'mobx-react';
import {RouteComponentProps} from 'react-router-dom';
import {toast, Select} from 'amis';
import {currentLocale} from 'i18n-runtime';
import {Icon} from '../icons/index';
import {IMainStore} from '../store';
import '../editor/DisabledEditorPlugin'; // 用于隐藏一些不需要的Editor预置组件
import '../renderer/MyRenderer';
import '../editor/MyRenderer';

let currentIndex = -1;

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
    const index: number = parseInt(match.params.id, 10);
    const curLanguage = currentLocale(); // 获取当前语料类型

    const editorRef = useRef(null);

    if (index !== currentIndex) {
      currentIndex = index;
      store.updateSchema(store.pages[index].schema);
    }

    function save() {
      store.updatePageSchemaAt(index);
      toast.success('保存成功', '提示');
    }

    function onChange(value: any) {
      store.updateSchema(value);
      // store.updatePageSchemaAt(index);
    }

    function changeLocale(value: string) {
      localStorage.setItem('suda-i18n-locale', value);
      window.location.reload();
    }

    function exit() {
      history.push(`/${store.pages[index].path}`);
    }

    function saveJson() {
      if (editorRef.current) {
        // @ts-ignore
        editorRef.current.save();
      }
    }

    if (store.pages.length === 0 || store.schema === undefined) {
      return <div>请返回首页进入</div>;
    } else {
      return (
        <div className="Editor-Demo">
          {}
          <div className="Editor-header">
            <div className="Editor-title">可视化编辑器</div>
            <div className="Editor-view-mode-group-container">
              <div className="Editor-view-mode-group">
                <div
                  className={`Editor-view-mode-btn editor-header-icon ${
                    !store.isMobile ? 'is-active' : ''
                  }`}
                  onClick={() => {
                    store.setIsMobile(false);
                  }}
                >
                  <Icon icon="pc-preview" title="PC模式" />
                </div>
                <div
                  className={`Editor-view-mode-btn editor-header-icon ${
                    store.isMobile ? 'is-active' : ''
                  }`}
                  onClick={() => {
                    store.setIsMobile(true);
                  }}
                >
                  <Icon icon="h5-preview" title="移动模式" />
                </div>
              </div>
            </div>

            <div className="Editor-header-actions">
              <ShortcutKey />
              <Select
                className="margin-left-space"
                options={editorLanguages}
                value={curLanguage}
                clearable={false}
                onChange={(e: any) => changeLocale(e.value)}
              />
              <div
                className={`header-action-btn m-1 ${
                  store.preview ? 'primary' : ''
                }`}
                onClick={() => {
                  store.setPreview(!store.preview);
                }}
              >
                {store.preview ? '编辑' : '预览'}
              </div>
              {!store.preview && (
                <div
                  className={`header-action-btn exit-btn`}
                  onClick={saveJson}
                >
                  保存
                </div>
              )}
              {!store.preview && (
                <div className={`header-action-btn exit-btn`} onClick={exit}>
                  退出
                </div>
              )}
            </div>
          </div>
          <div className="Editor-inner">
            <Editor
              ref={editorRef}
              theme={'cxd'}
              preview={store.preview}
              isMobile={store.isMobile}
              value={store.schema}
              onChange={onChange}
              onPreview={() => {
                store.setPreview(true);
              }}
              $schemaUrl="../schema.json"
              onSave={save}
              className="is-fixed"
              showCustomRenderersPanel={true}
              amisEnv={{
                fetcher: store.fetcher,
                notify: store.notify,
                alert: store.alert,
                copy: store.copy,
              }}
            />
          </div>
        </div>
      );
    }
  })
);
