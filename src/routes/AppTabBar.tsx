import React from 'react'

import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

import {
    Box,
    BoxProps,
    Icon,
    Text,
    TouchableOpacityBox,
    TouchableOpacityBoxProps,
    TextProps,
} from '@components';
import { AppBottomTabParamList } from '@routes';

import { mapScreenToProps } from './mapScreenToProps';

export function AppTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    return (
        <Box {...$boxWrapper} flexDirection="row">
            {state.routes.map((route, index) => {
                const { options } = descriptors[route.key];

                const tabItem =
                    mapScreenToProps[route.name as keyof AppBottomTabParamList];

                const isFocused = state.index === index;

                const onPress = () => {
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                        // The `merge: true` option makes sure that the params inside the tab screen are preserved
                        navigation.navigate({ name: route.name, params: undefined, merge: true });
                    }
                };

                const onLongPress = () => {
                    navigation.emit({
                        type: 'tabLongPress',
                        target: route.key,
                    });
                };

                return (
                    <TouchableOpacityBox
                        key={index}
                        {...$itemWrapper}
                        accessibilityState={isFocused ? { selected: true } : {}}
                        accessibilityLabel={options.tabBarAccessibilityLabel}
                        // testID={options.tabBarTestID}
                        onPress={onPress}
                        onLongPress={onLongPress}
                        style={{ flex: 1 }}>
                        <Icon
                            color={isFocused ? 'primaryContrast' : 'gray2'}
                            name={isFocused ? tabItem.icon.focused : tabItem.icon.unfocused}
                        />
                        <Text
                            {...$label}
                            color={isFocused ? 'primaryContrast' : 'gray2'}>
                            {tabItem.label}
                        </Text>
                    </TouchableOpacityBox>
                );
            })}
        </Box>
    );
}

const $label: TextProps = {
    semibold: true,
    marginTop: 's4',
    preset: 'paragraphCaption',
};

const $itemWrapper: TouchableOpacityBoxProps = {
    activeOpacity: 1,
    alignItems: 'center',
    accessibilityRole: 'button',
    backgroundColor: 'primary',
    padding: 's10',
};

const $boxWrapper: BoxProps = {
    paddingTop: 's12',
    backgroundColor: 'background',
    flexDirection: 'row',
};