import 'react-native-gesture-handler';
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import WelcomeScreen from '../screens/WelcomeScreen';
import DosageScreen from '../screens/DosageScreen';
import LocationScreen from '../screens/LocationScreen';
import FindingPharmaciesScreen from '../screens/FindingPharmaciesScreen';
import NoResultsScreen from '../screens/NoResultsScreen';
import ResultsScreen from '../screens/ResultsScreen';
import StartCallingScreen from '../screens/StartCallingScreen';
import CallProgressScreen from '../screens/CallProgressScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer independent={true}>
      <Stack.Navigator initialRouteName="Welcome">
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Dosage" component={DosageScreen} />
        <Stack.Screen name="Location" component={LocationScreen} />
        <Stack.Screen name="FindingPharmacies" component={FindingPharmaciesScreen} />
        <Stack.Screen name="NoResults" component={NoResultsScreen} />
        <Stack.Screen name="Results" component={ResultsScreen} />
        <Stack.Screen name="StartCalling" component={StartCallingScreen} />
        <Stack.Screen name="CallProgressScreen" component={CallProgressScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
