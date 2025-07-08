import { NavigatorScreenParams } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AppBottomTabParamList, AppTabNavigation } from './AppTabNavigation';
import { DetailScreen } from '@screens';


export type AppStackParamList = {
    AppTabNavigation: NavigatorScreenParams<AppBottomTabParamList>;
    DetailScreen: undefined;
};

const Stack = createStackNavigator<AppStackParamList>();

interface AppStackProps {
    initialRoute?: keyof AppStackParamList;
}

export function AppStack({ initialRoute = "AppTabNavigation" }: AppStackProps) {
    return (
        <Stack.Navigator screenOptions={{
            headerShown: false,
        }}
            initialRouteName={initialRoute}
        >
            <Stack.Screen name="AppTabNavigation" component={AppTabNavigation} />
            <Stack.Screen name="DetailScreen" component={DetailScreen} />
        </Stack.Navigator>
    );
}