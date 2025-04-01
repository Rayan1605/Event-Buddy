// import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, Text, View } from 'react-native'
import { useState } from 'react'

const Stack = createNativeStackNavigator()

export default App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Welcome' }}
        />
        <Stack.Screen
          name="Fetch"
          component={FetchScreen}
        />
        <Stack.Screen
          name="ViewProduct"
          component={ViewProductScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

const HomeScreen = ({ navigation }) => {
  return (
    <View>
      <Button
        title="Go to Fetch Screen"
        onPress={() => navigation.navigate('Fetch')
        }
      />
      <Button
        title="Go to View Product Screen"
        onPress={() => navigation.navigate('ViewProduct')
        }
      />
    </View>
  )
}

const ViewProductScreen = ({ navigation }) => {
  const [productData, setProductData] = useState({name: '', price: '', ourId: ''})

  const callAPI = async () => {
    try {
      const res = await fetch(
        `https://0306-193-1-57-1.ngrok-free.app/getSpecificProduct`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            "ngrok-skip-browser-warning": "69420" // See: https://stackoverflow.com/questions/73017353/how-to-bypass-ngrok-browser-warning
          },
          body: JSON.stringify({ ourId: '1' }) // Need to use POST to send body
        }
      )
      const data = await res.json()
      console.log(data)
      setProductData(data.theProduct)
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <View>
      <Text>{'Product Name: ' + productData.name}</Text>
      <Text>{'Product ID: ' + productData.ourId}</Text>
      <Text>{'Product Price: ' + productData.price}</Text>
      <Button
        title="Get product details" onPress={async () => { callAPI() }}
      />
    </View>
  )
}

const FetchScreen = ({ navigation }) => {
  const [text, setText] = useState('. . . waiting for fetch API')

  const callAPI = async () => {
    try {
      const res = await fetch(
        `https://a9ee-193-1-57-1.ngrok-free.app`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            "ngrok-skip-browser-warning": "69420" // See: https://stackoverflow.com/questions/73017353/how-to-bypass-ngrok-browser-warning
          },
          body: JSON.stringify({ ourId: '1' }) // Need to use POST to send body
        }
      )
      const data = await res.json()
      //  console.log(data)
      setText(JSON.stringify(data))
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <View>
      <Text>{text}</Text>
      <Button
        title="Go Fetch Some Data" onPress={async () => { callAPI() }}
      />
    </View>
  )
}