
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Title from '../components/Title';
import Screen from '../components/Screen';
import TopLogo from '../components/TopLogo';
import Subtitle from '../components/Subtitle';
import Text from '../components/Text'; // Update import statement
import { Alert } from 'react-native';
import { SERVER } from '@env'; // Update import statement

import CustomButton from '../components/CustomButton';

const StartCallingScreen = ({ route, navigation }) => {
  const { pharmacies, medication, dosage } = route.params;
  console.log('pharmacies:', pharmacies)

  const handleStartCall = async () => {
    if (pharmacies && pharmacies.length > 0) {
      try {
        const pharmacy = pharmacies[0];
        console.log('passing pharmacy id to server:', pharmacy.pharmacy.place_id, 'along with medication', medication, 'and dosage', dosage);
        const response = await fetch(`https://${SERVER}/call/initiate-call`, { // Replace with your server address
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            phoneNumber: '+15125170223',
            placeId: pharmacy.pharmacy.place_id,  // Include pharmacyId
            medication: medication, //include medication type
            dosage: dosage
          }),
        });

        const data = await response.json();
        console.log('Server response:', data); // Log the server response

        if (data.success) {
          console.log('Call Initiated');
        } else {
          console.error('Error initiating call:', error);
          Alert.alert('Error', 'Failed to initiate call');
        }
      } catch (error) {
        console.error('Error initiating call:', error);
        Alert.alert('Error', 'Failed to initiate call');
      }
    } else {
      Alert.alert('No Pharmacies', 'No pharmacies to call');
    }
      //  Navigate to CallProgressScreen
       navigation.navigate('CallProgressScreen', { pharmacies, medication, currentIndex: 0 });

  };

  return (
    <Screen>
      <View style={styles.container}>
        <TopLogo />
        <Text text={`We found some pharmacies in your area that might have ${medication}.`} /> 
        <Subtitle text="We'll call them one by one and ask about the availability of your medication. This may take a while....feel free to close out of the app! You'll get a notification when we're done." style={styles.subtitle} />
        <View style={styles.buttonContainer}>
          <CustomButton label="Start calling!" onPress={handleStartCall} />
        </View>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  subtitle: {
    textAlign: 'center',
    marginVertical: 30, // Adjust spacing between subtitles

  },
  buttonContainer: {
    marginTop: 20, // Adjust as needed for spacing
  },
});

export default StartCallingScreen;




