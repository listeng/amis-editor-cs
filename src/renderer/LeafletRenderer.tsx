import React from 'react';
import {
  ThemeProps,
  autobind,
  getVariable
} from 'amis-core';
import {
  FormItem,
  FormControlProps,
  resolveEventData
} from 'amis-core';
import {Api, ActionObject} from 'amis-core';
import {isMobile} from 'amis-core';
import {FormBaseControlSchema, SchemaType} from 'amis/lib/Schema';
import {supportStatic} from 'amis/lib/renderers/Form/StaticHoc';
import LeafletPicker from '../component/LeafletPicker';
import { Location2Picker } from '../component/Location2Picker';

export interface LeafletControlSchema extends Omit<FormBaseControlSchema, 'type'> {
  type: SchemaType | 'leaflet-picker';

  /**
   * 选择地图类型
   */
  vendor?: 'osm' | 'tdt';

  /**
   * 开启只读模式后的占位提示，默认为“点击获取位置信息”
   * 备注：区分下现有的placeholder（“请选择位置”）
   */
  getLocationPlaceholder?: string;
}

export interface LeafletControlProps
  extends FormControlProps,
    Omit<ThemeProps, 'className'>,
    Omit<
      LeafletControlSchema,
      'type' | 'className' | 'descriptionClassName' | 'inputClassName'
    > {
  value: any;
  vendor: 'osm' | 'tdt';
  onChange: (value: any) => void;
}

export class LeafletControl extends React.Component<LeafletControlProps> {
  static defaultProps = {
    vender: 'osm',
  };
  domRef: React.RefObject<HTMLDivElement> = React.createRef();
  state = {
    isOpened: false
  };

  @autobind
  close() {
    this.setState({
      isOpened: false
    });
  }

  @autobind
  open() {
    this.setState({
      isOpened: true
    });
  }

  @autobind
  handleClick() {
    this.state.isOpened ? this.close() : this.open();
  }

  @autobind
  async handleChange(value: any) {
    const {dispatchEvent, onChange} = this.props;
    const dispatcher = await dispatchEvent(
      'change',
      resolveEventData(this.props, {value})
    );
    if (dispatcher?.prevented) {
      return;
    }
    onChange(value);
  }

  @autobind
  getParent() {
    return this.domRef.current?.parentElement;
  }

  @autobind
  getTarget() {
    return this.domRef.current;
  }

  doAction(action: ActionObject, data: object, throwErrors: boolean): any {
    const {resetValue, onChange, formStore, store, name} = this.props;
    const actionType = action?.actionType as string;
    switch (actionType) {
      case 'clear':
        onChange('');
        break;
      case 'reset':
        onChange?.(
          getVariable(formStore?.pristine ?? store?.pristine, name) ??
            resetValue ??
            ''
        );
        break;
    }
  }

  renderStatic(displayValue = '-') {
    const {
      classnames: cx,
      value,
      staticSchema,
    } = this.props;
    const __ = this.props.translate;

    if (!value) {
      return <>{displayValue}</>;
    }

    return (
      <div
        className={this.props.classnames('LocationControl', {
          'is-mobile': isMobile()
        })}
        ref={this.domRef}
      >
        {staticSchema?.embed ? (
          <>
            {staticSchema.showAddress === false ? null : (
              <div className="mb-2">{value.address}</div>
            )}
            <LeafletPicker
              value={value}
              mapStyle={staticSchema.mapStyle}
            />
          </>
        ) : (
          <span>{value.address}</span>
        )}
      </div>
    );
  }

  @supportStatic()
  render() {
    const {style, env} = this.props;
    return (
      <div
        className={this.props.classnames('LocationControl', {
          'is-mobile': isMobile()
        })}
      >
        <Location2Picker
          {...this.props}
          onChange={this.handleChange}
        />
      </div>
    );
  }
}

@FormItem({
  type: 'leaflet-picker'
})
export class LeafletRenderer extends LeafletControl {}
