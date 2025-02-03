import React from 'react';
import {ClassNamesFn, themeable} from 'amis-core';
import {autobind, uuid} from 'amis-core';
import debounce from 'lodash/debounce';
import L from 'leaflet';

L.Icon.Default.imagePath = 'images/';

interface LeafletPickerProps {
  vendor: 'osm' | 'tdt' | 'geoq';
  classnames: ClassNamesFn;
  classPrefix: string;
  value?: {
    lat: number;
    lng: number;
    zoom?: number;
  };
  onChange?: (value: any) => void;
  showGeoLoc?: boolean;
  mapStyle?: React.CSSProperties;
}

interface LeafletLocationItem {
  lat: number;
  lng: number;
}

interface LeafletPickerState {
  inputValue: string;
  locIndex?: number;
  locs: Array<LeafletLocationItem>;
}

export class LeafletPicker extends React.Component<
  LeafletPickerProps,
  LeafletPickerState
> {
  state: LeafletPickerState = {
    inputValue: '',
    locs: [],
    locIndex: -1
  };

  id = uuid();
  mapRef: React.RefObject<HTMLDivElement> = React.createRef();
  placeholderInput?: HTMLInputElement;
  map: any;
  marker: any;
  ac: any;
  convertor: any;

  componentDidMount() {
    this.initMap();
  }

  componentWillUnmount() {
    this.ac?.dispose?.();
    this.placeholderInput && document.body.removeChild(this.placeholderInput!);

    delete this.placeholderInput;
    delete this.map;
  }

  defaultLat = 24.0;
  defaultLng = 108.0;
  defaultZoom = 5;

  @autobind
  async initMap() {
    if (this.mapRef.current) {
      const map = L.map(this.mapRef.current, {
        attributionControl: false
      });

      if (this.props.vendor === 'tdt') {
        const tk = '59d4a61409959f96e676af638bd92ef4';
        L.tileLayer(
          'http://t0.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img' +
            '&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=' +
            tk
        ).addTo(map);
        L.tileLayer(
          'http://t0.tianditu.gov.cn/cva_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva' +
            '&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=' +
            tk
        ).addTo(map);
      } else {
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(
          map
        );
      }

      this.map = map;

      const value = this.props.value;

      if (value) {
        map.setView([value.lat, value.lng], this.defaultZoom);

        this.marker = L.marker([value.lat, value.lng]);
        this.marker.addTo(map);
      } else {
        map.setView([this.defaultLat, this.defaultLng], this.defaultZoom);
      }

      map.on('click', (e: any) => {
        this.getLocations(e.latlng);
      });
    }
  }

  @autobind
  getLocations(point: any) {
    const {lat, lng} = point;

    // 说明已经销毁了。
    if (!this.map) {
      return;
    }

    const index = 0;
    const locs: Array<LeafletLocationItem> = [];

    locs.push({
      lat: lat,
      lng: lng
    });

    if (this.marker != null) {
      this.map.removeLayer(this.marker);
    }
    this.marker = L.marker([lat, lng]);
    this.marker.addTo(this.map);

    this.setState(
      {
        locIndex: index,
        locs
      },
      () => {
        typeof this.props?.onChange === 'function' &&
          this.props?.onChange({
            lat: locs[0].lat,
            lng: locs[0].lng
          });
      }
    );
  }

  @autobind
  handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({
      inputValue: e.currentTarget.value
    });
  }

  render() {
    const {classnames: cx, mapStyle} = this.props;
    const {locIndex, locs, inputValue} = this.state;

    return (
      <div className={cx('MapPicker')}>
        <div
          ref={this.mapRef}
          className={cx('MapPicker-map')}
          style={mapStyle}
        />
      </div>
    );
  }
}

export default themeable(LeafletPicker);
