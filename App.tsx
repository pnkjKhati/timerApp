import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Image,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import notifee, {AndroidImportance} from '@notifee/react-native';

const App = () => {
  // Initial state for timers
  const [timers, setTimers] = useState([
    {id: 1, time: 5, isRunning: false},
    {id: 2, time: 120, isRunning: false},
  ]);

  // Get permission to display notifications
  useEffect(() => {
    (async function getPermission() {
      await notifee.requestPermission();
    })();
  }, []);

  // Timer countdown logic, runs every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(prevTimers =>
        prevTimers.map(timer =>
          timer.isRunning && timer.time > 0
            ? {...timer, time: timer.time - 1}
            : timer,
        ),
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [timers]);

  // Toggle between Play and Pause
  const handlePlayPause = (id: number) => {
    setTimers(
      timers.map(timer =>
        timer.id === id ? {...timer, isRunning: !timer.isRunning} : timer,
      ),
    );
  };

  // Reset timer to 0 and stop it
  const resetTimer = (id: number) => {
    setTimers(
      timers.map(timer =>
        timer.id === id ? {...timer, time: 0, isRunning: false} : timer,
      ),
    );
  };

  // Update timer value manually through TextInput
  const updateTime = (id: number, time: number) => {
    setTimers(
      timers.map(timer => (timer.id === id ? {...timer, time} : timer)),
    );
  };

  // Delete the selected timer
  const deleteTimer = (id: number) => {
    setTimers(timers.filter(timer => timer.id !== id));
  };

  // Check if any timer has finished (reaches 0) and notify the user
  useEffect(() => {
    timers.forEach(timer => {
      if (timer.time === 0 && timer.isRunning) {
        notifyUser(timer.id);
        handlePlayPause(timer.id);
      }
    });
  }, [timers]);

  // Function to trigger notification when the timer finishes
  const notifyUser = async (id: number) => {
    await notifee.requestPermission();

    const channelId = await notifee.createChannel({
      id: `${id}`,
      name: 'Default Channel',
    });

    await notifee.displayNotification({
      title: "Time's Up",
      body: `Timer ${id} has been completed`,
      android: {
        channelId,
        importance: AndroidImportance.HIGH,
      },
    });
  };

  // Add a new timer (maximum 5 timers)
  const addTimer = () => {
    if (timers.length < 5) {
      const newTimer = {id: timers.length + 1, time: 60, isRunning: false};
      setTimers([...timers, newTimer]);
    }
  };

  return (
    <View style={styles.container}>
      {/* Add Timer Button */}
      <TouchableOpacity style={styles.addButton} onPress={addTimer}>
        <Text style={styles.addButtonText}>Add Timer</Text>
      </TouchableOpacity>

      {/* List of Timers */}
      {timers.map(timer => (
        <View key={timer.id} style={styles.timer}>
          <Text
            style={
              styles.timerText
            }>{`Timer ${timer.id}: ${timer.time}s`}</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={String(timer.time)}
            editable={!timer.isRunning} // Disable input while the timer is running
            onChangeText={time => updateTime(timer.id, Number(time))}
          />

          {/* Play/Pause Button */}
          <TouchableOpacity
            style={styles.button}
            onPress={() => handlePlayPause(timer.id)}>
            <Image
              source={
                !timer.isRunning
                  ? require('./assets/play.png')
                  : require('./assets/pause.png')
              }
              style={styles.icon}
            />
          </TouchableOpacity>

          {/* Reset Button */}
          <TouchableOpacity
            style={styles.button}
            onPress={() => resetTimer(timer.id)}>
            <Image source={require('./assets/reset.png')} style={styles.icon} />
          </TouchableOpacity>

          {/* Delete Button */}
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => deleteTimer(timer.id)}>
            <Image
              source={require('./assets/delete.png')}
              style={styles.icon}
            />
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f4f4f4',
  },
  timer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  timerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  input: {
    width: 50,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    textAlign: 'center',
    marginRight: 10,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  deleteButton: {
    backgroundColor: '#f44336',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 20,
    alignSelf: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  icon: {
    width: 15,
    height: 15,
    tintColor: '#fff',
  },
});
