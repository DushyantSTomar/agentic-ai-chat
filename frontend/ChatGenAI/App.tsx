import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import GenIA from './GenIA'
const SESSION_ID = "user-123";
const App = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <GenIA />
    </SafeAreaView>
  )
}

export default App