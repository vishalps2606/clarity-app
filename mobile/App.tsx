import { StatusBar } from 'expo-status-bar';
import { Text, View, TouchableOpacity } from 'react-native';
import { styled } from 'nativewind';

// NativeWind wrappers
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledButton = styled(TouchableOpacity);

export default function App() {
  return (
    <StyledView className="flex-1 bg-void items-center justify-center">
      <StatusBar style="light" />
      
      {/* Background Glow */}
      <StyledView className="absolute w-64 h-64 bg-neon-blue rounded-full blur-[80px] opacity-20" />

      <StyledText className="text-4xl font-bold text-neon-blue tracking-widest mb-2">
        CLARITY
      </StyledText>
      
      <StyledText className="text-text-secondary font-mono mb-10">
        MOBILE UPLINK ONLINE
      </StyledText>

      <StyledButton className="bg-surface border border-neon-blue px-8 py-4 rounded-lg">
        <StyledText className="text-neon-blue font-bold">INITIALIZE</StyledText>
      </StyledButton>
    </StyledView>
  );
}