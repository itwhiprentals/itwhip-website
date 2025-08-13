// types/ionicons.d.ts

declare namespace JSX {
    interface IntrinsicElements {
      'ion-icon': {
        name?: string;
        style?: React.CSSProperties;
        class?: string;
        size?: 'small' | 'large';
        color?: string;
        slot?: string;
        ios?: string;
        md?: string;
      };
    }
  }