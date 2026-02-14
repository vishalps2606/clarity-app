import "./global.css"; // <--- IMPORT THIS at the very top
import { StatusBar } from 'expo-status-bar';
import { Text, View, TouchableOpacity } from 'react-native';

export default function App() {
  return (
    <View className="flex-1 bg-void items-center justify-center">
      <StatusBar style="light" />
      
      {/* Background Glow */}
      <View className="absolute w-64 h-64 bg-neon-blue rounded-full blur-[80px] opacity-20" />

      <Text className="text-4xl font-bold text-neon-blue tracking-widest mb-2">
        CLARITY
      </Text>
      
      <Text className="text-text-secondary font-mono mb-10">
        MOBILE UPLINK ONLINE
      </Text>

      <TouchableOpacity className="bg-surface border border-neon-blue px-8 py-4 rounded-lg active:bg-neon-blue/20">
        <Text className="text-neon-blue font-bold">INITIALIZE</Text>
      </TouchableOpacity>
    </View>
  );
}