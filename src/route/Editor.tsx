import React, {useEffect, useRef} from 'react';
import {Editor, ShortcutKey} from 'amis-editor';
import {inject, observer} from 'mobx-react';
import {RouteComponentProps} from 'react-router-dom';
import {toast, Select} from 'amis';
import {Button} from 'amis-ui';
import {currentLocale} from 'i18n-runtime';
import {Icon} from '../icons/index';
import {IMainStore} from '../store';
import '../editor/DisabledEditorPlugin'; // 用于隐藏一些不需要的Editor预置组件
import '../renderer/MyRenderer';
import '../editor/MyRenderer';

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
    const curLanguage = currentLocale(); // 获取当前语料类型

    const editorRef = useRef(null);

    useEffect(() => {
      store
        .getPageById(match.params.id, false)
        .then(result => {
          if (result == 'dirty') {
            toast.warning(
              '恢复到了上次未保存的状态！可以点击【重新加载】加载最新数据！'
            );
          } else if (result == 'loaded') {
            toast.success('加载成功！');
          } else if (result == '404') {
            toast.error('没有对应的页面配置数据！');
          }
        })
        .catch(() => {
          toast.error('页面加载失败！');
        });
    }, [store]);

    function save() {
      store
        .updatePageSchemaAt(match.params.id)
        .then(result => {
          if (result) {
            toast.success('保存成功！');
            store.setIsModified(false);
          } else {
            toast.error('保存失败！');
          }
        })
        .catch(error => {
          toast.error('保存失败！');
        });
    }

    function reloadJson() {
      store
        .getPageById(match.params.id, true)
        .then(result => {
          if (result == 'dirty') {
            toast.warning(
              '恢复到了上次未保存的状态！可以点击【重新加载】加载最新数据！'
            );
          } else if (result == 'loaded') {
            toast.success('加载成功！');
          } else if (result == '404') {
            toast.error('没有对应的页面配置数据！');
          }
        })
        .catch(() => {
          toast.error('页面加载失败！');
        });
    }

    function onChange(value: any) {
      store.updateSchema(match.params.id, value);
      store.setIsModified(true);
    }

    function changeLocale(value: string) {
      localStorage.setItem('suda-i18n-locale', value);
      window.location.reload();
    }

    function saveJson() {
      if (editorRef.current) {
        // @ts-ignore
        editorRef.current.save();
      }
    }

    return (
      <div className="Editor-Demo">
        {}
        <div className="Editor-header">
          <div className="Editor-title">
            可视化编辑器{' '}
            {store.isModified && (
              <span style={{color: 'red', marginLeft: '10px'}}>(已修改)</span>
            )}
          </div>
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
            <Button
              onClick={() => {}}
              type="button"
              action="actionType"
              className="ai-button"
            >
              <Icon icon="fas fa-star-of-david" title="AI助手" />
            </Button>
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
                onClick={reloadJson}
              >
                重新加载
              </div>
            )}
            {!store.preview && (
              <div className={`header-action-btn exit-btn`} onClick={saveJson}>
                保存
              </div>
            )}
          </div>
        </div>
        <div className="Editor-inner">
          <Editor
            ref={editor => {
              // @ts-ignore
              editorRef.current = editor;
            }}
            theme={'cxd'}
            preview={store.preview}
            isMobile={store.isMobile}
            value={store.schema}
            onChange={onChange}
            onPreview={() => {
              store.setPreview(true);
            }}
            $schemaUrl="/pb-proxy/schema.json"
            onSave={save}
            className="is-fixed"
            showCustomRenderersPanel={true}
            amisEnv={{
              fetcher: store.fetcher,
              notify: store.notify,
              alert: store.alert,
              copy: store.copy
            }}
          />
        </div>
      </div>
    );
  })
);
