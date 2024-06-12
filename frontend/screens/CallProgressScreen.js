
import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Title from '../components/Title';
import Screen from '../components/Screen';
import TopLogo from '../components/TopLogo';
import Subtitle from '../components/Subtitle';
import Text from '../components/Text'; // Update import statement
import { Alert } from 'react-native';
import { SERVER } from '@env'; // Update import statement
import EventSource from 'react-native-sse';


import CustomButton from '../components/CustomButton';

const extractStreetName = (address) => {
  const parts = address.split(',');
  if (parts.length > 0) {
    const streetPart = parts[0].trim();
    // Remove leading numbers
    return streetPart.replace(/^\d+\s*/, '');
  }
  return address;
};

const CallProgressScreen = ({ route, navigation }) => {
  const { pharmacies, medication, currentIndex } = route.params;

  const [currentPharmacyIndex, setCurrentPharmacyIndex] = useState(currentIndex);
  const [callStatus, setCallStatus] = useState(null); // Ensure setCallStatus is defined


  console.log('CallProgressScreen rendered'); // Add this log

  const handleStop = async () => {

       navigation.goBack();

  };
  useEffect(() => {
    console.log('useEffect triggered');
    console.log('SERVER', SERVER);

    const eventSource = new EventSource(`https://${SERVER}/events`);
    console.log('EventSource created with URL:', `https://${SERVER}/events`);

    eventSource.addEventListener("open", (event) => {
      console.log("Open SSE connection.");
    });

    eventSource.addEventListener("message", (event) => {
      console.log('Event received:', event);
      const data = JSON.parse(event.data);
      console.log('Call Status:', data);
      const status = data.status;  // Correct the status object
      setCallStatus(status.status);
      if (status.result && status.result.available) {
        Alert.alert('Medication Found!', `The medication is available at ${pharmacies[currentPharmacyIndex].pharmacy.name}`);
      } else if (status.result && !status.result.available) {
        setCurrentPharmacyIndex(prevIndex => {
          const nextIndex = prevIndex + 1;
          if (nextIndex < pharmacies.length) {
            return nextIndex;
          } else {
            Alert.alert('No more pharmacies', 'None of the pharmacies have the medication.');
            return prevIndex;
          }
        });
      }
    });

    eventSource.addEventListener("error", (event) => {
      if (event.type === "error") {
        console.error("Connection error:", event.message);
      } else if (event.type === "exception") {
        console.error("Error:", event.message, event.error);
      }
      console.log('EventSource readyState on error:', eventSource.readyState);
      eventSource.close();
    });

    eventSource.addEventListener("close", (event) => {
      console.log("Close SSE connection.");
    });

    return () => eventSource.close();
  }, [currentPharmacyIndex, pharmacies]);

  const currentPharmacy = pharmacies[currentPharmacyIndex].pharmacy; // Ensure currentPharmacy is defined here
  const streetName = extractStreetName(currentPharmacy.formatted_address);

  return (
    <Screen>
      <View style={styles.container}>
        <TopLogo />
        <Text text={`Calling ${currentPharmacy.name} on ${streetName}`} /> 
        <Subtitle text="This might take a while! We'll wait on hold for you and get the information you need :) In the meantime, feel free to exit the app, or check back here for updates. You'll get a push notification when we're done." style={styles.subtitle} />
        <View style={styles.buttonContainer}>
          <CustomButton label="Stop" onPress={handleStop} />
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

export default CallProgressScreen;






