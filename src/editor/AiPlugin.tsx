import {
  registerEditorPlugin,
  BasePlugin,
  BuildPanelEventContext,
  BasicPanelItem,
} from 'amis-editor';
import {Icon, Button, Textarea, Tab, Tabs, Spinner} from 'amis-ui';
import React, {useState} from 'react';

export class AiPlugin extends BasePlugin {
  static scene = ['layout'];
  order = -9999;

  buildEditorPanel(
    {info, selections}: BuildPanelEventContext,
    panels: Array<BasicPanelItem>
  ) {
    panels.push({
      key: 'aicode',
      title: (
        <span
          className="editor-tab-icon editor-tab-s-icon"
          editor-tooltip="智能助手"
        >
          <Icon icon="fa fa-magic" />
        </span>
      ),
      icon: '',
      position: 'left',
      component: AiPanel,
      order: 5000
    });
  }
}

export function AiPanel(props: any) {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {onChange, manager, store} = props;

  const handleClick = async () => {
    setIsLoading(true);
    try {
      manager.env
        .fetcher({
          url: '/pb-proxy/api/code-help',
          method: 'post',
          headers: {
            'Content-Type': 'application/json'
          },
          data: {
            prompt: text,
            code: JSON.stringify(store.valueWithoutHiddenProps)
          }
        })
        .then((data: any) => {
          console.log(data);
          setIsLoading(false);

          if (data.data.status === 0) {
            onChange(JSON.parse(data.data.data));
          }
        });
    } catch (error) {
      console.error('Error:', error);
      setIsLoading(false);
    }
  };
  return (
    <div className="ae-Outline-panel">
      <div className="panel-header">智能助手</div>
      <Tabs
        className="ae-outline-tabs"
        linksClassName="ae-outline-tabs-header"
        contentClassName="ae-outline-tabs-content ai-tabs-content"
        tabsMode="line"
      >
        <Tab
          className={'ae-outline-tabs-panel'}
          key={'component-outline'}
          eventKey={'component-outline'}
          title={'指令'}
        >
          <Textarea
            value={text}
            onChange={(value: any) => setText(value)}
            placeholder="需要我帮您做什么？"
            style={{width: '100%', margin: '10px 0', minHeight: '100px'}}
          />
          <Spinner show={isLoading} tip="生成中..." tipPlacement="right"></Spinner>
          <Button
            onClick={handleClick}
            level="primary"
            block
            disabled={isLoading}
          >
            执行
          </Button>
        </Tab>
        <Tab
          className={'ae-outline-tabs-panel'}
          key={'dialog-outline'}
          eventKey={'dialog-outline'}
          title={'历史'}
        >
          暂未开放
        </Tab>
      </Tabs>
    </div>
  );
}

registerEditorPlugin(AiPlugin);
