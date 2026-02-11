import { Tabs } from 'expo-router';
import { ListTodo, History, Archive, Flag } from 'lucide-react-native';
import { Platform } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1d5564',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          backgroundColor: '#fffef7',
          borderTopWidth: 3,
          borderTopColor: '#1d5564',
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          height: Platform.OS === 'ios' ? 80 : 70,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: 'Cute Dino',
          fontWeight: '700',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'DO IT',
          tabBarIcon: ({ size, color }) => (
            <ListTodo size={size} color={color} strokeWidth={3} />
          ),
        }}
      />
      <Tabs.Screen
        name="now"
        options={{
          title: 'NOW!',
          tabBarIcon: ({ size, color }) => (
            <Flag size={size} color={color} strokeWidth={3} fill={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="work"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="projects"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="life"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="own"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'PAST',
          tabBarIcon: ({ size, color }) => (
            <History size={size} color={color} strokeWidth={3} />
          ),
        }}
      />
      <Tabs.Screen
        name="archive"
        options={{
          title: 'DONE',
          tabBarIcon: ({ size, color }) => (
            <Archive size={size} color={color} strokeWidth={3} />
          ),
        }}
      />
    </Tabs>
  );
}
