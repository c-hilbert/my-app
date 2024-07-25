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
  const { pharmacies, medication, dosage, currentIndex, callSid: firstCallSid } = route.params;

  const [currentPharmacyIndex, setCurrentPharmacyIndex] = useState(currentIndex);
  const [callStatus, setCallStatus] = useState(null); // Ensure setCallStatus is defined
  const [callSid, setCallSid] = useState(firstCallSid);  // New state to store callSid
  const [isSearchStopped, setIsSearchStopped] = useState(false);


  console.log('CallProgressScreen rendered with callSid:', firstCallSid); // Add this log

  const handleStop = async () => {
    console.log("Stopping call with callSid:", callSid);
    if (callSid) {
      try {
        const response = await fetch(`https://${SERVER}/call/end-call`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ callSid }),
        });

        if (!response.ok) {
          throw new Error('Failed to end the call');
        }

      } catch (error) {
        console.error('Error ending call:', error);
      }
    }
   // navigation.goBack();
  // Set the search as stopped
  setIsSearchStopped(true);

  // Show the "Search ended" alert
  Alert.alert('Search Ended', 'The search has been stopped.');


  };

  const initiateNextCall = (index) => {
    const pharmacy = pharmacies[index];
    console.log('Initiating call to next pharmacy:', pharmacy.pharmacy.name);
    // Make the API call to initiate the next call
    fetch(`https://${SERVER}/call/initiate-call`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber: pharmacy.pharmacy.formatted_phone_number, // This is already formatted
        placeId: pharmacy.pharmacy.place_id,
        medication: medication,
        dosage: dosage // or whatever dosage is relevant
      }),
    })
    .then(response => response.json())
    .then(data => {
      console.log('Server response:', data);
    })
    .catch(error => {
      console.error('Error initiating next call:', error);
    });
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

     // Store the callSid when we receive it
      if (data.callSid && !callSid) {
        setCallSid(data.callSid);
      }

      if (status.result && status.result.available) {
        Alert.alert('Medication Found!', `The medication is available at ${pharmacies[currentPharmacyIndex].pharmacy.name}`);
      } else if (status.result && !status.result.available && !isSearchStopped) {
        // Move to the next pharmacy if available status is false
        setCurrentPharmacyIndex(prevIndex => {
          const nextIndex = prevIndex + 1;
          if (nextIndex < pharmacies.length) {
            // Re-render the screen with the next pharmacy and initiate the next call
            initiateNextCall(nextIndex);
            return nextIndex;
          } else {
            Alert.alert('No more pharmacies', 'None of the pharmacies have the medication.');
            return prevIndex; // No more pharmacies to check
          }
        });
      }
    });

    eventSource.addEventListener("error", (event) => {
      console.error("EventSource failed:", event);
      eventSource.close();
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
