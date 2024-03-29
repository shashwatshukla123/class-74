import React from 'react';
import { StyleSheet, Text, View,Image } from 'react-native';
import SearchScreens from './screens/SearchScreens';
import BookTransationScreen from './screens/BookTransationScreen';
import {createAppContainer} from 'react-navigation';
import {createBottomTabNavigator} from 'react-navigation-tabs';

export default class App extends React.Component{
  render(){
    return(
    <AppContainer/>
    )
  }
}

const TabNavigator=createBottomTabNavigator({
  transaction:{screen:BookTransationScreen},
  search:{screen:SearchScreens}
},

{
  defaultNavigationOptions:({navigation})=>({
    tabBarIcon:()=>{
      const routeName=navigation.state.routeName
      if(routeName=='transaction'){
        return(
          <Image 
          source={require('./assets/book.png')}
          style={{width:40,height:40}}/>
        )
      }
      else if(routeName=='search'){
        return(
          <Image
          source={require('./assets/searchingbook.png')}
          style={{width:40,height:40}}/>
        )
      }
    }
  })
})
const AppContainer=createAppContainer(TabNavigator)