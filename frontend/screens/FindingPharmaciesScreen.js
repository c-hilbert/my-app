import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Alert } from 'react-native';
import Screen from '../components/Screen';
import Subtitle from '../components/Subtitle';
import SpinningLogo from '../components/SpinningLogo';
import { SERVER } from '@env'; // Update import statement

const FindingPharmaciesScreen = ({ route, navigation }) => {
  const { medication, dosage, location } = route.params;

  useEffect(() => {
    console.log('SERVER:', SERVER)
    const findPharmacies = async () => {
      try {
        // Simulate a delay before making the API call
        await new Promise(resolve => setTimeout(resolve, 1000));
  
        const response = await fetch(`https://${SERVER}/search/find-pharmacies`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ location, medication, dosage }),
        });
  
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
  
        const data = await response.json();
  
        if (data.status === 'Medication Available') {
          navigation.navigate('Results', { medication, dosage, location, pharmacy: data.pharmacy });
        } else if (data.status === 'No Medication Available') {
          navigation.navigate('NoResults', { medication, dosage, location, pharmacies: data.pharmacies });
        } else {
          navigation.navigate('StartCalling', { medication, dosage, location, pharmacies: data.pharmacies });
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to find pharmacies. Please try again later.');
        console.log('Error:', error);
      }
    };
  
    findPharmacies();
  }, [location, medication, dosage, navigation]);
  
  

  return (
    <Screen>
      <View style={styles.container}>
        <SpinningLogo />
        <View style={styles.textContainer}>
          <Subtitle text="Finding pharmacies near you..." style={styles.subtitle} />
        </View>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  textContainer: {
    position: 'absolute',
    top: '10%',
    alignItems: 'center',
  },
  subtitle: {
    subtitle: {
      fontSize: 36,
      color: '#fa8b6c',
      textAlign: 'center',
      fontFamily: 'Poppins',
      fontWeight: '600',
      lineHeight: 44, // Adjust this line height for better spacing
    },
  },
});

export default FindingPharmaciesScreen;
