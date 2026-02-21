import React, { useEffect } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { Stack } from 'expo-router';
import { Colors } from '../src/constants/theme';
import { useTicketStore } from '../src/stores';
import { TicketBuilder } from '../src/components/ticket/TicketBuilder';

export default function TicketScreen() {
  const { loadCurrentTicket, loadTickets } = useTicketStore();

  useEffect(() => {
    loadCurrentTicket();
    loadTickets();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Mon Ticket',
          headerStyle: { backgroundColor: Colors.backgroundPrimary },
          headerTintColor: Colors.textPrimary,
        }}
      />
      <View style={styles.content}>
        <TicketBuilder />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundPrimary,
  },
  content: {
    flex: 1,
  },
});
