import { NavigationContainer } from '@react-navigation/native';
import { AppStack } from '@routes';

export function Router() {
  return (
    <NavigationContainer>
      <AppStack />
    </NavigationContainer>
  );
}