import 'leaflet';

declare module 'react-leaflet' {
  import { ComponentType } from 'react';
  import { MapOptions } from 'leaflet';

  export interface MapContainerProps extends MapOptions {
    center: [number, number];
    zoom: number;
    children?: React.ReactNode;
    style?: React.CSSProperties;
    className?: string;
  }

  export const MapContainer: ComponentType<MapContainerProps>;
  export const GeoJSON: any; // You might want to properly type this as well
  export const useMap: any; // You might want to properly type this as well
}
