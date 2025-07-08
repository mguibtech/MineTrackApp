import { HistoryScreen, HomeScreen, SettingsScreen } from "@screens";
import { BottomTabBarProps, createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { AppTabBar } from "@routes";




export type AppBottomTabParamList = {
    HomeScreen: undefined;
    HistoryScreen: undefined
    SettingsScreen: undefined
};

const Tab = createBottomTabNavigator<AppBottomTabParamList>();


export function AppTabNavigation() {

    function renderTabBar(props: BottomTabBarProps) {
        return <AppTabBar {...props} />;
    }

    return (
        <Tab.Navigator
            tabBar={renderTabBar}
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    paddingTop: 20,
                },
            }}>
            <Tab.Screen name="HomeScreen" component={HomeScreen} />
            <Tab.Screen name="HistoryScreen" component={HistoryScreen} />
            <Tab.Screen name="SettingsScreen" component={SettingsScreen} />
        </Tab.Navigator>
    )
}