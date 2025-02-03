import {
  EditorNodeType,
  getSchemaTpl,
  tipedLabel,
  registerEditorPlugin,
  BasePlugin,
  BaseEventContext,
  RendererPluginAction,
  RendererPluginEvent
} from 'amis-editor-core';
import {
  getEventControlConfig,
  COMMON_ACTION_SCHEMA_MAP
} from 'amis-editor/lib/renderer/event-control/helper';
import {ValidatorTag} from 'amis-editor/lib/validator';

export class LeafletControlPlugin extends BasePlugin {
  static id = 'LeafletControlPlugin';
  // 关联渲染器名字
  rendererName = 'leaflet-picker';

  // 组件名称
  name = '坐标拾取';
  isBaseComponent = true;
  notRenderFormZone = true;
  icon = 'fa fa-map';
  pluginIcon = 'leaflet-picker-plugin';
  description = '坐标拾取';
  tags = ['表单项'];
  scaffold = {
    type: 'leaflet-picker',
    name: 'location',
    label: '位置选择'
  };

  previewSchema: any = {
    type: 'form',
    className: 'text-left',
    mode: 'horizontal',
    wrapWithPanel: false,
    body: [
      {
        ...this.scaffold
      }
    ]
  };

  panelTitle = '坐标拾取';

  // 事件定义
  events: RendererPluginEvent[] = [
    {
      eventName: 'change',
      eventLabel: '值变化',
      description: '选中值变化时触发',
      dataSchema: [
        {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              title: '数据',
              properties: {
                value: {
                  type: 'object',
                  title: '选中的值',
                  properties: {
                    lng: {
                      type: 'number',
                      title: '经度'
                    },
                    lat: {
                      type: 'number',
                      title: '纬度'
                    },
                    vendor: {
                      type: 'string',
                      title: '地图类型'
                    }
                  }
                }
              }
            }
          }
        }
      ]
    }
  ];

  // 动作定义
  actions: RendererPluginAction[] = [
    {
      actionType: 'clear',
      actionLabel: '清空',
      description: '清除选中值',
      ...COMMON_ACTION_SCHEMA_MAP['clear']
    },
    {
      actionType: 'reset',
      actionLabel: '重置',
      description: '将值重置为初始值',
      ...COMMON_ACTION_SCHEMA_MAP['reset']
    },
    {
      actionType: 'setValue',
      actionLabel: '赋值',
      description: '触发组件数据更新',
      ...COMMON_ACTION_SCHEMA_MAP['setValue']
    }
  ];

  panelJustify = true;

  panelBodyCreator = (context: BaseEventContext) => {
    const renderer: any = context.info.renderer;
    return getSchemaTpl('tabs', [
      {
        title: '属性',
        body: [
          getSchemaTpl('collapseGroup', [
            {
              title: '基本',
              body: [
                getSchemaTpl('layout:originPosition', {value: 'left-top'}),
                getSchemaTpl('formItemName', {
                  required: true
                }),
                getSchemaTpl('label'),
                {
                  type: 'select',
                  name: 'vendor',
                  label: '地图类型',
                  value: 'osm',
                  options: [
                    {label: '天地图', value: 'tdt'},
                    {label: 'OpenStreetMap', value: 'osm'}
                  ]
                },
                getSchemaTpl('formulaControl', {
                  name: 'value',
                  label: tipedLabel(
                    '默认值',
                    `传入参数格式应满足如下要求：<br/>
                      <pre>${JSON.stringify(
                        {
                          lat: 'number',
                          lng: 'number'
                        },
                        null,
                        2
                      )}</pre>`
                  ),
                  size: 'lg',
                  mode: 'horizontal',
                  // required: true, // 默认值不建议必填
                  placeholder: '请输入变量值'
                }),
                getSchemaTpl('clearable'),
                getSchemaTpl('labelRemark'),
                getSchemaTpl('remark'),
                getSchemaTpl('description')
              ]
            },
            getSchemaTpl('status', {
              isFormItem: true,
              readonly: false
            }),
            getSchemaTpl('validation', {tag: ValidatorTag.File})
          ])
        ]
      },
      {
        title: '外观',
        body: [
          getSchemaTpl('collapseGroup', [
            getSchemaTpl('style:formItem', {renderer}),
            getSchemaTpl('theme:form-label'),
            getSchemaTpl('theme:classNames', {
              schema: [
                {
                  type: 'theme-classname',
                  label: '控件',
                  name: 'inputClassName'
                },
                {
                  type: 'theme-classname',
                  label: '表单项',
                  name: 'className'
                },
                {
                  type: 'theme-classname',
                  label: '静态表单项',
                  name: 'staticClassName'
                }
              ]
            }),
            getSchemaTpl('theme:cssCode', {
              themeClass: [
                {
                  name: '输入框',
                  value: '',
                  className: 'inputControlClassName',
                  state: ['default', 'hover', 'active']
                },
                {
                  name: 'addOn',
                  value: 'addOn',
                  className: 'addOnClassName'
                }
              ],
              isFormItem: true
            })
          ])
        ]
      },
      {
        title: '事件',
        className: 'p-none',
        body: [
          getSchemaTpl('eventControl', {
            name: 'onEvent',
            ...getEventControlConfig(this.manager, context)
          })
        ]
      }
    ]);
  };

  buildDataSchemas(node: EditorNodeType, region: EditorNodeType) {
    return {
      type: 'object',
      title: node.schema?.label || node.schema?.name,
      properties: {
        vendor: {
          type: 'string',
          title: '地图类型'
        },
        lng: {
          type: 'number',
          title: '经度'
        },
        lat: {
          type: 'number',
          title: '纬度'
        }
      },
      originalValue: node.schema?.value // 记录原始值，循环引用检测需要
    };
  }
}

registerEditorPlugin(LeafletControlPlugin);
