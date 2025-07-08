import { IconProps } from '@components';

import { AppBottomTabParamList } from './AppTabNavigation';

export const mapScreenToProps: Record<
  keyof AppBottomTabParamList,
  {
    label: string;
    icon: {
      focused: IconProps['name'];
      unfocused: IconProps['name'];
    };
  }
> = {
  HomeScreen: {
    label: 'Principal',
    icon: {
      focused: 'home',
      unfocused: 'home',
    },
  },
  HistoryScreen: {
    label: 'Histórico',
    icon: {
      focused: 'violation',
      unfocused: 'violation',
    },
  },
  SettingsScreen: {
    label: 'Configurações',
    icon: {
      focused: 'settings',
      unfocused: 'settings',
    },
  },
};
